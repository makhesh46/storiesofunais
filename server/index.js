const express = require('express');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const supabase = require('./supabase');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.JWT_SECRET || 'lumina-secret-key-change-this-in-prod';

app.use(cors());
app.use(express.json());

// --- Mapping Utilities ---
const toCamel = (obj) => {
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      acc[camelKey] = toCamel(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

const toSnake = (obj) => {
  if (Array.isArray(obj)) return obj.map(toSnake);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnake(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

// --- Supabase Connection Check ---
console.log('Using Supabase for database...');

// --- Seeding (Supabase doesn't need manual seed on every start if table script was run, but keeps logic for admin check) ---
async function seedDatabase() {
  const { data: adminExists, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'storiesofunais@gmail.com')
    .single();

  if (!adminExists && !error) {
    console.log('Seeding admin user...');
    await supabase.from('users').insert({
      email: 'storiesofunais@gmail.com',
      password: 'storiesofunais@gmail.com', // Hash this in production
      name: 'Unais',
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150?u=unais'
    });
  }
}

seedDatabase();


// --- Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
};

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password) // In production, use hashed password comparison
      .single();

    if (user) {
      const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token, user: toCamel(user) });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) return res.status(400).json({ message: 'Email already taken' });

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password, // Hash in prod
        name,
        role: 'viewer',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      })
      .select()
      .single();

    if (error) throw error;

    const token = jwt.sign(newUser, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, user: toCamel(newUser) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email,
          name,
          avatar: picture,
          role: 'viewer',
          password: crypto.randomBytes(16).toString('hex'),
        })
        .select()
        .single();

      if (error) throw error;
      user = newUser;
    }

    const jwtToken = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token: jwtToken, user: toCamel(user) });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(400).json({ message: 'Google Sign-In failed' });
  }
});

// --- Story Routes ---
app.get('/api/stories', async (req, res) => {
  try {
    let query = supabase.from('stories').select('*');
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    const { data: stories, error } = await query.order('published_at', { ascending: false });
    if (error) throw error;
    res.json(toCamel(stories));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/stories/:id', async (req, res) => {
  try {
    const { data: story, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (story) res.json(toCamel(story));
    else res.status(404).json({ message: 'Story not found' });
  } catch (error) {
    res.status(404).json({ message: 'Invalid ID format' });
  }
});

app.post('/api/stories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: newStory, error } = await supabase
      .from('stories')
      .insert({
        ...toSnake(req.body),
        author_id: req.user.id,
        author_name: req.user.name,
        views: 0,
        likes: 0
      })
      .select()
      .single();

    if (error) throw error;
    res.json(toCamel(newStory));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/stories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: updated, error } = await supabase
      .from('stories')
      .update({ ...toSnake(req.body), updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updated) res.json(toCamel(updated));
    else res.status(404).json({ message: 'Story not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/stories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('stories').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/stories/:id/view', async (req, res) => {
  try {
    const { error } = await supabase.rpc('increment_story_views', { story_id: req.params.id });
    // Note: If RPC is not set up, using update with current value + 1 is harder due to no $inc in Supabase update directly easily without a function
    // For now, let's assume update with raw increment if we can, or just update logic.
    // Actually, simple update:
    const { data: story } = await supabase.from('stories').select('views').eq('id', req.params.id).single();
    if (story) {
      await supabase.from('stories').update({ views: (story.views || 0) + 1 }).eq('id', req.params.id);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/stories/:id/like', async (req, res) => {
  try {
    const { data: story } = await supabase.from('stories').select('likes').eq('id', req.params.id).single();
    if (story) {
      await supabase.from('stories').update({ likes: (story.likes || 0) + 1 }).eq('id', req.params.id);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Comment Routes ---
app.get('/api/comments/:storyId', async (req, res) => {
  try {
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(toCamel(comments));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/comments', authenticateToken, async (req, res) => {
  try {
    const { data: newComment, error } = await supabase
      .from('comments')
      .insert({
        ...toSnake(req.body),
        user_id: req.user.id,
        user_name: req.user.name
      })
      .select()
      .single();

    if (error) throw error;
    res.json(toCamel(newComment));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/comments/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('comments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Announcement Routes ---
app.get('/api/announcements', async (req, res) => {
  try {
    const { data: anns, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(toCamel(anns));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/announcements', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: newAnn, error } = await supabase
      .from('announcements')
      .insert(toSnake(req.body))
      .select()
      .single();

    if (error) throw error;
    res.json(toCamel(newAnn));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/announcements/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('announcements').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});