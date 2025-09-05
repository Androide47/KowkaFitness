from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta


router = APIRouter(
    prefix="/calendar",
    tags=["calendar"],
)


class Appointment(BaseModel):
    id: str
    trainerId: str
    clientId: str
    title: str
    description: Optional[str] = None
    startTime: str
    endTime: str
    status: str  # 'scheduled' | 'completed' | 'cancelled'
    location: Optional[str] = None
    notes: Optional[str] = None


class CreateAppointmentRequest(BaseModel):
    trainerId: str
    clientId: str
    title: str
    description: Optional[str] = None
    startTime: str
    endTime: str
    location: Optional[str] = None
    notes: Optional[str] = None


class UpdateAppointmentRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class BlockedTime(BaseModel):
    id: str
    trainerId: str
    startTime: str
    endTime: str
    isFullDay: bool
    reason: Optional[str] = None


class CreateBlockedTimeRequest(BaseModel):
    trainerId: str
    startTime: str
    endTime: str
    isFullDay: bool = False
    reason: Optional[str] = None


APPOINTMENTS: List[Appointment] = []
BLOCKED_TIMES: List[BlockedTime] = []


@router.get("/appointments", response_model=List[Appointment])
async def list_appointments():
    return APPOINTMENTS


@router.get("/appointments/user/{user_id}", response_model=List[Appointment])
async def get_user_appointments(user_id: str):
    return [a for a in APPOINTMENTS if a.clientId == user_id or a.trainerId == user_id]


@router.get("/appointments/by-date")
async def get_appointments_by_date(date: str):
    target = datetime.fromisoformat(date)
    start = target.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    results = []
    for a in APPOINTMENTS:
        st = datetime.fromisoformat(a.startTime)
        if start <= st < end:
            results.append(a)
    return results


@router.post("/appointments", response_model=Appointment, status_code=status.HTTP_201_CREATED)
async def create_appointment(payload: CreateAppointmentRequest):
    appointment = Appointment(
        id=f"apt-{int(datetime.utcnow().timestamp()*1000)}",
        trainerId=payload.trainerId,
        clientId=payload.clientId,
        title=payload.title,
        description=payload.description,
        startTime=payload.startTime,
        endTime=payload.endTime,
        status="scheduled",
        location=payload.location,
        notes=payload.notes,
    )
    APPOINTMENTS.append(appointment)
    return appointment


@router.put("/appointments/{appointment_id}", response_model=Appointment)
async def update_appointment(appointment_id: str, payload: UpdateAppointmentRequest):
    for idx, a in enumerate(APPOINTMENTS):
        if a.id == appointment_id:
            updated = a.model_copy(update={
                **({"title": payload.title} if payload.title is not None else {}),
                **({"description": payload.description} if payload.description is not None else {}),
                **({"startTime": payload.startTime} if payload.startTime is not None else {}),
                **({"endTime": payload.endTime} if payload.endTime is not None else {}),
                **({"status": payload.status} if payload.status is not None else {}),
                **({"location": payload.location} if payload.location is not None else {}),
                **({"notes": payload.notes} if payload.notes is not None else {}),
            })
            APPOINTMENTS[idx] = updated
            return updated
    raise HTTPException(status_code=404, detail="Appointment not found")


@router.post("/appointments/{appointment_id}/cancel")
async def cancel_appointment(appointment_id: str):
    for idx, a in enumerate(APPOINTMENTS):
        if a.id == appointment_id:
            APPOINTMENTS[idx] = a.model_copy(update={"status": "cancelled"})
            return {"message": "Appointment cancelled"}
    raise HTTPException(status_code=404, detail="Appointment not found")


@router.delete("/appointments/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment(appointment_id: str):
    global APPOINTMENTS
    before = len(APPOINTMENTS)
    APPOINTMENTS = [a for a in APPOINTMENTS if a.id != appointment_id]
    if len(APPOINTMENTS) == before:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return


@router.get("/availability/blocked-times", response_model=List[BlockedTime])
async def list_blocked_times():
    return BLOCKED_TIMES


@router.get("/availability/blocked-times/by-date", response_model=List[BlockedTime])
async def get_blocked_times_by_date(date: str):
    target = datetime.fromisoformat(date).replace(hour=0, minute=0, second=0, microsecond=0)
    next_day = target + timedelta(days=1)
    results: List[BlockedTime] = []
    for b in BLOCKED_TIMES:
        st = datetime.fromisoformat(b.startTime)
        if target <= st < next_day:
            results.append(b)
    return results


@router.post("/availability/blocked-times", response_model=BlockedTime, status_code=status.HTTP_201_CREATED)
async def create_blocked_time(payload: CreateBlockedTimeRequest):
    blocked = BlockedTime(
        id=f"block-{int(datetime.utcnow().timestamp()*1000)}",
        trainerId=payload.trainerId,
        startTime=payload.startTime,
        endTime=payload.endTime,
        isFullDay=payload.isFullDay,
        reason=payload.reason,
    )
    BLOCKED_TIMES.append(blocked)
    return blocked


@router.delete("/availability/blocked-times/{blocked_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blocked_time(blocked_id: str):
    global BLOCKED_TIMES
    before = len(BLOCKED_TIMES)
    BLOCKED_TIMES = [b for b in BLOCKED_TIMES if b.id != blocked_id]
    if len(BLOCKED_TIMES) == before:
        raise HTTPException(status_code=404, detail="Blocked time not found")
    return


@router.post("/availability/block-full-day")
async def block_full_day(trainerId: str, date: str, reason: Optional[str] = None):
    start = datetime.fromisoformat(date).replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    blocked = BlockedTime(
        id=f"block-day-{int(datetime.utcnow().timestamp()*1000)}",
        trainerId=trainerId,
        startTime=start.isoformat(),
        endTime=end.isoformat(),
        isFullDay=True,
        reason=reason or "Not available",
    )
    BLOCKED_TIMES.append(blocked)
    return blocked


@router.delete("/availability/unblock-full-day")
async def unblock_full_day(trainerId: str, date: str):
    target = datetime.fromisoformat(date).replace(hour=0, minute=0, second=0, microsecond=0)
    global BLOCKED_TIMES
    before = len(BLOCKED_TIMES)
    BLOCKED_TIMES = [
        b for b in BLOCKED_TIMES
        if not (b.trainerId == trainerId and b.isFullDay and datetime.fromisoformat(b.startTime) == target)
    ]
    removed = before - len(BLOCKED_TIMES)
    if removed == 0:
        raise HTTPException(status_code=404, detail="Full-day block not found")
    return {"message": "Full-day block removed"}


