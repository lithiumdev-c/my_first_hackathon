from sqlalchemy import Column, Integer, String, Text, ForeignKey
from database import Base

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    eco_coins = Column(Integer, default=0)

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    reward = Column(Integer, default=0)
    s3_key = Column(String(512), nullable=False)
    url = Column(String(512), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)