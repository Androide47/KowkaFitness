from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


router = APIRouter(
    prefix="/workouts",
    tags=["workouts"],
)


class WorkoutExercise(BaseModel):
    exerciseId: str
    sets: Optional[int] = None
    reps: Optional[int] = None
    duration: Optional[int] = None  # seconds
    weight: Optional[float] = None
    notes: Optional[str] = None
    restTime: Optional[int] = None  # seconds


class Workout(BaseModel):
    id: str
    name: str
    description: str
    exercises: List[WorkoutExercise]
    createdAt: str
    createdBy: str
    duration: int
    difficulty: str  # 'beginner' | 'intermediate' | 'advanced'


class CreateWorkoutRequest(BaseModel):
    name: str
    description: str
    exercises: List[WorkoutExercise]
    createdBy: str
    duration: int
    difficulty: str


class UpdateWorkoutRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    exercises: Optional[List[WorkoutExercise]] = None
    duration: Optional[int] = None
    difficulty: Optional[str] = None


# In-memory stores
WORKOUTS: List[Workout] = []
COMPLETED_WORKOUTS: List[dict] = []  # { id: str, userId: str, completedAt: str }


@router.get("/", response_model=List[Workout])
async def list_workouts():
    return WORKOUTS


@router.get("/{workout_id}", response_model=Workout)
async def get_workout(workout_id: str):
    for w in WORKOUTS:
        if w.id == workout_id:
            return w
    raise HTTPException(status_code=404, detail="Workout not found")


@router.post("/", response_model=Workout, status_code=status.HTTP_201_CREATED)
async def create_workout(payload: CreateWorkoutRequest):
    workout = Workout(
        id=f"wkt-{int(datetime.utcnow().timestamp()*1000)}",
        name=payload.name,
        description=payload.description,
        exercises=payload.exercises,
        createdAt=datetime.utcnow().isoformat(),
        createdBy=payload.createdBy,
        duration=payload.duration,
        difficulty=payload.difficulty,
    )
    WORKOUTS.append(workout)
    return workout


@router.put("/{workout_id}", response_model=Workout)
async def update_workout(workout_id: str, payload: UpdateWorkoutRequest):
    for idx, w in enumerate(WORKOUTS):
        if w.id == workout_id:
            updated = w.model_copy(update={
                **({"name": payload.name} if payload.name is not None else {}),
                **({"description": payload.description} if payload.description is not None else {}),
                **({"exercises": payload.exercises} if payload.exercises is not None else {}),
                **({"duration": payload.duration} if payload.duration is not None else {}),
                **({"difficulty": payload.difficulty} if payload.difficulty is not None else {}),
            })
            WORKOUTS[idx] = updated
            return updated
    raise HTTPException(status_code=404, detail="Workout not found")


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workout(workout_id: str):
    global WORKOUTS
    before = len(WORKOUTS)
    WORKOUTS = [w for w in WORKOUTS if w.id != workout_id]
    if len(WORKOUTS) == before:
        raise HTTPException(status_code=404, detail="Workout not found")
    return


class CompleteWorkoutRequest(BaseModel):
    userId: str


@router.post("/{workout_id}/complete", status_code=status.HTTP_200_OK)
async def complete_workout(workout_id: str, payload: CompleteWorkoutRequest):
    exists = any(w.id == workout_id for w in WORKOUTS)
    if not exists:
        raise HTTPException(status_code=404, detail="Workout not found")
    COMPLETED_WORKOUTS.append({
        "id": workout_id,
        "userId": payload.userId,
        "completedAt": datetime.utcnow().isoformat(),
    })
    return {"message": "Workout marked as completed"}


@router.get("/completed/{user_id}")
async def get_completed_workouts(user_id: str):
    return [c for c in COMPLETED_WORKOUTS if c["userId"] == user_id]


