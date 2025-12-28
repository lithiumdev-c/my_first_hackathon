import os
import uuid
import shutil
from typing import Optional, List
from datetime import datetime, timedelta, timezone

import uvicorn
from ultralytics import YOLO
import cv2
import numpy as np
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal, engine, Base
from models import User, Image as DBImage
from pydantic import BaseModel, ConfigDict

# --- ИНИЦИАЛИЗАЦИЯ И НАСТРОЙКИ ---
Base.metadata.create_all(bind=engine)
app = FastAPI()

SECRET_KEY = "your-very-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080
IMAGES_DIR = "images"
os.makedirs(IMAGES_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Настройки YOLO и Эко-логики
try:
    yolo_model = YOLO("yolov8n.pt")
except Exception as e:
    print(f"⚠️ Ошибка загрузки YOLO: {e}")
    yolo_model = None

# Маппинг объектов YOLO в категории вознаграждения
ECO_MAP = {
    "bottle": "trash",      # Пластиковые бутылки
    "cup": "trash",         # Стаканчики
    "can": "trash",         # Консервные банки
    "wine glass": "trash",  # Стекло
    "potted plant": "plant",# Комнатные растения
    "broccoli": "plant",    # Иногда распознает зелень так
    "bird": "animal",       # Можно добавить бонусы за животных
}

ECO_REWARD = {
    "trash": 20,
    "plant": 25,
    "tree": 50,
    "animal": 15,
    "person": 5,
}

# --- СХЕМЫ (Pydantic) ---
class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: Optional[str]
    reward: int
    url: str

class PurchaseRequest(BaseModel):
    item_id: int
    price: int

# --- ЗАВИСИМОСТИ (ОБЯЗАТЕЛЬНО ВЫШЕ ЭНДПОИНТОВ) ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Невалидный токен",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- ЛОГИКА АНАЛИЗА ---

def analyze_image_logic(file_path: str):
    if not yolo_model:
        return 0, "Модель не загружена"
    
    # 1. Запуск YOLO (снижаем порог до 0.2 для лучшего обнаружения)
    results = yolo_model.predict(file_path, conf=0.2, verbose=False)
    
    total_reward = 0
    detected_labels = []

    # Обработка объектов от YOLO
    for r in results:
        for box in r.boxes:
            label = yolo_model.names[int(box.cls[0])].lower()
            
            # Проверяем по ECO_MAP (мусор, растения в горшках и т.д.)
            eco_cat = ECO_MAP.get(label)
            if eco_cat:
                reward = ECO_REWARD.get(eco_cat, 0)
                total_reward += reward
                detected_labels.append(f"{label} (+{reward})")
            
            # Если нашли человека, тоже добавим в список (базовые 5 баллов)
            elif label == "person":
                reward = ECO_REWARD.get("person", 5)
                total_reward += reward
                detected_labels.append(f"activist (+{reward})")

    # 2. АНАЛИЗ ЗЕЛЕНИ (Деревья и газон)
    img = cv2.imread(file_path)
    if img is not None:
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Расширенный диапазон зеленого (захватывает и хвою, и траву)
        lower_green = np.array([35, 30, 30]) 
        upper_green = np.array([90, 255, 255])
        
        mask = cv2.inRange(hsv, lower_green, upper_green)
        green_pixel_count = np.count_nonzero(mask)
        green_pct = (green_pixel_count / mask.size) * 100

        # Если зеленого больше 10% — это точно эко-локация
        if green_pct > 10:
            tree_reward = 30
            total_reward += tree_reward
            detected_labels.append(f"greenery {int(green_pct)}% (+{tree_reward})")

    # 3. ИТОГОВЫЙ ОТВЕТ
    if total_reward == 0:
        # Если YOLO что-то видела, но не экологическое (например, машину)
        raw_detected = [yolo_model.names[int(b.cls[0])] for r in results for b in r.boxes]
        seen = ", ".join(set(raw_detected)) if raw_detected else "ничего"
        return 0, f"Эко-объекты не найдены (увидел: {seen}). Попробуйте другой ракурс."

    # Убираем дубликаты из названий для красивого вывода
    summary = ", ".join(detected_labels)
    return total_reward, f"Обнаружено: {summary}. Итого: {total_reward} EcoCoins."
# --- ЭНДПОИНТЫ ---

@app.post("/register", response_model=Token)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Пользователь уже существует")
    new_user = User(
        username=user_in.username,
        hashed_password=pwd_context.hash(user_in.password),
        eco_coins=0
    )
    db.add(new_user)
    db.commit()
    token = create_access_token({"sub": new_user.username})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/user/balance")
async def get_balance(current_user: User = Depends(get_current_user)):
    return {"eco_coins": current_user.eco_coins or 0, "username": current_user.username}

@app.get("/verify-token")
async def verify_token(current_user: User = Depends(get_current_user)):
    return {"status": "ok", "id": current_user.id}

@app.post("/images", response_model=ImageResponse)
async def upload_image(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(IMAGES_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Запуск анализа
    reward, auto_desc = analyze_image_logic(file_path)
    
    final_desc = f"{description} | {auto_desc}" if description else auto_desc

    new_img = DBImage(
        title=title,
        description=final_desc,
        reward=reward,
        s3_key=filename,
        url=f"http://localhost:8000/static/{filename}",
        user_id=current_user.id
    )
    
    current_user.eco_coins = (current_user.eco_coins or 0) + reward
    db.add(new_img)
    db.commit()
    db.refresh(new_img)
    return new_img

@app.get("/images", response_model=List[ImageResponse])
async def get_my_images(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(DBImage).filter(DBImage.user_id == current_user.id).order_by(DBImage.id.desc()).all()

@app.delete("/images/{image_id}")
async def delete_image(
    image_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    img = db.query(DBImage).filter(DBImage.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Фото не найдено")
    if img.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нельзя удалять чужие фото")

    # Удаляем файл
    file_path = os.path.join(IMAGES_DIR, img.s3_key)
    if os.path.exists(file_path):
        os.remove(file_path)

    # Вычитаем баллы при удалении (по желанию)
    current_user.eco_coins = max(0, (current_user.eco_coins or 0) - img.reward)
    
    db.delete(img)
    db.commit()
    return {"detail": "Удалено успешно"}

app.mount("/static", StaticFiles(directory=IMAGES_DIR), name="static")

@app.post("/shop/buy")
async def buy_item(
    request: PurchaseRequest, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.eco_coins < request.price:
        raise HTTPException(
            status_code=400, 
            detail=f"Недостаточно EcoCoins. У вас {current_user.eco_coins}, нужно {request.price}"
        )
    
    # Вычитаем баллы
    current_user.eco_coins -= request.price
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Покупка успешно завершена!", 
        "new_balance": current_user.eco_coins
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)