import React from 'react';
import { Link } from 'react-router-dom';
import { Story } from '../types';
import { Clock, Eye, Heart, Calendar } from 'lucide-react';

interface StoryCardProps {
  story: Story;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  return (
    <Link to={`/story/${story.id}`} className="group block h-full">
      <div className="h-full bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={story.coverImage} 
            alt={story.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            {story.tags.map(tag => (
              <span key={tag} className="px-2 py-1 text-xs font-semibold bg-white/90 dark:bg-black/80 backdrop-blur text-stone-800 dark:text-stone-200 rounded-full shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center text-xs text-stone-500 dark:text-stone-400 mb-3 space-x-3">
            <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {new Date(story.publishedAt || story.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> 5 min read</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {story.title}
          </h3>
          <p className="text-stone-600 dark:text-stone-400 text-sm line-clamp-3 mb-4 flex-grow">
            {story.excerpt}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
            <span className="text-xs font-medium text-stone-900 dark:text-stone-300">By {story.authorName}</span>
            <div className="flex items-center space-x-4 text-xs text-stone-500">
              <span className="flex items-center"><Eye className="h-3 w-3 mr-1" /> {story.views}</span>
              <span className="flex items-center"><Heart className="h-3 w-3 mr-1" /> {story.likes}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
