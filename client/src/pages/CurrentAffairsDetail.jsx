import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, Share2, Bookmark,
  BookmarkCheck, TrendingUp, Globe, Landmark,
  BarChart3, FlaskConical, Trophy, Leaf, Newspaper,
  ExternalLink, ChevronRight, Zap
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './Landing.css';

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  'National':       { icon: Landmark,    color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  label: '🏛️ National' },
  'International':  { icon: Globe,       color: '#10B981', bg: 'rgba(16,185,129,0.12)',  label: '🌍 International' },
  'Economy':        { icon: BarChart3,   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  label: '📈 Economy' },
  'Science & Tech': { icon: FlaskConical,color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', label: '🔬 Science & Tech' },
  'Sports':         { icon: Trophy,      color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   label: '🏆 Sports' },
  'Environment':    { icon: Leaf,        color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   label: '🌿 Environment' },
};

const DEFAULT_CAT = { icon: Newspaper, color: '#FF6B00', bg: 'rgba(255,107,0,0.12)', label: '📰 General' };

// Related articles skeleton
const RelatedSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {[1, 2, 3].map(n => (
      <div key={n} style={{ height: 72, borderRadius: 12, background: 'var(--gray1)', animation: 'pulse 1.5s ease-in-out infinite' }} />
    ))}
  </div>
);

// ── Exam relevance tags ───────────────────────────────────────────────────────
const EXAM_TAGS = {
  'National':       ['UPSC', 'SSC', 'State PSC'],
  'International':  ['UPSC', 'IFS'],
  'Economy':        ['UPSC', 'SSC', 'Banking', 'RBI Grade B'],
  'Science & Tech': ['UPSC', 'SSC', 'ISRO'],
  'Sports':         ['SSC', 'CDS'],
  'Environment':    ['UPSC', 'Forest Services'],
};

