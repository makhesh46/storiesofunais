const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
  avatar: String
}, { timestamps: true });

// Convert _id to id for frontend compatibility
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; delete ret.password; }
});

const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: String,
  content: { type: String, required: true },
  coverImage: String,
  authorId: String,
  authorName: String,
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: Date,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  tags: [String]
}, { timestamps: true });

StorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

const CommentSchema = new mongoose.Schema({
  storyId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: String,
  content: { type: String, required: true }
}, { timestamps: true });

CommentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

const AnnouncementSchema = new mongoose.Schema({
  content: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

AnnouncementSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Story: mongoose.model('Story', StorySchema),
  Comment: mongoose.model('Comment', CommentSchema),
  Announcement: mongoose.model('Announcement', AnnouncementSchema)
};