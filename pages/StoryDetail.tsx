import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Story, Comment } from '../types';
import { DB } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, Heart, Eye, MessageCircle, Share2, ArrowLeft, Trash2, Check } from 'lucide-react';

export const StoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const s = await DB.stories.getById(id);
        if (s) {
          setStory(s);
          // Increment view count (simple implementation, ideally debounce or check session)
          DB.stories.incrementView(s.id);
          
          const c = await DB.comments.getByStoryId(s.id);
          setComments(c);

          // Check if liked in this session
          const liked = localStorage.getItem('lumina_liked_stories');
          const likedList = liked ? JSON.parse(liked) : [];
          setHasLiked(likedList.includes(s.id));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [id]);

  const handleLike = async () => {
    if (!story || hasLiked) return;
    await DB.stories.like(story.id);
    
    // Update local state
    setStory(prev => prev ? ({ ...prev, likes: prev.likes + 1 }) : null);
    setHasLiked(true);
    
    // Save to local storage
    const liked = localStorage.getItem('lumina_liked_stories');
    const likedList = liked ? JSON.parse(liked) : [];
    localStorage.setItem('lumina_liked_stories', JSON.stringify([...likedList, story.id]));
  };

  const handleShare = async () => {
    if (!story) return;
    const url = window.location.href;
    const shareData = {
        title: story.title,
        text: story.excerpt,
        url: url
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Error sharing', err);
        }
    } else {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story || !user || !commentText.trim()) return;

    const newComment = await DB.comments.create({
      storyId: story.id,
      userId: user.id,
      userName: user.name,
      content: commentText
    });

    setComments([newComment, ...comments]);
    setCommentText('');
  };

  const handleDeleteComment = async (commentId: string) => {
      if (!isAdmin) return;
      if (!confirm('Delete this comment?')) return;
      await DB.comments.delete(commentId);
      setComments(comments.filter(c => c.id !== commentId));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div></div>;
  if (!story) return <div className="text-center py-20 text-xl text-stone-600">Story not found.</div>;

  return (
    <article className="min-h-screen pb-20">
      {/* Hero Header */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 z-20 p-8 md:p-12 max-w-4xl mx-auto text-white">
          <Link to="/stories" className="inline-flex items-center text-white/80 hover:text-white mb-6 text-sm font-medium transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to stories
          </Link>
          <div className="flex gap-2 mb-4">
             {story.tags.map(tag => (
                 <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold tracking-wide uppercase">{tag}</span>
             ))}
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 leading-tight">{story.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-white/90 font-medium">
            <span>By {story.authorName}</span>
            <span className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> {new Date(story.publishedAt || story.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center"><Clock className="h-4 w-4 mr-2" /> 5 min read</span>
            <span className="flex items-center"><Eye className="h-4 w-4 mr-2" /> {story.views} views</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-10 relative z-30">
        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xl p-8 md:p-12 mb-12">
           <div className="prose prose-lg dark:prose-invert max-w-none font-serif leading-relaxed whitespace-pre-wrap">
             {story.content}
           </div>
           
           {/* Actions */}
           <div className="flex items-center justify-between mt-12 pt-8 border-t border-stone-100 dark:border-stone-800">
             <button 
               onClick={handleLike}
               disabled={hasLiked}
               className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                 hasLiked 
                   ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' 
                   : 'bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-rose-900/20 dark:hover:text-rose-400'
               }`}
             >
               <Heart className={`h-5 w-5 ${hasLiked ? 'fill-current' : ''}`} />
               <span className="font-medium">{story.likes} Likes</span>
             </button>
             
             <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
             >
               {copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
               <span className="hidden sm:inline">{copied ? 'Copied Link' : 'Share'}</span>
             </button>
           </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-8 flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Comments ({comments.length})
          </h3>

          {user ? (
            <form onSubmit={handleComment} className="mb-10 bg-white dark:bg-stone-900 p-6 rounded-xl shadow-sm border border-stone-100 dark:border-stone-800">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Leave a thought</label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-4 rounded-lg bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none min-h-[100px]"
                placeholder="What did you think of this story?"
                required
              />
              <div className="flex justify-end mt-4">
                <button type="submit" className="px-6 py-2 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Post Comment
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl mb-10 text-center">
              <p className="text-stone-700 dark:text-stone-300 mb-4">Join the conversation. Sign in to leave a comment.</p>
              <Link to="/login" className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Sign In
              </Link>
            </div>
          )}

          <div className="space-y-6">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-4 p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center font-bold text-stone-500 dark:text-stone-400">
                    {comment.userName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-stone-900 dark:text-white">{comment.userName}</span>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-stone-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        {isAdmin && (
                            <button onClick={() => handleDeleteComment(comment.id)} className="text-red-400 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};