export default function CurrentAffairsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle]   = useState(null);
  const [related, setRelated]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  // ── Fetch article ─────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/current-affairs/${id}`);
        setArticle(data);

        // Fetch related (same category, different id)
        const { data: rel } = await axios.get('/api/current-affairs', {
          params: { category: data.category, limit: 4 }
        });
        setRelated(rel.filter(r => r.id !== id).slice(0, 3));

        document.title = `${data.title} — VidyaJaya Current Affairs`;
      } catch (err) {
        console.error(err);
        toast.error('Article not found.');
        navigate('/current-affairs');
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [id]);

  // ── Check bookmark ────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('vj_bookmarks') || '[]');
    setBookmarked(saved.includes(id));
  }, [id]);

  const toggleBookmark = () => {
    const saved = JSON.parse(localStorage.getItem('vj_bookmarks') || '[]');
    const next  = bookmarked ? saved.filter(b => b !== id) : [...saved, id];
    localStorage.setItem('vj_bookmarks', JSON.stringify(next));
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? 'Removed from bookmarks' : 'Bookmarked!');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: article?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="landing-page min-h-screen" style={{ background: 'var(--bg)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '120px 24px 60px' }}>
          <div style={{ height: 20, width: 120, borderRadius: 8, background: 'var(--gray2)', marginBottom: 32, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 16, width: 180, borderRadius: 8, background: 'var(--gray2)', marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 48, borderRadius: 8, background: 'var(--gray2)', marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 48, width: '70%', borderRadius: 8, background: 'var(--gray2)', marginBottom: 32, animation: 'pulse 1.5s ease-in-out infinite' }} />
          {[1,2,3,4,5].map(n => (
            <div key={n} style={{ height: 18, borderRadius: 6, background: 'var(--gray2)', marginBottom: 12, width: n % 2 === 0 ? '90%' : '100%', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!article) return null;

  const cat     = CATEGORY_CONFIG[article.category] || DEFAULT_CAT;
  const CatIcon = cat.icon;
  const examTags = EXAM_TAGS[article.category] || ['UPSC'];

  // Parse paragraphs from content or summary
  const bodyText  = article.content || article.summary || '';
  const paragraphs = bodyText.split(/\n+/).filter(p => p.trim().length > 0);

  return (
    <div className="landing-page min-h-screen" style={{ background: 'var(--bg)', paddingBottom: 80 }}>

      {/* ── NAVBAR minimal ─────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(var(--bg-rgb, 248,250,252), 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--gray2)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={() => navigate('/current-affairs')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text)', fontWeight: 600, fontSize: 15,
          }}
        >
          <ArrowLeft size={18} /> Back to Current Affairs
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={toggleBookmark}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: bookmarked ? 'rgba(255,107,0,0.12)' : 'var(--gray1)',
              border: '1px solid var(--gray2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: bookmarked ? 'var(--orange)' : 'var(--gray4)',
            }}
          >
            {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
          <button
            onClick={handleShare}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--gray1)', border: '1px solid var(--gray2)',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--gray4)',
            }}
          >
            <Share2 size={18} />
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 0', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }}>

        {/* LEFT: Article */}
        <article>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray3)', marginBottom: 24 }}>
            <Link to="/current-affairs" style={{ color: 'var(--orange)', fontWeight: 600 }}>Current Affairs</Link>
            <ChevronRight size={14} />
            <span>{article.category}</span>
          </div>

          {/* Category + Trending badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 30, fontSize: 13, fontWeight: 700,
              background: cat.bg, color: cat.color, border: `1px solid ${cat.color}33`,
            }}>
              <CatIcon size={14} /> {article.category}
            </span>
            {article.is_trending && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 30, fontSize: 13, fontWeight: 700,
                background: 'rgba(255,107,0,0.12)', color: 'var(--orange)',
                border: '1px solid rgba(255,107,0,0.25)',
              }}>
                <TrendingUp size={14} /> Trending
              </span>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900,
            lineHeight: 1.2, marginBottom: 20, color: 'var(--text)',
          }}>
            {article.title}
          </h1>

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray3)' }}>
              <Calendar size={14} /> {formatDate(article.published_at)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray3)' }}>
              <Clock size={14} /> {article.read_time || '4 min read'}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 4, borderRadius: 4, background: `linear-gradient(90deg, ${cat.color}, transparent)`, marginBottom: 32 }} />

          {/* Summary highlight box */}
          {article.summary && (
            <div style={{
              background: cat.bg, border: `1.5px solid ${cat.color}33`,
              borderLeft: `4px solid ${cat.color}`,
              borderRadius: 16, padding: '20px 24px', marginBottom: 32,
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: cat.color, marginBottom: 8, textTransform: 'uppercase' }}>
                📌 Key Summary
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text)', fontWeight: 500, margin: 0 }}>
                {article.summary}
              </p>
            </div>
          )}

          {/* Full content body */}
          <div style={{ fontSize: 16, lineHeight: 1.85, color: 'var(--gray4)' }}>
            {paragraphs.length > 0 ? (
              paragraphs.map((para, i) => (
                <p key={i} style={{ marginBottom: 20 }}>{para}</p>
              ))
            ) : (
              <p style={{ marginBottom: 20 }}>
                {article.summary || 'Full article content coming soon. Follow VidyaJaya for the latest updates.'}
              </p>
            )}
          </div>

          {/* Exam relevance tags */}
          <div style={{
            marginTop: 40, padding: '20px 24px',
            background: 'var(--white)', borderRadius: 16,
            border: '1.5px solid var(--gray2)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--gray3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              📋 Relevant For
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {examTags.map(tag => (
                <span key={tag} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                  background: 'rgba(255,107,0,0.1)', color: 'var(--orange)',
                  border: '1px solid rgba(255,107,0,0.2)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Source link */}
          {article.source_url && (
            <div style={{ marginTop: 20 }}>
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 13, color: 'var(--gray3)', fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={14} /> Read full article at source
              </a>
            </div>
          )}

          {/* Quiz CTA */}
          <div style={{
            marginTop: 40,
            background: 'linear-gradient(135deg, var(--navy, #0A2540), #0D3060)',
            borderRadius: 24, padding: '32px 36px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, marginBottom: 6 }}>TEST YOUR KNOWLEDGE</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Take Today's Daily Quiz</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0 }}>180 Questions · Free · Timed</p>
            </div>
            <Link
              to="/ai-questions"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--orange, #FF6B00)', color: '#fff',
                padding: '14px 28px', borderRadius: 14,
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <Zap size={16} fill="currentColor" /> Start Quiz
            </Link>
          </div>
        </article>

        {/* RIGHT: Sidebar */}
        <aside style={{ position: 'sticky', top: 80 }}>

          {/* Today's date chip */}
          <div style={{
            background: 'var(--white)', border: '1.5px solid var(--gray2)',
            borderRadius: 16, padding: '16px 20px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(255,107,0,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>📅</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray3)', letterSpacing: 1, textTransform: 'uppercase' }}>Today</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Related articles */}
          <div style={{
            background: 'var(--white)', border: '1.5px solid var(--gray2)',
            borderRadius: 20, padding: '20px', marginBottom: 20,
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--gray3)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              Related Articles
            </div>
            {related.length === 0 ? (
              <RelatedSkeleton />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {related.map((rel, i) => {
                  const rc = CATEGORY_CONFIG[rel.category] || DEFAULT_CAT;
                  return (
                    <Link
                      key={rel.id}
                      to={`/current-affairs/${rel.id}`}
                      style={{
                        display: 'block', textDecoration: 'none',
                        padding: '14px 0',
                        borderBottom: i < related.length - 1 ? '1px solid var(--gray2)' : 'none',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: rc.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {rel.category}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
                        {rel.title.length > 80 ? rel.title.substring(0, 80) + '…' : rel.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gray3)', marginTop: 4 }}>
                        {rel.read_time || '4 min read'}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            <Link
              to="/current-affairs"
              style={{
                display: 'block', marginTop: 16, textAlign: 'center',
                fontSize: 13, fontWeight: 700, color: 'var(--orange)',
                textDecoration: 'none',
              }}
            >
              View all articles →
            </Link>
          </div>

          {/* VidyaJaya promo */}
          <div style={{
            background: 'linear-gradient(135deg, #0A2540, #1a3a6a)',
            borderRadius: 20, padding: '24px',
          }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>🎯</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 8, lineHeight: 1.3 }}>
              Prepare smarter with VidyaJaya
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16, lineHeight: 1.6 }}>
              Daily CA + PYQs + AI Doubt Solver. 100% Free.
            </p>
            <Link
              to="/signup"
              style={{
                display: 'block', textAlign: 'center',
                background: 'var(--orange, #FF6B00)', color: '#fff',
                padding: '12px 20px', borderRadius: 12,
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
              }}
            >
              Start Free →
            </Link>
          </div>
        </aside>
      </div>

      {/* Mobile: show sidebar below article */}
      <style>{`
        @media (max-width: 768px) {
          .ca-detail-grid { grid-template-columns: 1fr !important; }
          aside { position: static !important; }
        }
      `}</style>
    </div>
  );
}
