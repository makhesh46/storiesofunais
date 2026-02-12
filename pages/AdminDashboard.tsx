import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DB } from '../services/db';
import { Story, Announcement } from '../types';
import { Plus, Edit3, Trash2, Eye, FileText, Megaphone, TrendingUp } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    // Don't set loading to true here to avoid flickering on re-fetch actions
    try {
        const [s, a] = await Promise.all([DB.stories.getAll(), DB.announcements.getAll()]);
        setStories(s);
        setAnnouncements(a);
    } catch (error) {
        console.error("Failed to fetch dashboard data", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteStory = async (id: string) => {
    if (confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      try {
        await DB.stories.delete(id);
        // Optimistic update
        setStories(prev => prev.filter(s => s.id !== id));
        await fetchData(); // Sync with server to be sure
      } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete story. Please try again.");
      }
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    try {
        await DB.announcements.create(newAnnouncement);
        setNewAnnouncement('');
        fetchData();
    } catch (error) {
        alert("Failed to post announcement.");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm('Delete this announcement?')) {
        try {
            await DB.announcements.delete(id);
            // Optimistic update
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            alert("Failed to delete announcement.");
        }
    }
  };

  const totalViews = stories.reduce((acc, s) => acc + s.views, 0);
  const totalLikes = stories.reduce((acc, s) => acc + s.likes, 0);

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin h-8 w-8 border-2 border-stone-900 rounded-full border-t-transparent"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">Admin Dashboard</h1>
        <Link to="/admin/story/new" className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> New Story
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400"><Eye className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400">Total Views</p>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">{totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-lg dark:bg-rose-900/30 dark:text-rose-400"><TrendingUp className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400">Total Likes</p>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">{totalLikes.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg dark:bg-amber-900/30 dark:text-amber-400"><FileText className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400">Published Stories</p>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">{stories.filter(s => s.status === 'published').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Stories List */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden">
          <div className="p-6 border-b border-stone-200 dark:border-stone-800">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">Stories</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Stats</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {stories.map(story => (
                  <tr key={story.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-stone-900 dark:text-white">{story.title}</div>
                      <div className="text-xs text-stone-500 truncate max-w-xs">{new Date(story.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        story.status === 'published' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                      }`}>
                        {story.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {story.views}</span>
                        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {story.likes}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/story/edit/${story.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20">
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteStory(story.id)} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
                          aria-label="Delete story"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {stories.length === 0 && (
                    <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-stone-500">
                            No stories found. Create your first one!
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Announcements */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 p-6">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
              <Megaphone className="h-5 w-5" /> Announcements
            </h2>
            <form onSubmit={handlePostAnnouncement} className="mb-6">
              <textarea
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                placeholder="Post a new update..."
                className="w-full p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent mb-3 focus:ring-2 focus:ring-primary-500 outline-none text-sm dark:text-white"
                rows={3}
              />
              <button type="submit" className="w-full py-2 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-lg text-sm font-medium hover:opacity-90">
                Post Update
              </button>
            </form>
            <div className="space-y-4">
              {announcements.map(ann => (
                <div key={ann.id} className="p-3 bg-stone-50 dark:bg-stone-950 rounded-lg border border-stone-100 dark:border-stone-800 flex justify-between items-start gap-2 group">
                  <p className="text-sm text-stone-700 dark:text-stone-300">{ann.content}</p>
                  <button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {announcements.length === 0 && (
                  <p className="text-sm text-stone-400 text-center py-2">No announcements yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};