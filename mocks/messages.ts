import { Message } from '@/types';

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'trainer-1',
    receiverId: 'client-1',
    content: "Hi Sarah, how are you feeling after yesterday's workout? Any soreness or issues to report?",
    timestamp: '2023-06-15T09:00:00.000Z',
    read: true,
  },
  {
    id: 'msg-2',
    senderId: 'client-1',
    receiverId: 'trainer-1',
    content: "Morning Alex! I'm feeling good, just a bit of soreness in my quads but nothing too bad. The new squat form really helped!",
    timestamp: '2023-06-15T09:15:00.000Z',
    read: true,
  },
  {
    id: 'msg-3',
    senderId: 'trainer-1',
    receiverId: 'client-1',
    content: "That's great to hear! The soreness is normal and should subside in a day or two. Remember to stay hydrated and get enough protein today. Looking forward to our session tomorrow!",
    timestamp: '2023-06-15T09:20:00.000Z',
    read: true,
  },
  {
    id: 'msg-4',
    senderId: 'trainer-1',
    receiverId: 'client-2',
    content: "Hey Mike, just checking in. How's your progress with the new nutrition plan?",
    timestamp: '2023-06-15T10:00:00.000Z',
    read: true,
  },
  {
    id: 'msg-5',
    senderId: 'client-2',
    receiverId: 'trainer-1',
    content: "It's going well! I've been consistent with my meals and hitting my protein targets. Energy levels are definitely up during workouts.",
    timestamp: '2023-06-15T10:30:00.000Z',
    read: true,
  },
  {
    id: 'msg-6',
    senderId: 'trainer-1',
    receiverId: 'client-3',
    content: "Emma, don't forget to log your stretching routine today. How's your flexibility improving?",
    timestamp: '2023-06-15T11:00:00.000Z',
    read: false,
  },
];