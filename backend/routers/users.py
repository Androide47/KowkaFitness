from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing_extensions import Annotated
from models.users import User
from settings.database import SessionLocal
from routers.auth import get_current_user
import shutil
import os
from pydantic import BaseModel
from pathlib import Path

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

# Create uploads directory if it doesn't exist
UPLOADS_DIR = Path("uploads/profile_pictures")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

class UpdateProfileRequest(BaseModel):
    username: str
    email: str
    first_name: str
    last_name: str

@router.get("/me", status_code=status.HTTP_200_OK)
async def get_user(user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user_model = db.query(User).filter(User.id == user["user_id"]).first()
    
    if user_model is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user_model.id,
        "username": user_model.username,
        "email": user_model.email,
        "first_name": user_model.first_name,
        "last_name": user_model.last_name,
        "role": user_model.role,
        "profile_picture": user_model.profile_picture
    }

@router.put("/profile", status_code=status.HTTP_200_OK)
async def update_profile(user: user_dependency, 
                        db: db_dependency,
                        profile_data: UpdateProfileRequest):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user_model = db.query(User).filter(User.id == user["user_id"]).first()
    
    if user_model is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if username already exists (if changed)
    if profile_data.username != user_model.username:
        existing_user = db.query(User).filter(User.username == profile_data.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email already exists (if changed)
    if profile_data.email != user_model.email:
        existing_user = db.query(User).filter(User.email == profile_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")
    
    user_model.username = profile_data.username
    user_model.email = profile_data.email
    user_model.first_name = profile_data.first_name
    user_model.last_name = profile_data.last_name
    
    db.commit()
    
    return {
        "id": user_model.id,
        "username": user_model.username,
        "email": user_model.email,
        "first_name": user_model.first_name,
        "last_name": user_model.last_name,
        "role": user_model.role,
        "profile_picture": user_model.profile_picture
    }

@router.post("/profile-picture", status_code=status.HTTP_200_OK)
async def upload_profile_picture(user: user_dependency, 
                               db: db_dependency,
                               file: UploadFile = File(...)):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user_model = db.query(User).filter(User.id == user["user_id"]).first()
    
    if user_model is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate file type
    valid_content_types = ["image/jpeg", "image/png", "image/gif"]
    if file.content_type not in valid_content_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and GIF are allowed.")
    
    # Create a unique filename
    file_extension = file.filename.split(".")[-1]
    filename = f"user_{user_model.id}.{file_extension}"
    file_path = UPLOADS_DIR / filename
    
    # Save the file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update the user's profile picture field
    user_model.profile_picture = f"/uploads/profile_pictures/{filename}"
    db.commit()
    
    return {"profile_picture": user_model.profile_picture}