from fastapi import APIRouter
from typing import Dict, List
from datetime import datetime, timedelta


router = APIRouter(
    prefix="/streaks",
    tags=["streaks"],
)


# In-memory map of userId -> list of ISO date strings (UTC midnight)
CHECK_INS: Dict[str, List[str]] = {}


def _normalize_to_midnight_iso(dt: datetime) -> str:
    d = dt.replace(hour=0, minute=0, second=0, microsecond=0)
    return d.isoformat()


@router.post("/{user_id}/check-in")
async def check_in(user_id: str):
    today_iso = _normalize_to_midnight_iso(datetime.utcnow())
    arr = CHECK_INS.get(user_id, [])
    if today_iso not in arr:
        arr.append(today_iso)
        CHECK_INS[user_id] = arr
    return {"message": "Checked in", "date": today_iso}


@router.get("/{user_id}")
async def get_streak(user_id: str):
    arr = sorted(CHECK_INS.get(user_id, []))
    if not arr:
        return {"streak": 0}
    # compute consecutive days ending at the most recent check-in
    streak = 1
    current = datetime.fromisoformat(arr[-1])
    for i in range(len(arr) - 2, -1, -1):
        prev = datetime.fromisoformat(arr[i])
        if prev == current - timedelta(days=1):
            streak += 1
            current = prev
        else:
            break
    return {"streak": streak}


@router.get("/{user_id}/last-check-in")
async def get_last_check_in(user_id: str):
    arr = sorted(CHECK_INS.get(user_id, []))
    return {"lastCheckIn": arr[-1] if arr else None}


@router.post("/{user_id}/reset")
async def reset_streak(user_id: str):
    CHECK_INS[user_id] = []
    return {"message": "Streak reset"}


@router.get("/{user_id}/has-checked-in-today")
async def has_checked_in_today(user_id: str):
    today_iso = _normalize_to_midnight_iso(datetime.utcnow())
    return {"checkedIn": today_iso in CHECK_INS.get(user_id, [])}


