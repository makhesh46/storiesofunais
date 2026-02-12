import { Story, Announcement, User, Comment } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'admin-1',
    email: 'storiesofunais@gmail.com',
    name: 'Unais',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?u=unais'
  },
  {
    id: 'user-1',
    email: 'reader@lumina.com',
    name: 'John Reader',
    role: 'viewer',
    avatar: 'https://i.pravatar.cc/150?u=reader'
  }
];

export const MOCK_STORIES: Story[] = [
  {
    id: 'story-1',
    title: 'The Silent Watchtower',
    excerpt: 'In a world where sound is currency, one guard discovers a frequency that could change everything.',
    content: `The fog rolled in off the bay, thick and heavy like a woolen blanket. It was the kind of night where secrets were traded in hushed whispers, and the currency of the realm—sound—was hoarded like gold.

I stood at my post atop the Watchtower, the damp chill seeping through my coat. Below, the city of Decibel slept, or pretended to. The rich in their soundproofed mansions, the poor in the clamorous slums where noise was a byproduct of survival.

"Quiet night," muttered Kael, my shift partner. He tapped his ear protector, a nervous habit.

"Too quiet," I replied. That's when I heard it. A frequency so low, so pure, it shouldn't have existed. It wasn't the industrial hum of the factories or the chaotic chatter of the markets. It was a melody.

Use the admin panel to edit this story and see how the rich text editor works. You can add more paragraphs, headings, and truly craft a narrative.`,
    coverImage: 'https://picsum.photos/800/400?random=1',
    authorId: 'admin-1',
    authorName: 'Unais',
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    views: 1240,
    likes: 345,
    tags: ['Sci-Fi', 'Mystery']
  },
  {
    id: 'story-2',
    title: 'Autumn in Kyoto',
    excerpt: 'A travelogue exploring the hidden temples and culinary delights of Japan’s ancient capital.',
    content: `The maple leaves had turned a brilliant crimson, setting the hillsides of Arashiyama ablaze. It was my third day in Kyoto, and I had yet to find the tea house my grandfather spoke of.

"Look for the lantern with the blue heron," he had written in his journal.

I walked along the path of philosophy, the stone beneath my feet worn smooth by centuries of seekers. The air smelled of roasted chestnuts and incense.

This platform is designed for stories like this—immersive, descriptive, and beautiful.`,
    coverImage: 'https://picsum.photos/800/400?random=2',
    authorId: 'admin-1',
    authorName: 'Unais',
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    views: 890,
    likes: 120,
    tags: ['Travel', 'Memoir']
  },
  {
    id: 'story-3',
    title: 'Draft: The Lost Code',
    excerpt: 'An unreleased thriller about a developer who deletes the wrong database.',
    content: 'This is a draft story. Viewers should not see this.',
    coverImage: 'https://picsum.photos/800/400?random=3',
    authorId: 'admin-1',
    authorName: 'Unais',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
    likes: 0,
    tags: ['Tech', 'Thriller']
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    content: '🎉 Welcome to Stories of Unais! We are officially live.',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'ann-2',
    content: '📚 New "Sci-Fi" collection releasing this Friday.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isActive: true
  }
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c-1',
    storyId: 'story-1',
    userId: 'user-1',
    userName: 'John Reader',
    content: 'The atmosphere in this story is incredible! I felt like I was in the Watchtower.',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];