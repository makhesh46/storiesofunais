import React, { useEffect, useState } from 'react';
import { Story } from '../types';
import { DB } from '../services/db';
import { StoryCard } from '../components/StoryCard';
import { Filter, Flame, Clock, Eye } from 'lucide-react';

type SortType = 'latest' | 'popular' | 'viewed';

export const StoryList: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [sortType, setSortType] = useState<SortType>('latest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const data = await DB.stories.getPublished();
        let sorted = [...data];
        
        if (sortType === 'popular') {
          sorted.sort((a, b) => b.likes - a.likes);
        } else if (sortType === 'viewed') {
          sorted.sort((a, b) => b.views - a.views);
        } else {
          // Default latest
          sorted.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
        }
        
        setStories(sorted);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, [sortType]);

  const FilterButton: React.FC<{ type: SortType; icon: React.ReactNode; label: string }> = ({ type, icon, label }) => (
    <button
      onClick={() => setSortType(type)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        sortType === type
          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700 dark:hover:bg-stone-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
           <h1 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-2">Explore Stories</h1>
           <p className="text-stone-500 dark:text-stone-400">Dive into our complete collection.</p>
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
          <FilterButton type="latest" icon={<Clock className="h-4 w-4" />} label="Latest" />
          <FilterButton type="popular" icon={<Flame className="h-4 w-4" />} label="Most Liked" />
          <FilterButton type="viewed" icon={<Eye className="h-4 w-4" />} label="Most Viewed" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-stone-900 dark:border-white"></div>
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20 text-stone-500">No stories found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
};