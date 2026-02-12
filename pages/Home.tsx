import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell } from 'lucide-react';
import { Story, Announcement } from '../types';
import { DB } from '../services/db';
import { StoryCard } from '../components/StoryCard';

export const Home: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [fetchedStories, fetchedAnnouncements] = await Promise.all([
                DB.stories.getPublished(),
                DB.announcements.getAll()
            ]);
            setStories(fetchedStories.slice(0, 3));
            setAnnouncements(fetchedAnnouncements.filter(a => a.isActive));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="relative bg-stone-50 dark:bg-stone-950 pt-20 pb-32 px-4 overflow-hidden">
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-6 leading-tight tracking-tight">
              Stories of <span className="text-primary-600 italic">Unais</span>
            </h1>
            <p className="text-xl text-stone-600 dark:text-stone-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              storiesofunais
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/stories" className="px-8 py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full font-medium text-lg hover:transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                Start Reading
              </Link>
              <Link to="/login?mode=signup" className="px-8 py-4 bg-white dark:bg-stone-800 text-stone-900 dark:text-white border border-stone-200 dark:border-stone-700 rounded-full font-medium text-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
                Join the Community
              </Link>
            </div>
         </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Announcements */}
          {announcements.length > 0 && (
            <section className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-8 border border-primary-100 dark:border-primary-800/30">
               <div className="flex items-center gap-3 mb-4">
                 <Bell className="h-6 w-6 text-primary-600" />
                 <h2 className="text-2xl font-serif font-bold text-primary-900 dark:text-primary-100">Latest Updates</h2>
               </div>
               <div className="space-y-4">
                 {announcements.map(ann => (
                   <div key={ann.id} className="bg-white dark:bg-stone-900 p-4 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800 flex items-start">
                      <p className="text-stone-700 dark:text-stone-300">{ann.content}</p>
                      <span className="ml-auto text-xs text-stone-400 whitespace-nowrap pl-4">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                   </div>
                 ))}
               </div>
            </section>
          )}

          {/* Latest Stories */}
          <section>
             <div className="flex items-end justify-between mb-10">
                <div>
                   <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white mb-2">Latest Publications</h2>
                   <p className="text-stone-500 dark:text-stone-400">Fresh from the press, waiting for you.</p>
                </div>
                <Link to="/stories" className="group flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors">
                  View all <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stories.map(story => (
                  <StoryCard key={story.id} story={story} />
                ))}
             </div>
          </section>
      </div>
    </div>
  );
};