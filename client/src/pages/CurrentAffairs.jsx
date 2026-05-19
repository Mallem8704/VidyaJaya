import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Newspaper, Calendar, Search, ArrowRight, 
  Share2, Bookmark, Flame, TrendingUp, 
  Globe, Landmark, BarChart3, FlaskConical, Trophy
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './Landing.css'; // Reusing landing styles for consistency

const MOCK_NEWS = [
  {
    id: 1,
    category: 'National',
    title: 'India Launches New Semi-Conductor Mission to Boost Local Manufacturing',
    summary: 'The Union Cabinet has approved a ₹76,000 crore incentive scheme for semi-conductors and display manufacturing ecosystem in India.',
    date: 'May 10, 2026',
    readTime: '4 min read',
    icon: <Landmark className="text-blue-500" />,
    trend: '+12% interest'
  },
  {
    id: 2,
    category: 'International',
    title: 'G20 Summit 2026: Global Leaders Converge to Discuss Climate Finance',
    summary: 'The annual G20 summit kicks off today with a primary focus on mobilizing $1 trillion annually for climate action in developing nations.',
    date: 'May 10, 2026',
    readTime: '6 min read',
    icon: <Globe className="text-green-500" />,
    trend: 'Top Story'
  },
  {
    id: 3,
    category: 'Economy',
    title: 'RBI Keeps Repo Rate Unchanged at 6.5% for the 8th Consecutive Time',
    summary: 'The Monetary Policy Committee (MPC) decided to remain focused on the withdrawal of accommodation to ensure inflation progressively aligns with the target.',
    date: 'May 9, 2026',
    readTime: '3 min read',
    icon: <BarChart3 className="text-orange-500" />,
    trend: 'Market Impact'
  },
  {
    id: 4,
    category: 'Science & Tech',
    title: 'ISRO Successfully Tests New Semi-Cryogenic Engine for Heavy Lift Launchers',
    summary: 'The engine will power the booster stages of future launch vehicles, increasing the payload capacity to Geostationary Transfer Orbit.',
    date: 'May 9, 2026',
    readTime: '5 min read',
    icon: <FlaskConical className="text-purple-500" />,
    trend: 'Space Tech'
  }
];

const CATEGORIES = [
  { name: 'All', icon: <Newspaper size={16} /> },
  { name: 'National', icon: <Landmark size={16} /> },
  { name: 'International', icon: <Globe size={16} /> },
  { name: 'Economy', icon: <BarChart3 size={16} /> },
  { name: 'Science & Tech', icon: <FlaskConical size={16} /> },
  { name: 'Sports', icon: <Trophy size={16} /> }
];

const CATEGORY_ICONS = {
  'National': <Landmark className="text-blue-500" />,
  'International': <Globe className="text-green-500" />,
  'Economy': <BarChart3 className="text-orange-500" />,
  'Science & Tech': <FlaskConical className="text-purple-500" />,
  'Sports': <Trophy className="text-red-500" />,
  'Default': <Newspaper className="text-[var(--orange)]" />
};

