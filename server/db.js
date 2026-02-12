const fs = require('fs');
const path = require('path');

// Initial Seed Data
const SEED_DATA = {
  users: [
    {
      id: 'admin-1',
      email: 'storiesofunais@gmail.com',
      password: 'storiesofunais@gmail.com', // In production, hash this!
      name: 'Unais',
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150?u=unais'
    },
    {
      id: 'user-1',
      email: 'reader@lumina.com',
      password: 'password',
      name: 'John Reader',
      role: 'viewer',
      avatar: 'https://i.pravatar.cc/150?u=reader'
    }
  ],
  stories: [
    {
      id: 'story-1',
      title: 'The Silent Watchtower',
      excerpt: 'In a world where sound is currency, one guard discovers a frequency that could change everything.',
      content: 'The fog rolled in off the bay, thick and heavy like a woolen blanket. It was the kind of night where secrets were traded in hushed whispers, and the currency of the realm—sound—was hoarded like gold.\n\nI stood at my post atop the Watchtower, the damp chill seeping through my coat. Below, the city of Decibel slept, or pretended to. The rich in their soundproofed mansions, the poor in the clamorous slums where noise was a byproduct of survival.\n\n"Quiet night," muttered Kael, my shift partner. He tapped his ear protector, a nervous habit.\n\n"Too quiet," I replied. That\'s when I heard it. A frequency so low, so pure, it shouldn\'t have existed. It wasn\'t the industrial hum of the factories or the chaotic chatter of the markets. It was a melody.',
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
      content: 'The maple leaves had turned a brilliant crimson, setting the hillsides of Arashiyama ablaze. It was my third day in Kyoto, and I had yet to find the tea house my grandfather spoke of.\n\n"Look for the lantern with the blue heron," he had written in his journal.\n\nI walked along the path of philosophy, the stone beneath my feet worn smooth by centuries of seekers. The air smelled of roasted chestnuts and incense.',
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
    }
  ],
  announcements: [
    {
      id: 'ann-1',
      content: '🎉 Welcome to Lumina Press! We are officially live.',
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ],
  comments: [
     {
      id: 'c-1',
      storyId: 'story-1',
      userId: 'user-1',
      userName: 'John Reader',
      content: 'The atmosphere in this story is incredible! I felt like I was in the Watchtower.',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'data.json');
    this.data = SEED_DATA;
    this.init();
  }

  init() {
    if (fs.existsSync(this.dbPath)) {
      this.data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
    } else {
      this.save();
    }
  }

  save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
  }

  findAll(collection) {
    return this.data[collection] || [];
  }

  findById(collection, id) {
    return (this.data[collection] || []).find(item => item.id === id);
  }

  create(collection, item) {
    if (!this.data[collection]) this.data[collection] = [];
    this.data[collection].push(item);
    this.save();
    return item;
  }

  update(collection, id, updates) {
    const list = this.data[collection];
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    list[index] = { ...list[index], ...updates };
    this.save();
    return list[index];
  }

  delete(collection, id) {
    const list = this.data[collection];
    this.data[collection] = list.filter(item => item.id !== id);
    this.save();
  }
}

module.exports = new Database();