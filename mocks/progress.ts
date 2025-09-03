import { ProgressEntry } from '@/types';

export const mockProgressEntries: ProgressEntry[] = [
  {
    id: 'prog-1',
    clientId: 'client-1',
    date: '2023-05-01T00:00:00.000Z',
    type: 'measurement',
    measurements: {
      date: '2023-05-01T00:00:00.000Z',
      weight: 68,
      bodyFat: 24,
      waist: 30,
      hips: 38,
      notes: 'Starting measurements',
    },
  },
  {
    id: 'prog-2',
    clientId: 'client-1',
    date: '2023-05-01T00:00:00.000Z',
    type: 'photo',
    photos: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    ],
  },
  {
    id: 'prog-3',
    clientId: 'client-1',
    date: '2023-06-01T00:00:00.000Z',
    type: 'measurement',
    measurements: {
      date: '2023-06-01T00:00:00.000Z',
      weight: 65,
      bodyFat: 22,
      waist: 28,
      hips: 36,
      notes: 'One month progress - feeling stronger!',
    },
  },
  {
    id: 'prog-4',
    clientId: 'client-1',
    date: '2023-06-01T00:00:00.000Z',
    type: 'photo',
    photos: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    ],
  },
  {
    id: 'prog-5',
    clientId: 'client-1',
    date: '2023-06-10T00:00:00.000Z',
    type: 'note',
    notes: 'Completed a 5k run without stopping for the first time! Feeling really proud of this achievement.',
  },
  {
    id: 'prog-6',
    clientId: 'client-2',
    date: '2023-05-15T00:00:00.000Z',
    type: 'measurement',
    measurements: {
      date: '2023-05-15T00:00:00.000Z',
      weight: 80,
      bodyFat: 20,
      chest: 40,
      waist: 34,
      arms: 13,
      notes: 'Initial measurements',
    },
  },
  {
    id: 'prog-7',
    clientId: 'client-2',
    date: '2023-06-15T00:00:00.000Z',
    type: 'measurement',
    measurements: {
      date: '2023-06-15T00:00:00.000Z',
      weight: 78,
      bodyFat: 18,
      chest: 42,
      waist: 32,
      arms: 14,
      notes: 'One month progress - seeing good muscle development',
    },
  },
];