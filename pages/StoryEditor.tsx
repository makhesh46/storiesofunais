import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DB } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export const StoryEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: 'https://picsum.photos/800/400',
    status: 'draft',
    tags: ''
  });

  useEffect(() => {
    if (id) {
      DB.stories.getById(id).then(story => {
        if (story) {
          setFormData({
            title: story.title,
            excerpt: story.excerpt,
            content: story.content,
            coverImage: story.coverImage,
            status: story.status,
            tags: story.tags.join(', ')
          });
        }
      });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const storyData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      authorId: user?.id || 'admin',
      authorName: user?.name || 'Admin',
      publishedAt: formData.status === 'published' ? new Date().toISOString() : undefined
    };

    // @ts-ignore - status type matching
    const payload = { ...storyData, status: formData.status as 'draft' | 'published' };

    if (id) {
      await DB.stories.update(id, payload);
    } else {
      await DB.stories.create(payload);
    }
    navigate('/admin');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/admin')} className="flex items-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-200">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{id ? 'Edit Story' : 'New Story'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Editor */}
          <div className="bg-white dark:bg-stone-900 p-6 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full text-3xl font-serif font-bold p-2 border-b-2 border-transparent focus:border-stone-900 dark:focus:border-stone-100 bg-transparent outline-none placeholder-stone-300 dark:placeholder-stone-700 dark:text-white transition-colors"
                placeholder="Enter story title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Story Content (HTML/Markdown supported)</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full h-[600px] p-4 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:ring-2 focus:ring-primary-500 outline-none font-serif text-lg leading-relaxed resize-none dark:text-stone-200"
                placeholder="Once upon a time..."
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Sidebar Settings */}
          <div className="bg-white dark:bg-stone-900 p-6 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 outline-none dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Excerpt</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 outline-none text-sm dark:text-white"
                placeholder="A short summary..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Cover Image URL</label>
              <div className="flex gap-2 mb-2">
                 <input
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  className="flex-grow p-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 outline-none text-sm dark:text-white"
                />
                <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg"><ImageIcon className="h-5 w-5 text-stone-500" /></div>
              </div>
              <div className="h-32 w-full rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800">
                <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover opacity-80" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Tags (comma separated)</label>
              <input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full p-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 outline-none text-sm dark:text-white"
                placeholder="Fiction, Mystery, etc."
              />
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
              <Save className="h-4 w-4" />
              Save Story
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};