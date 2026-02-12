import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="font-serif font-bold text-xl text-stone-900 dark:text-white mb-4">Stories of Unais</p>
        <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
          Crafting stories that inspire, connect, and transform.
        </p>
        <div className="text-xs text-stone-400 dark:text-stone-500">
          &copy; {new Date().getFullYear()} Stories of Unais. All rights reserved.
        </div>
      </div>
    </footer>
  );
};