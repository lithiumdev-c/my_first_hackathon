"""
Скрипт для ПОЛНОГО сброса и пересоздания базы данных
ВНИМАНИЕ: Удаляет ВСЕ данные!
Запустите: python reset_database.py
"""

import os
import sys

def reset_database():
    """Полное удаление и пересоздание базы данных"""
    
    db_file = "ecogallery.db"
    journal_file = "ecogallery.db-journal"
    
    print("⚠️  ВНИМАНИЕ: Этот скрипт удалит ВСЕ данные из базы!")
    confirm = input("Продолжить? (yes/no): ").strip().lower()
    
    if confirm != 'yes':
        print("❌ Отменено")
        return
    
    # Удаляем файлы БД
    files_deleted = []
    
    if os.path.exists(db_file):
        print(f"🗑️  Удаление: {db_file}")
        os.remove(db_file)
        files_deleted.append(db_file)
    
    if os.path.exists(journal_file):
        print(f"🗑️  Удаление: {journal_file}")
        os.remove(journal_file)
        files_deleted.append(journal_file)
    
    if not files_deleted:
        print("ℹ️  База данных не найдена")
    else:
        print(f"✅ Удалено файлов: {len(files_deleted)}")
    
    # Теперь создаём новую БД через импорт моделей
    print("\n🔄 Создание новой базы данных...")
    
    try:
        from database import Base, engine
        from models import User  # Импортируем модели
        
        # Создаём все таблицы
        Base.metadata.create_all(bind=engine)
        
        # Проверяем результат
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"\n✅ База данных создана успешно!")
        print(f"📋 Созданные таблицы: {tables}")
        
        # Показываем структуру таблицы users
        if 'users' in tables:
            print("\n🗂️  Структура таблицы users:")
            columns = inspector.get_columns('users')
            for col in columns:
                print(f"  • {col['name']}: {col['type']}")
        
        print("\n✅ Готово! Теперь запустите сервер:")
        print("   python main.py")
        
    except Exception as e:
        print(f"\n❌ Ошибка при создании БД: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    reset_database()