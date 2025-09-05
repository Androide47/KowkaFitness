from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


router = APIRouter(
    prefix="/messages",
    tags=["messages"],
)


class Attachment(BaseModel):
    id: str
    type: str  # 'image' | 'video' | 'document'
    url: str
    thumbnailUrl: Optional[str] = None
    name: str
    size: Optional[int] = None


class Message(BaseModel):
    id: str
    senderId: str
    receiverId: str
    content: str
    timestamp: str
    read: bool
    attachments: Optional[List[Attachment]] = None


class SendMessageRequest(BaseModel):
    senderId: str
    receiverId: str
    content: str
    attachments: Optional[List[Attachment]] = None


class BroadcastRequest(BaseModel):
    senderId: str
    receiverIds: List[str]
    content: str
    attachments: Optional[List[Attachment]] = None


MESSAGES: List[Message] = []


@router.get("/", response_model=List[Message])
async def list_messages():
    return MESSAGES


@router.get("/conversation")
async def get_conversation(userId: str, otherUserId: str):
    results = [
        m for m in MESSAGES
        if (m.senderId == userId and m.receiverId == otherUserId) or (m.senderId == otherUserId and m.receiverId == userId)
    ]
    results.sort(key=lambda m: m.timestamp)
    return results


@router.post("/send", response_model=Message, status_code=status.HTTP_201_CREATED)
async def send_message(payload: SendMessageRequest):
    message = Message(
        id=f"msg-{int(datetime.utcnow().timestamp()*1000)}",
        senderId=payload.senderId,
        receiverId=payload.receiverId,
        content=payload.content,
        timestamp=datetime.utcnow().isoformat(),
        read=False,
        attachments=payload.attachments,
    )
    MESSAGES.append(message)
    return message


@router.post("/{message_id}/read")
async def mark_as_read(message_id: str):
    for idx, m in enumerate(MESSAGES):
        if m.id == message_id:
            MESSAGES[idx] = m.model_copy(update={"read": True})
            return {"message": "Marked as read"}
    raise HTTPException(status_code=404, detail="Message not found")


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(message_id: str):
    global MESSAGES
    before = len(MESSAGES)
    MESSAGES = [m for m in MESSAGES if m.id != message_id]
    if len(MESSAGES) == before:
        raise HTTPException(status_code=404, detail="Message not found")
    return


@router.post("/broadcast")
async def send_broadcast(payload: BroadcastRequest):
    created = []
    for rid in payload.receiverIds:
        m = Message(
            id=f"msg-{int(datetime.utcnow().timestamp()*1000)}-{rid}",
            senderId=payload.senderId,
            receiverId=rid,
            content=payload.content,
            timestamp=datetime.utcnow().isoformat(),
            read=False,
            attachments=payload.attachments,
        )
        MESSAGES.append(m)
        created.append(m)
    return created


@router.get("/unread-count/{user_id}")
async def get_unread_count(user_id: str):
    return {"unread": len([m for m in MESSAGES if m.receiverId == user_id and not m.read])}


