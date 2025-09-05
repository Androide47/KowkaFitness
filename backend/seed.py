import json
from settings.database import SessionLocal, engine
from models.users import User
from passlib.context import CryptContext
from models.fitness import Workout, Appointment, BlockedTime, Message, ProgressEntry, Exercise
from sqlalchemy.orm import Session


bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed_users(db: Session):
    # Minimal trainer and clients from mocks/users.ts
    # IDs are strings in the app; keep them as strings in related tables
    users = [
        {
            "id": "trainer-1", "username": "alex", "email": "alex@fitnesscoach.com",
            "first_name": "Alex", "last_name": "Johnson", "role": "trainer",
            "hashed_password": bcrypt_context.hash("password"),
        },
        {"id": "client-1", "username": "sarah", "email": "sarah@example.com", "first_name": "Sarah", "last_name": "Miller", "role": "client", "hashed_password": bcrypt_context.hash("password")},
        {"id": "client-2", "username": "mike", "email": "mike@example.com", "first_name": "Mike", "last_name": "Chen", "role": "client", "hashed_password": bcrypt_context.hash("password")},
        {"id": "client-3", "username": "emma", "email": "emma@example.com", "first_name": "Emma", "last_name": "Wilson", "role": "client", "hashed_password": bcrypt_context.hash("password")},
    ]
    # Insert ignoring duplicates by email/username
    for u in users:
        exists = db.query(User).filter(User.email == u["email"]).first()
        if exists:
            continue
        obj = User(
            username=u["username"], email=u["email"], first_name=u["first_name"],
            last_name=u["last_name"], role=u["role"], hashed_password=u["hashed_password"],
            is_active=True,
        )
        db.add(obj)
    db.commit()


def seed_workouts(db: Session):
    data = {
        "workouts": [
            {
                "id": "workout-1",
                "name": "Full Body Strength",
                "description": "A comprehensive workout targeting all major muscle groups for overall strength development.",
                "exercises": [
                    {"exerciseId": "ex-1", "sets": 4, "reps": 10, "restTime": 90, "notes": "Focus on proper form and depth"},
                    {"exerciseId": "ex-3", "sets": 3, "reps": 8, "restTime": 120, "notes": "Keep back straight throughout the movement"},
                    {"exerciseId": "ex-4", "sets": 3, "reps": 12, "restTime": 60, "notes": "Control the weight on the way down"},
                    {"exerciseId": "ex-6", "sets": 3, "reps": 15, "restTime": 45, "notes": "Squeeze at the top of the movement"},
                    {"exerciseId": "ex-5", "sets": 3, "duration": 60, "restTime": 30, "notes": "Keep core engaged and maintain a straight line"},
                ],
                "createdAt": "2023-05-01T00:00:00.000Z",
                "createdBy": "trainer-1",
                "duration": 60,
                "difficulty": "intermediate",
            },
            {
                "id": "workout-2",
                "name": "HIIT Cardio Blast",
                "description": "High-intensity interval training to boost cardiovascular fitness and burn calories.",
                "exercises": [
                    {"exerciseId": "ex-8", "sets": 4, "duration": 45, "restTime": 15, "notes": "Maintain a quick pace"},
                    {"exerciseId": "ex-2", "sets": 4, "reps": 15, "restTime": 15, "notes": "Modify to knee push-ups if needed"},
                    {"exerciseId": "ex-5", "sets": 4, "duration": 45, "restTime": 15, "notes": "Hold position steady"},
                ],
                "createdAt": "2023-05-10T00:00:00.000Z",
                "createdBy": "trainer-1",
                "duration": 30,
                "difficulty": "advanced",
            },
            {
                "id": "workout-3",
                "name": "Upper Body Focus",
                "description": "Targeted workout for chest, back, shoulders, and arms.",
                "exercises": [
                    {"exerciseId": "ex-2", "sets": 4, "reps": 12, "restTime": 60, "notes": "Full range of motion"},
                    {"exerciseId": "ex-4", "sets": 4, "reps": 10, "restTime": 60, "notes": "Keep core engaged"},
                    {"exerciseId": "ex-6", "sets": 3, "reps": 12, "restTime": 45, "notes": "Control the movement"},
                    {"exerciseId": "ex-7", "sets": 3, "reps": 15, "restTime": 45, "notes": "Lower slowly"},
                ],
                "createdAt": "2023-05-15T00:00:00.000Z",
                "createdBy": "trainer-1",
                "duration": 45,
                "difficulty": "intermediate",
            },
        ]
    }
    for item in data["workouts"]:
        exists = db.query(Workout).filter(Workout.id == item["id"]).first()
        if exists:
            continue
        obj = Workout(
            id=item["id"], name=item["name"], description=item["description"],
            exercises=item["exercises"], createdAt=item["createdAt"], createdBy=item["createdBy"],
            duration=item["duration"], difficulty=item["difficulty"],
        )
        db.add(obj)
    db.commit()


