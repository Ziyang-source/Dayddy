export const dayddyItems = [
  {
    id: '1',
    date: '2026-04-24',
    type: 'event',
    title: 'Morning Reflection',
    time: '09:00',
    endTime: '10:00',
    category: 'Personal',
    tag: 'SOCIAL',
    place: 'The Daily Grind',
    description: 'Journaling and tea in the sun.',
    image: 'coffee',
  },
  {
    id: '2',
    date: '2026-04-24',
    type: 'event',
    title: 'Creative Synch',
    time: '11:30',
    endTime: '12:30',
    category: 'Work',
    tag: 'WORK',
    place: 'Online Meeting',
    description: 'Chatting about the new Digital Quilt theme.',
  },
  {
    id: '3',
    date: '2026-04-24',
    type: 'task',
    title: 'Update Design System Tokens',
    time: '14:00',
    category: 'Work',
    tag: 'WORK',
    description: 'Check colors, spacing, cards and tags.',
  },
  {
    id: '4',
    date: '2026-04-24',
    type: 'task',
    title: 'Buy more lavender candles',
    time: '15:30',
    category: 'PERSONAL',
    completed: true,
    description: 'Restock cozy room candles.',
  },
  {
    id: '5',
    date: '2026-04-25',
    type: 'event',
    title: 'Book Club Dinner',
    time: '20:00',
    category: 'Hobbies',
    tag: 'HOBBIES',
    description: 'Discussing The Midnight Library over pasta.',
  },
  {
    id: '6',
    date: '2026-04-26',
    type: 'event',
    title: 'Weekend Escape',
    time: 'All Day',
    category: 'Travel',
    tag: 'TRAVEL',
    place: 'Foothills',
    description: 'Quiet cabin getaway in the foothills.',
    image: 'mountain',
  },
];

export function getItemsByDate(dateString) {
  return dayddyItems.filter(item => item.date === dateString);
}

export function getAllUpcomingItems() {
  return dayddyItems;
}
