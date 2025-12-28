
from sqlalchemy import create_engine, text
from database import DB_URL

engine = create_engine(DB_URL)

def migrate():
    with engine.connect() as conn:
        try:
            # Добавляем поле eco_coins в таблицу users если его нет
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS eco_coins INTEGER DEFAULT 0
            """))
            print("✅ Добавлено поле eco_coins в таблицу users")
        except Exception as e:
            print(f"⚠️ Поле eco_coins уже существует или ошибка: {e}")
        
        try:
            # Добавляем поле user_id в таблицу images если его нет
            conn.execute(text("""
                ALTER TABLE images 
                ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL DEFAULT 1
            """))
            print("✅ Добавлено поле user_id в таблицу images")
        except Exception as e:
            print(f"⚠️ Поле user_id уже существует или ошибка: {e}")
        
        conn.commit()
        print("✅ Миграция завершена!")

if __name__ == "__main__":
    migrate()