def seed_appointments(db: Session):
    appointments = [
        {"id": "apt-1", "trainerId": "trainer-1", "clientId": "client-1", "title": "Strength Assessment", "description": "Initial strength assessment to establish baseline and set goals", "startTime": "2023-06-20T10:00:00.000Z", "endTime": "2023-06-20T11:00:00.000Z", "status": "scheduled", "location": "Main Gym - Station 3", "notes": "Bring comfortable workout clothes and water"},
        {"id": "apt-2", "trainerId": "trainer-1", "clientId": "client-2", "title": "Nutrition Consultation", "description": "Review current diet and make adjustments to support muscle gain", "startTime": "2023-06-21T14:00:00.000Z", "endTime": "2023-06-21T15:00:00.000Z", "status": "scheduled", "location": "Online - Zoom", "notes": "Please complete the food diary before our meeting"},
        {"id": "apt-3", "trainerId": "trainer-1", "clientId": "client-3", "title": "Flexibility Workshop", "description": "Focus on improving hip and shoulder mobility", "startTime": "2023-06-22T16:00:00.000Z", "endTime": "2023-06-22T17:00:00.000Z", "status": "scheduled", "location": "Studio Room - Floor 2", "notes": "Wear loose, comfortable clothing"},
        {"id": "apt-4", "trainerId": "trainer-1", "clientId": "client-1", "title": "Progress Check-in", "description": "Monthly progress review and program adjustment", "startTime": "2023-07-05T11:00:00.000Z", "endTime": "2023-07-05T12:00:00.000Z", "status": "scheduled", "location": "Office - Room 2B", "notes": "Bring your tracking journal"},
    ]
    for item in appointments:
        exists = db.query(Appointment).filter(Appointment.id == item["id"]).first()
        if exists:
            continue
        db.add(Appointment(**item))
    db.commit()


def seed_messages(db: Session):
    messages = [
        {"id": "msg-1", "senderId": "trainer-1", "receiverId": "client-1", "content": "Hi Sarah, how are you feeling after yesterday's workout? Any soreness or issues to report?", "timestamp": "2023-06-15T09:00:00.000Z", "read": True},
        {"id": "msg-2", "senderId": "client-1", "receiverId": "trainer-1", "content": "Morning Alex! I'm feeling good, just a bit of soreness in my quads but nothing too bad. The new squat form really helped!", "timestamp": "2023-06-15T09:15:00.000Z", "read": True},
        {"id": "msg-3", "senderId": "trainer-1", "receiverId": "client-1", "content": "That's great to hear! The soreness is normal and should subside in a day or two. Remember to stay hydrated and get enough protein today. Looking forward to our session tomorrow!", "timestamp": "2023-06-15T09:20:00.000Z", "read": True},
        {"id": "msg-4", "senderId": "trainer-1", "receiverId": "client-2", "content": "Hey Mike, just checking in. How's your progress with the new nutrition plan?", "timestamp": "2023-06-15T10:00:00.000Z", "read": True},
        {"id": "msg-5", "senderId": "client-2", "receiverId": "trainer-1", "content": "It's going well! I've been consistent with my meals and hitting my protein targets. Energy levels are definitely up during workouts.", "timestamp": "2023-06-15T10:30:00.000Z", "read": True},
        {"id": "msg-6", "senderId": "trainer-1", "receiverId": "client-3", "content": "Emma, don't forget to log your stretching routine today. How's your flexibility improving?", "timestamp": "2023-06-15T11:00:00.000Z", "read": False},
    ]
    for item in messages:
        exists = db.query(Message).filter(Message.id == item["id"]).first()
        if exists:
            continue
        db.add(Message(**item))
    db.commit()


