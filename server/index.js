const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { User, Story, Comment, Announcement } = require('./models');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const PORT = 3001;
const SECRET_KEY = 'lumina-secret-key-change-this-in-prod';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/storiesofunais';

app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedDatabase();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// --- Seeding ---
async function seedDatabase() {
  const adminExists = await User.findOne({ email: 'storiesofunais@gmail.com' });
  if (!adminExists) {
    console.log('Seeding admin user...');
    await User.create({
      email: 'storiesofunais@gmail.com',
      password: 'storiesofunais@gmail.com', // Hash this in production
      name: 'Unais',
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150?u=unais'
    });
  }
}

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
    // In production, use bcrypt.compare here
    const user = await User.findOne({ email, password });

    if (user) {
      const userObj = user.toJSON();
      const token = jwt.sign(userObj, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token, user: userObj });
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
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already taken' });

    const newUser = await User.create({
      email,
      password, // Hash in prod
      name,
      role: 'viewer',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });

    const userObj = newUser.toJSON();
    const token = jwt.sign(userObj, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, user: userObj });
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

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        avatar: picture,
        role: 'viewer',
        password: crypto.randomBytes(16).toString('hex'), // Random password for OAuth users
      });
    }

    const userObj = user.toJSON();
    const jwtToken = jwt.sign(userObj, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token: jwtToken, user: userObj });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(400).json({ message: 'Google Sign-In failed' });
  }
});

// --- Story Routes ---
app.get('/api/stories', async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;

    const stories = await Story.find(query).sort({ publishedAt: -1, createdAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/stories/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (story) res.json(story);
    else res.status(404).json({ message: 'Story not found' });
  } catch (error) {
    res.status(404).json({ message: 'Invalid ID format' });
  }
});

app.post('/api/stories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const newStory = await Story.create({
      ...req.body,
      authorId: req.user.id,
      authorName: req.user.name,
      views: 0,
      likes: 0
    });
    res.json(newStory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/stories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updated = await Story.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (updated) res.json(updated);
    else res.status(404).json({ message: 'Story not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/stories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await Story.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/stories/:id/view', async (req, res) => {
  try {
    await Story.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/stories/:id/like', async (req, res) => {
  try {
    await Story.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Comment Routes ---
app.get('/api/comments/:storyId', async (req, res) => {
  try {
    const comments = await Comment.find({ storyId: req.params.storyId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/comments', authenticateToken, async (req, res) => {
  try {
    const newComment = await Comment.create({
      ...req.body,
      userId: req.user.id,
      userName: req.user.name
    });
    res.json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/comments/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Announcement Routes ---
app.get('/api/announcements', async (req, res) => {
  try {
    const anns = await Announcement.find({}).sort({ createdAt: -1 });
    res.json(anns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/announcements', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const newAnn = await Announcement.create(req.body);
    res.json(newAnn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/announcements/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});