import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Newspaper, Calendar, Search, ArrowRight, Share2, Bookmark,
  Flame, TrendingUp, Globe, Landmark, BarChart3, FlaskConical,
  Trophy, Leaf, Send, RefreshCw, ExternalLink
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './Landing.css';

// ── Telegram channel link ─────────────────────────────────────────────────────
const TELEGRAM_URL = 'https://t.me/vidyajayaa';

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'All',           icon: <Newspaper size={15} />,    color: '#FF6B00' },
  { name: 'National',      icon: <Landmark size={15} />,     color: '#3B82F6' },
  { name: 'International', icon: <Globe size={15} />,        color: '#10B981' },
  { name: 'Economy',       icon: <BarChart3 size={15} />,    color: '#F59E0B' },
  { name: 'Science & Tech',icon: <FlaskConical size={15} />, color: '#8B5CF6' },
  { name: 'Sports',        icon: <Trophy size={15} />,       color: '#EF4444' },
  { name: 'Environment',   icon: <Leaf size={15} />,         color: '#22C55E' },
];

const CAT_COLORS = {
  'National': '#3B82F6', 'International': '#10B981', 'Economy': '#F59E0B',
  'Science & Tech': '#8B5CF6', 'Sports': '#EF4444', 'Environment': '#22C55E',
};

const CAT_ICONS = {
  'National':       <Landmark size={20} />,
  'International':  <Globe size={20} />,
  'Economy':        <BarChart3 size={20} />,
  'Science & Tech': <FlaskConical size={20} />,
  'Sports':         <Trophy size={20} />,
  'Environment':    <Leaf size={20} />,
};

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card p-0 overflow-hidden animate-pulse">
      <div className="p-7">
        <div style={{ height: 14, width: 90, borderRadius: 6, background: 'var(--gray2)', marginBottom: 16 }} />
        <div style={{ height: 22, borderRadius: 6, background: 'var(--gray2)', marginBottom: 10 }} />
        <div style={{ height: 22, width: '75%', borderRadius: 6, background: 'var(--gray2)', marginBottom: 18 }} />
        <div style={{ height: 14, borderRadius: 6, background: 'var(--gray2)', marginBottom: 8 }} />
        <div style={{ height: 14, width: '85%', borderRadius: 6, background: 'var(--gray2)' }} />
      </div>
      <div style={{ height: 52, background: 'var(--gray1)', borderTop: '1px solid var(--gray2)' }} />
    </div>
  );
}

// ── Telegram Banner ───────────────────────────────────────────────────────────
function TelegramBanner({ compact = false }) {
  if (compact) return (
    <a
      href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
        background: 'linear-gradient(135deg, #229ED9, #1a7fb5)',
        borderRadius: 16, textDecoration: 'none', marginBottom: 24,
        boxShadow: '0 4px 20px rgba(34,158,217,0.3)',
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Send size={20} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Get Daily CA on Telegram</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>12,000+ aspirants · Free · Daily updates</div>
      </div>
      <ArrowRight size={18} color="rgba(255,255,255,0.8)" />
    </a>
  );

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      borderRadius: 28, padding: '48px 40px', textAlign: 'center',
      position: 'relative', overflow: 'hidden', margin: '0 0 40px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    }}>
      {/* Telegram glow */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(34,158,217,0.15)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(34,158,217,0.10)', filter: 'blur(30px)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✈️</div>
        <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>
          Never Miss a Current Affair
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
          Join <strong style={{ color: '#229ED9' }}>12,000+ UPSC aspirants</strong> getting daily current affairs, exam alerts & study notes — straight to Telegram.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', background: '#229ED9', color: '#fff',
              borderRadius: 14, fontWeight: 800, fontSize: 16, textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(34,158,217,0.4)',
            }}
          >
            <Send size={18} /> Join Telegram Channel
          </a>
          <a
            href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 24px', background: 'rgba(255,255,255,0.1)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              color: '#fff', borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}
          >
            <ExternalLink size={16} /> @vidyajayaa
          </a>
        </div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          {['📰 Daily CA', '📚 PYQ Notes', '🎯 Exam Alerts', '🆓 100% Free'].map(t => (
            <span key={t} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Inline Telegram nudge (between article rows) ──────────────────────────────
function TelegramNudge() {
  return (
    <a
      href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
      className="card"
      style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px',
        textDecoration: 'none', borderColor: '#229ED933',
        background: 'linear-gradient(135deg, rgba(34,158,217,0.06), rgba(34,158,217,0.02))',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
        background: 'linear-gradient(135deg, #229ED9, #1a7fb5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(34,158,217,0.35)',
      }}>
        <Send size={22} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>
          📲 Get these updates daily on Telegram
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray4)', marginTop: 3 }}>
          Join @vidyajayaa — Free daily CA, exam tips & more for 12,000+ aspirants
        </div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
        background: '#229ED9', color: '#fff', borderRadius: 10,
        fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        Join Free <ArrowRight size={14} />
      </div>
    </a>
  );
}

