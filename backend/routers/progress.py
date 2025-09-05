from fastapi import APIRouter, HTTPException, status, File, UploadFile
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from pathlib import Path
import shutil


router = APIRouter(
    prefix="/progress",
    tags=["progress"],
)


UPLOADS_DIR = Path("uploads/progress_photos")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


class Measurements(BaseModel):
    date: str
    weight: Optional[float] = None
    bodyFat: Optional[float] = None
    chest: Optional[float] = None
    waist: Optional[float] = None
    hips: Optional[float] = None
    arms: Optional[float] = None
    thighs: Optional[float] = None
    notes: Optional[str] = None


class ProgressEntry(BaseModel):
    id: str
    clientId: str
    date: str
    type: str  # 'photo' | 'measurement' | 'note'
    photos: Optional[List[str]] = None
    measurements: Optional[Measurements] = None
    notes: Optional[str] = None


class CreateMeasurementRequest(BaseModel):
    clientId: str
    measurements: Measurements


class CreateNoteRequest(BaseModel):
    clientId: str
    note: str


class UpdateProgressRequest(BaseModel):
    photos: Optional[List[str]] = None
    measurements: Optional[Measurements] = None
    notes: Optional[str] = None


ENTRIES: List[ProgressEntry] = []


@router.get("/{client_id}", response_model=List[ProgressEntry])
async def get_entries(client_id: str):
    results = [e for e in ENTRIES if e.clientId == client_id]
    results.sort(key=lambda e: e.date, reverse=True)
    return results


@router.post("/measurement", response_model=ProgressEntry, status_code=status.HTTP_201_CREATED)
async def add_measurement(payload: CreateMeasurementRequest):
    entry = ProgressEntry(
        id=f"prog-{int(datetime.utcnow().timestamp()*1000)}",
        clientId=payload.clientId,
        date=datetime.utcnow().isoformat(),
        type="measurement",
        measurements=payload.measurements,
    )
    ENTRIES.append(entry)
    return entry


@router.post("/{client_id}/photos", response_model=ProgressEntry, status_code=status.HTTP_201_CREATED)
async def add_photos(client_id: str, files: List[UploadFile] = File(...)):
    saved_urls: List[str] = []
    for file in files:
        if file.content_type not in ["image/jpeg", "image/png", "image/gif"]:
            raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and GIF are allowed.")
        ext = file.filename.split(".")[-1]
        filename = f"{client_id}_{int(datetime.utcnow().timestamp()*1000)}.{ext}"
        file_path = UPLOADS_DIR / filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_urls.append(f"/uploads/progress_photos/{filename}")

    entry = ProgressEntry(
        id=f"prog-{int(datetime.utcnow().timestamp()*1000)}",
        clientId=client_id,
        date=datetime.utcnow().isoformat(),
        type="photo",
        photos=saved_urls,
    )
    ENTRIES.append(entry)
    return entry


@router.post("/note", response_model=ProgressEntry, status_code=status.HTTP_201_CREATED)
async def add_note(payload: CreateNoteRequest):
    entry = ProgressEntry(
        id=f"prog-{int(datetime.utcnow().timestamp()*1000)}",
        clientId=payload.clientId,
        date=datetime.utcnow().isoformat(),
        type="note",
        notes=payload.note,
    )
    ENTRIES.append(entry)
    return entry


@router.patch("/{entry_id}", response_model=ProgressEntry)
async def update_entry(entry_id: str, payload: UpdateProgressRequest):
    for idx, e in enumerate(ENTRIES):
        if e.id == entry_id:
            updated = e.model_copy(update={
                **({"photos": payload.photos} if payload.photos is not None else {}),
                **({"measurements": payload.measurements} if payload.measurements is not None else {}),
                **({"notes": payload.notes} if payload.notes is not None else {}),
            })
            ENTRIES[idx] = updated
            return updated
    raise HTTPException(status_code=404, detail="Progress entry not found")


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(entry_id: str):
    global ENTRIES
    before = len(ENTRIES)
    ENTRIES = [e for e in ENTRIES if e.id != entry_id]
    if len(ENTRIES) == before:
        raise HTTPException(status_code=404, detail="Progress entry not found")
    return


@router.get("/{client_id}/latest-measurement", response_model=Optional[Measurements])
async def get_latest_measurement(client_id: str):
    measurement_entries = [e for e in ENTRIES if e.clientId == client_id and e.type == "measurement"]
    if not measurement_entries:
        return None
    # Sort by date desc
    measurement_entries.sort(key=lambda e: e.date, reverse=True)
    return measurement_entries[0].measurements


@router.get("/{client_id}/photos", response_model=List[str])
async def get_all_photos(client_id: str):
    photo_entries = [e for e in ENTRIES if e.clientId == client_id and e.type == "photo"]
    urls: List[str] = []
    for e in photo_entries:
        urls.extend(e.photos or [])
    return urls


@router.get("/{client_id}/notes", response_model=List[str])
async def get_all_notes(client_id: str):
    note_entries = [e for e in ENTRIES if e.clientId == client_id and e.type == "note"]
    return [e.notes for e in note_entries if e.notes]