def seed_progress(db: Session):
    entries = [
        {"id": "prog-1", "clientId": "client-1", "date": "2023-05-01T00:00:00.000Z", "type": "measurement", "measurements": {"date": "2023-05-01T00:00:00.000Z", "weight": 68, "bodyFat": 24, "waist": 30, "hips": 38, "notes": "Starting measurements"}},
        {"id": "prog-2", "clientId": "client-1", "date": "2023-05-01T00:00:00.000Z", "type": "photo", "photos": ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"]},
        {"id": "prog-3", "clientId": "client-1", "date": "2023-06-01T00:00:00.000Z", "type": "measurement", "measurements": {"date": "2023-06-01T00:00:00.000Z", "weight": 65, "bodyFat": 22, "waist": 28, "hips": 36, "notes": "One month progress - feeling stronger!"}},
        {"id": "prog-4", "clientId": "client-1", "date": "2023-06-01T00:00:00.000Z", "type": "photo", "photos": ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"]},
        {"id": "prog-5", "clientId": "client-1", "date": "2023-06-10T00:00:00.000Z", "type": "note", "notes": "Completed a 5k run without stopping for the first time! Feeling really proud of this achievement."},
        {"id": "prog-6", "clientId": "client-2", "date": "2023-05-15T00:00:00.000Z", "type": "measurement", "measurements": {"date": "2023-05-15T00:00:00.000Z", "weight": 80, "bodyFat": 20, "chest": 40, "waist": 34, "arms": 13, "notes": "Initial measurements"}},
        {"id": "prog-7", "clientId": "client-2", "date": "2023-06-15T00:00:00.000Z", "type": "measurement", "measurements": {"date": "2023-06-15T00:00:00.000Z", "weight": 78, "bodyFat": 18, "chest": 42, "waist": 32, "arms": 14, "notes": "One month progress - seeing good muscle development"}},
    ]
    for item in entries:
        exists = db.query(ProgressEntry).filter(ProgressEntry.id == item["id"]).first()
        if exists:
            continue
        db.add(ProgressEntry(**item))
    db.commit()


def run():
    db = SessionLocal()
    try:
        seed_users(db)
        # seed exercises
        exercises = [
            {"id": "ex-1", "name": "Barbell Squat", "description": "A compound exercise that targets the quadriceps, hamstrings, and glutes. Stand with feet shoulder-width apart, barbell across upper back, and squat down until thighs are parallel to the ground.", "videoUrl": "https://example.com/videos/barbell-squat.mp4", "imageUrl": "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80", "category": "Legs", "equipment": ["Barbell", "Squat Rack"], "difficulty": "intermediate"},
            {"id": "ex-2", "name": "Push-up", "description": "A bodyweight exercise that targets the chest, shoulders, and triceps. Start in a plank position with hands slightly wider than shoulder-width apart, lower your body until your chest nearly touches the floor, then push back up.", "videoUrl": "https://example.com/videos/push-up.mp4", "imageUrl": "https://images.unsplash.com/photo-1598971639058-a9aea1613ece?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80", "category": "Chest", "equipment": [], "difficulty": "beginner"},
            {"id": "ex-3", "name": "Deadlift", "description": "A compound exercise that targets the lower back, glutes, and hamstrings. Stand with feet hip-width apart, bend at the hips and knees to grip the barbell, then stand up straight while keeping the barbell close to your body.", "videoUrl": "https://example.com/videos/deadlift.mp4", "imageUrl": "https://images.unsplash.com/photo-1598266663439-2056e6900339?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80", "category": "Back", "equipment": ["Barbell"], "difficulty": "advanced"},
            {"id": "ex-4", "name": "Dumbbell Shoulder Press", "description": "An exercise that targets the shoulders and triceps. Sit or stand with a dumbbell in each hand at shoulder height, then press the weights upward until your arms are fully extended.", "videoUrl": "https://example.com/videos/shoulder-press.mp4", "imageUrl": "https://images.unsplash.com/photo-1581009137042-c552e485697a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80", "category": "Shoulders", "equipment": ["Dumbbells"], "difficulty": "intermediate"},
            {"id": "ex-5", "name": "Plank", "description": "A core exercise that also engages the shoulders, arms, and glutes. Start in a push-up position but with your weight on your forearms, hold your body in a straight line from head to heels.", "videoUrl": "https://example.com/videos/plank.mp4", "imageUrl": "https://images.unsplash.com/photo-1566241142248-11865261e0b9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80", "category": "Core", "equipment": [], "difficulty": "beginner"},
            {"id": "ex-6", "name": "Bicep Curl", "description": "An isolation exercise that targets the biceps. Stand with a dumbbell in each hand, arms fully extended, then curl the weights up toward your shoulders while keeping your upper arms stationary.", "videoUrl": "https://example.com/videos/bicep-curl.mp4", "imageUrl": "https://images.unsplash.com/photo-1581009137363-edd29a6f335b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80", "category": "Arms", "equipment": ["Dumbbells"], "difficulty": "beginner"},
            {"id": "ex-7", "name": "Tricep Dip", "description": "An exercise that targets the triceps. Sit on the edge of a bench with hands gripping the edge, slide your butt off the bench, lower your body by bending your elbows, then push back up.", "videoUrl": "https://example.com/videos/tricep-dip.mp4", "imageUrl": "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80", "category": "Arms", "equipment": ["Bench"], "difficulty": "intermediate"},
            {"id": "ex-8", "name": "Mountain Climber", "description": "A dynamic exercise that targets the core, shoulders, and legs. Start in a push-up position, then alternately bring each knee toward your chest in a running motion.", "videoUrl": "https://example.com/videos/mountain-climber.mp4", "imageUrl": "https://images.unsplash.com/photo-1598971639058-a9aea1613ece?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80", "category": "Cardio", "equipment": [], "difficulty": "intermediate"},
        ]
        for ex in exercises:
            exists = db.query(Exercise).filter(Exercise.id == ex["id"]).first()
            if exists:
                continue
            db.add(Exercise(**ex))
        db.commit()
        seed_workouts(db)
        seed_appointments(db)
        seed_messages(db)
        seed_progress(db)
    finally:
        db.close()


if __name__ == "__main__":
    run()


