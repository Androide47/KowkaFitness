from settings.database import Base
from sqlalchemy import Column, String, Integer, Boolean, Text
from sqlalchemy.dialects.sqlite import JSON


class Workout(Base):
    __tablename__ = 'workouts'
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    exercises = Column(JSON)  # List of workout exercises
    createdAt = Column(String)
    createdBy = Column(String)
    duration = Column(Integer)
    difficulty = Column(String)


class Appointment(Base):
    __tablename__ = 'appointments'
    id = Column(String, primary_key=True, index=True)
    trainerId = Column(String)
    clientId = Column(String)
    title = Column(String)
    description = Column(Text)
    startTime = Column(String)
    endTime = Column(String)
    status = Column(String)
    location = Column(String)
    notes = Column(Text)


class BlockedTime(Base):
    __tablename__ = 'blocked_times'
    id = Column(String, primary_key=True, index=True)
    trainerId = Column(String)
    startTime = Column(String)
    endTime = Column(String)
    isFullDay = Column(Boolean, default=False)
    reason = Column(String)


class Message(Base):
    __tablename__ = 'messages'
    id = Column(String, primary_key=True, index=True)
    senderId = Column(String)
    receiverId = Column(String)
    content = Column(Text)
    timestamp = Column(String)
    read = Column(Boolean, default=False)
    attachments = Column(JSON)  # List of attachments


class ProgressEntry(Base):
    __tablename__ = 'progress_entries'
    id = Column(String, primary_key=True, index=True)
    clientId = Column(String)
    date = Column(String)
    type = Column(String)  # 'photo' | 'measurement' | 'note'
    photos = Column(JSON)  # List of URLs
    measurements = Column(JSON)  # Measurements object
    notes = Column(Text)


class Exercise(Base):
    __tablename__ = 'exercises'
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    videoUrl = Column(String)
    imageUrl = Column(String)
    category = Column(String)
    equipment = Column(JSON)  # List of strings
    difficulty = Column(String)