export default function CurrentAffairs() {
  const navigate = useNavigate();
  const { theme } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/current-affairs', {
        params: {
          category: selectedCategory,
          search: searchQuery
        }
      });
      setNewsData(data);
    } catch (err) {
      console.error('Failed to fetch news:', err);
      toast.error('Could not load current affairs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    document.title = "Daily Current Affairs for UPSC, SSC & Banking — VidyaJaya";
    window.scrollTo(0, 0);
    
    // SEO Meta Description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Stay updated with daily current affairs for UPSC, SSC, Banking, and other competitive exams. AI-curated news snippets and practice quizzes.");
    }
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
    return () => revealObs.disconnect();
  }, [newsData, loading]); // Re-run when news data loads to catch new cards

  const formatDate = (dateString) => {
    if (!dateString) return 'May 10, 2026';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="landing-page min-h-screen bg-[var(--bg)] pb-20">
      {/* HEADER SECTION */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="reveal">
              <div className="badge badge-orange mb-4">Daily Updates</div>
              <h1 className="text-4xl md:text-6xl font-black mb-4">
                Current <span className="text-[var(--orange)]">Affairs</span>
              </h1>
              <p className="text-lg text-[var(--gray4)] max-w-2xl">
                Stay ahead with AI-curated daily news and exam-specific analysis tailored for UPSC, SSC, and Banking aspirants.
              </p>
            </div>
            
            <div className="w-full md:w-auto reveal reveal-delay-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--gray3)] group-focus-within:text-[var(--orange)] transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search news, topics..." 
                  className="w-full md:w-80 bg-[var(--white)] border border-[var(--gray2)] rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[var(--orange)] shadow-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* CATEGORY BAR */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar reveal reveal-delay-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat.name 
                  ? 'bg-[var(--orange)] text-white shadow-lg shadow-orange-500/20' 
                  : 'bg-[var(--white)] border border-[var(--gray2)] text-[var(--gray4)] hover:border-[var(--orange)]'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* NEWS GRID */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="card animate-pulse bg-[var(--white)] h-64 rounded-3xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsData.map((news, idx) => (
                <div 
                  key={news.id} 
                  className={`card group hover:scale-[1.02] transition-all p-0 overflow-hidden reveal reveal-delay-${idx % 4}`}
                >
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--bg)] flex items-center justify-center text-xl">
                          {CATEGORY_ICONS[news.category] || CATEGORY_ICONS['Default']}
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--gray3)]">{news.category}</div>
                          <div className="text-xs font-bold text-[var(--gray4)]">{formatDate(news.published_at)}</div>
                        </div>
                      </div>
                      {news.is_trending && (
                        <div className="flex items-center gap-1 text-[var(--orange)] font-bold text-[10px] bg-orange-500/10 px-2 py-1 rounded-md">
                          <TrendingUp size={12} /> Trending
                        </div>
                      )}
                    </div>
                    
                    <Link to={`/current-affairs/${news.id}`} className="no-underline">
                    <h3 className="text-xl md:text-2xl font-black mb-4 leading-tight group-hover:text-[var(--orange)] transition-colors">
                      {news.title}
                    </h3>
                    </Link>
                    <p className="text-[var(--gray4)] text-sm mb-8 line-clamp-3">
                      {news.summary}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--gray3)]">
                          <Calendar size={14} /> {news.read_time || '5 min read'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--bg)] text-[var(--gray3)] transition-colors">
                          <Bookmark size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--bg)] text-[var(--gray3)] transition-colors">
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[var(--bg)] px-8 py-4 flex items-center justify-between border-t border-[var(--gray2)]">
                    <div className="text-xs font-bold text-[var(--gray3)]">Read the full story</div>
                    <Link 
                      to={`/current-affairs/${news.id}`}
                      className="flex items-center gap-2 text-[var(--orange)] font-black text-sm hover:gap-4 transition-all"
                    >
                      Read More <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && newsData.length === 0 && (
            <div className="text-center py-20 bg-[var(--white)] rounded-3xl border border-dashed border-[var(--gray2)]">
              <div className="w-20 h-20 rounded-full bg-[var(--bg)] flex items-center justify-center mx-auto mb-6 text-3xl">
                🔎
              </div>
              <h3 className="text-xl font-bold mb-2">No news found</h3>
              <p className="text-[var(--gray4)]">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-[var(--navy)] to-[var(--navy2)] rounded-[40px] p-12 text-center relative overflow-hidden reveal">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 text-orange-500">
              <Flame size={32} fill="currentColor" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              Get Daily Current Affairs <br />directly on Telegram
            </h2>
            <p className="text-white/60 mb-10 max-w-2xl mx-auto">
              Join 12,000+ aspirants and receive the most important daily news, study notes, and exam alerts every morning.
            </p>
            <a 
              href="https://t.me/vidyajayaa" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg inline-flex items-center gap-3 px-12"
            >
              Join Our Community <TrendingUp size={20} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