// ── Article Card ──────────────────────────────────────────────────────────────
function ArticleCard({ news, idx }) {
  const color = CAT_COLORS[news.category] || '#FF6B00';
  const icon  = CAT_ICONS[news.category] || <Newspaper size={20} />;

  return (
    <div className={`card group hover:scale-[1.015] transition-all p-0 overflow-hidden reveal reveal-delay-${idx % 4}`}>
      {/* Top colour stripe */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${color}, ${color}44)` }} />

      <div style={{ padding: '24px 28px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gray3)' }}>{news.category}</div>
              <div style={{ fontSize: 12, color: 'var(--gray3)', marginTop: 1 }}>{formatDate(news.published_at)}</div>
            </div>
          </div>
          {news.is_trending && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
              fontSize: 10, fontWeight: 800, borderRadius: 8,
              background: 'rgba(255,107,0,0.12)', color: 'var(--orange)',
            }}>
              <TrendingUp size={11} /> Trending
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/current-affairs/${news.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontSize: 18, fontWeight: 800, marginBottom: 10, lineHeight: 1.35,
            color: 'var(--text)', cursor: 'pointer',
          }}
            className="group-hover:text-[var(--orange)] transition-colors"
          >
            {news.title}
          </h3>
        </Link>

        <p style={{ fontSize: 14, color: 'var(--gray4)', lineHeight: 1.65, marginBottom: 18,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {news.summary}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--gray3)' }}>
            <Calendar size={13} /> {news.read_time || '4 min read'}
          </div>
          <Link
            to={`/current-affairs/${news.id}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 13, fontWeight: 800, color: color, textDecoration: 'none',
            }}
            className="hover:gap-3 transition-all"
          >
            Read More <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CurrentAffairs() {
  const { theme }                         = useAppStore();
  const [selected, setSelected]           = useState('All');
  const [search, setSearch]               = useState('');
  const [articles, setArticles]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [retrying, setRetrying]           = useState(false);

  const load = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const { data } = await axios.get('/api/current-affairs', {
        params: {
          category: selected !== 'All' ? selected : undefined,
          search:   search || undefined,
          limit:    30,
        },
      });
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch current affairs:', err);
      toast.error('Could not load articles. Retrying…');
      // Auto-retry once
      try {
        const { data } = await axios.get('/api/current-affairs', { params: { limit: 30 } });
        setArticles(Array.isArray(data) ? data : []);
      } catch {
        setArticles([]);
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => { load(); }, [selected, search]);

  useEffect(() => {
    document.title = 'Daily Current Affairs — UPSC, SSC, Banking | VidyaJaya';
    window.scrollTo(0, 0);
  }, []);

  // Scroll-reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [articles, loading]);

  const handleRetry = () => { setRetrying(true); load(); };

  // Insert Telegram nudge after every 4 articles
  const renderedItems = [];
  articles.forEach((a, i) => {
    renderedItems.push(<ArticleCard key={a.id} news={a} idx={i} />);
    if ((i + 1) % 4 === 0 && i + 1 < articles.length) {
      renderedItems.push(
        <div key={`tg-${i}`} style={{ gridColumn: '1 / -1' }}>
          <TelegramNudge />
        </div>
      );
    }
  });

  return (
    <div className="landing-page min-h-screen" style={{ background: 'var(--bg)', paddingBottom: 80 }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 120, paddingBottom: 40, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>

          <div className="reveal" style={{ marginBottom: 16 }}>
            <span className="badge badge-orange">📰 Daily Updates</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 24 }}>
            <div className="reveal">
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>
                Current <span style={{ color: 'var(--orange)' }}>Affairs</span>
              </h1>
              <p style={{ fontSize: 16, color: 'var(--gray4)', maxWidth: 520 }}>
                AI-curated daily news for UPSC, SSC & Banking. Every sector, every day.
              </p>
            </div>

            {/* Search */}
            <div className="reveal reveal-delay-1" style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray3)' }} size={18} />
              <input
                type="text"
                placeholder="Search news, topics..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: 300, padding: '12px 16px 12px 42px',
                  borderRadius: 14, border: '1.5px solid var(--gray2)',
                  background: 'var(--white)', fontSize: 14, outline: 'none',
                  color: 'var(--text)',
                }}
              />
            </div>
          </div>

          {/* Compact Telegram strip */}
          <div className="reveal reveal-delay-1">
            <TelegramBanner compact />
          </div>

          {/* Category tabs */}
          <div className="reveal reveal-delay-2" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 32 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelected(cat.name)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                  whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', transition: 'all .2s',
                  background: selected === cat.name ? cat.color : 'var(--white)',
                  color: selected === cat.name ? '#fff' : 'var(--gray4)',
                  boxShadow: selected === cat.name ? `0 4px 16px ${cat.color}44` : '0 1px 4px rgba(0,0,0,0.06)',
                  outline: selected === cat.name ? 'none' : '1.5px solid var(--gray2)',
                }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Stat strip */}
          {!loading && articles.length > 0 && (
            <div className="reveal" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: 'var(--gray3)' }}>
              <span style={{ fontWeight: 700, color: 'var(--orange)' }}>{articles.length}</span> articles found
              {selected !== 'All' && <span>in <strong>{selected}</strong></span>}
              <span style={{ flex: 1 }} />
              <button onClick={handleRetry} disabled={retrying} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray3)', fontSize: 13 }}>
                <RefreshCw size={13} className={retrying ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          )}

          {/* ── GRID ─────────────────────────────────────────────────────── */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {[1,2,3,4,5,6].map(n => <SkeletonCard key={n} />)}
            </div>
          ) : articles.length === 0 ? (
            <div>
              {/* Empty state */}
              <div className="card" style={{ textAlign: 'center', padding: '60px 32px', marginBottom: 32 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>No articles yet for this category</h3>
                <p style={{ color: 'var(--gray4)', marginBottom: 20, fontSize: 15 }}>
                  Our AI pipeline fetches fresh news daily at 6 AM. Check back soon!
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setSelected('All')} style={{
                    padding: '10px 24px', background: 'var(--orange)', color: '#fff',
                    borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14,
                  }}>
                    View All Categories
                  </button>
                  <button onClick={handleRetry} style={{
                    padding: '10px 24px', background: 'var(--white)',
                    border: '1.5px solid var(--gray2)', borderRadius: 10,
                    fontWeight: 700, cursor: 'pointer', fontSize: 14, color: 'var(--text)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <RefreshCw size={14} /> Retry
                  </button>
                </div>
              </div>
              <TelegramBanner />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {renderedItems}
            </div>
          )}
        </div>
      </section>

      {/* ── BIG TELEGRAM CTA ───────────────────────────────────────────── */}
      {!loading && articles.length > 0 && (
        <section style={{ padding: '0 24px 40px' }}>
          <div style={{ maxWidth: 1140, margin: '0 auto' }}>
            <TelegramBanner />
          </div>
        </section>
      )}
    </div>
  );
}
