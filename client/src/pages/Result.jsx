import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle, XCircle, Clock, ChevronRight, Share2, Award, Loader2, FastForward, Bot } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Result = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(`/api/submissions/${id}`);
        setSubmission(res.data);
      } catch (err) {
        console.error('Error fetching result:', err);
        toast.error('Could not load test results');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-medium">Result not found</p>
        <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const percentage = submission.accuracy || 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const formatTime = (seconds) => {
    if (!seconds) return '0m 0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const topicData = (submission.topicWise || []).map(t => {
    const score = t.total === 0 ? 0 : Math.round((t.correct / t.total) * 100);
    return {
      name: t.topic || 'General',
      score,
      fill: score >= 80 ? '#00C853' : score >= 50 ? '#FF6B00' : '#EF4444'
    };
  });
  topicData.sort((a, b) => b.score - a.score);

  const bestTopic = topicData[0];
  const worstTopic = topicData[topicData.length - 1];
  const realAnswers = submission.answers || [];
  const displayedAnswers = showAllAnswers ? realAnswers : realAnswers.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12 mt-4 px-4 overflow-x-hidden">

      {/* Nav Bar */}
      <div className="flex justify-between items-center bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <Link to="/dashboard" className="text-[var(--text-secondary)] hover:text-primary flex items-center gap-1 font-medium text-sm transition-colors">
          <ChevronRight className="rotate-180" size={16} /> Back to Dashboard
        </Link>
        <div className="flex gap-3">
          <button className="btn btn-outline text-sm py-1.5 px-3 flex gap-2"><Share2 size={16}/> Share</button>
          <Link to="/tests" className="btn btn-primary text-sm py-1.5 px-3">Take Another</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden bg-primary text-white"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary blur-3xl opacity-30 rounded-full"></div>
            <h2 className="text-xl font-heading font-medium mb-6 text-gray-200">
              {submission.testId?.title || 'Practice Set'}
            </h2>

            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              <svg className="transform -rotate-90 w-40 h-40">
                <circle cx="80" cy="80" r="60" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="transparent" />
                <motion.circle
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="80" cy="80" r="60" stroke="#FF6B00" strokeWidth="12" fill="transparent"
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-heading font-bold">{percentage}%</span>
                <span className="text-xs text-gray-300">Accuracy</span>
              </div>
            </div>

            <p className="text-lg font-medium">
              {percentage > 70 ? 'Great performance!' : percentage > 40 ? 'Good effort!' : 'Keep practicing!'}
            </p>
            <p className="text-sm text-gray-300 px-4 mt-2">You scored {submission.score} marks.</p>

            <div className="mt-8 bg-[rgba(0,0,0,0.2)] rounded-xl p-4 w-full flex justify-between items-center border border-[rgba(255,255,255,0.1)]">
              <div>
                <div className="text-xs text-gray-400">Coins Earned</div>
                <div className="text-xl font-bold text-accent-gold flex items-center gap-1"><Award size={18}/> +{submission.coinsEarned || 0}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Status</div>
                <div className="text-xl font-bold">Completed</div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4 border flex flex-col items-center text-center bg-green-50 border-green-100 dark:bg-[#062111] dark:border-green-900">
              <CheckCircle size={28} className="text-accent-green mb-2" />
              <div className="text-2xl font-bold mb-1 text-[var(--text-primary)]">{submission.correctCount}</div>
              <div className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide">Correct</div>
            </div>
            <div className="card p-4 border flex flex-col items-center text-center bg-red-50 border-red-100 dark:bg-[#250d0d] dark:border-red-900">
              <XCircle size={28} className="text-red-500 mb-2" />
              <div className="text-2xl font-bold mb-1 text-[var(--text-primary)]">{submission.wrongCount}</div>
              <div className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide">Wrong</div>
            </div>
            <div className="card p-4 border flex flex-col items-center text-center bg-gray-50 dark:bg-[#151c27]">
              <FastForward size={28} className="text-gray-400 mb-2" />
              <div className="text-2xl font-bold mb-1 text-[var(--text-primary)]">{submission.skippedCount}</div>
              <div className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide">Skipped</div>
            </div>
            <div className="card p-4 border flex flex-col items-center text-center bg-blue-50 dark:bg-[#07192a] border-blue-100 dark:border-primary">
              <Clock size={28} className="text-primary-light mb-2" />
              <div className="text-xl font-bold mb-1 text-[var(--text-primary)]">{formatTime(submission.timeTaken)}</div>
              <div className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide">Time</div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* AI Insight */}
          <div className="card p-6 bg-gradient-to-br from-[#0B1120] to-primary border-l-4 border-accent-purple shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2 bg-accent-purple bg-opacity-20 rounded-lg text-accent-purple shrink-0">
                <Bot size={24} />
              </span>
              <h3 className="font-heading font-bold text-xl text-white">AI Performance Insight</h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-[15px] mb-6">
              {topicData.length > 0 ? (
                <>
                  Your strongest area is <strong className="text-white">{bestTopic?.name || 'General'}</strong> ({bestTopic?.score || 0}%).
                  {worstTopic && worstTopic.name !== bestTopic?.name ? (
                    <> Focus more on <strong className="text-red-400">{worstTopic.name}</strong> — you got {worstTopic.score}% there.</>
                  ) : (
                    <> Keep up the consistent performance across all areas!</>
                  )}
                  <br /><br />
                  <span className="text-accent-gold font-medium">AI Tip:</span> {worstTopic && worstTopic.score < 50 ? `Revisit the basics of ${worstTopic.name} and try 10 practice questions daily.` : 'Take a more difficult mock test to challenge your limits!'}
                </>
              ) : (
                'Complete more tests to unlock personalized AI insights based on your performance.'
              )}
            </p>
            <Link to="/analysis" className="btn bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.2)] text-sm px-5 py-2">
              Get Complete AI Plan
            </Link>
          </div>

          {/* Topic Chart */}
          {topicData.length > 0 && (
            <div className="card p-6">
              <h3 className="font-heading font-bold text-xl mb-6">Topic-Wise Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-primary)', fontWeight: 500 }} width={80} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                      {topicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Answer Review */}
          <div className="card">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="font-heading font-bold text-xl">Answer Review</h3>
              {realAnswers.length === 0 && (
                <span className="text-xs font-bold bg-primary text-white px-3 py-1 rounded-full">PRO feature</span>
              )}
            </div>
            <div className="divide-y divide-[var(--border)]">
              {realAnswers.length > 0 ? (
                displayedAnswers.map((ans, q) => {
                  const question = ans.question;
                  if (!question) return null;
                  const isCorrect = ans.selectedIndex === question.correct_index;
                  const isSkipped = ans.selectedIndex === null || ans.selectedIndex === undefined;
                  return (
                    <div key={q} className="p-6 hover:bg-[var(--bg-light)] transition-colors">
                      <div className="flex gap-4">
                        <span className="font-bold flex-shrink-0 w-8">Q{q + 1}.</span>
                        <div className="w-full">
                          <div className="flex items-center gap-2 mb-3">
                            {isSkipped ? (
                              <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded font-bold">SKIPPED</span>
                            ) : isCorrect ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold flex items-center gap-1"><CheckCircle size={10} /> CORRECT</span>
                            ) : (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">WRONG</span>
                            )}
                          </div>
                          <p className="font-medium mb-4">{question.text}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {(question.options || []).map((opt, i) => {
                              const isCorrectOpt = i === question.correct_index;
                              const isSelected = i === ans.selectedIndex;
                              return (
                                <div
                                  key={i}
                                  className={`p-3 rounded-lg border text-sm font-medium flex justify-between items-center gap-2
                                    ${isCorrectOpt
                                      ? 'border-green-500 bg-green-50 dark:bg-[rgba(0,200,83,0.1)] text-green-700 dark:text-green-400'
                                      : isSelected && !isCorrectOpt
                                        ? 'border-red-400 bg-red-50 dark:bg-[rgba(255,0,0,0.08)] text-red-600 dark:text-red-400'
                                        : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] opacity-60'
                                    }`}
                                >
                                  <span>{String.fromCharCode(65 + i)}) {opt}</span>
                                  <span className="shrink-0 text-xs font-bold">
                                    {isSelected && isCorrectOpt && <CheckCircle size={14} className="text-green-600" />}
                                    {isSelected && !isCorrectOpt && <span className="text-red-500">Your Ans</span>}
                                    {!isSelected && isCorrectOpt && <span className="text-green-600">Correct</span>}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {question.explanation && (
                            <div className="bg-blue-50 dark:bg-[rgba(59,130,246,0.08)] p-4 rounded-xl text-sm border border-blue-100 dark:border-blue-900">
                              <span className="font-bold text-blue-800 dark:text-blue-400 block mb-1">Explanation:</span>
                              {question.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-[var(--text-secondary)]">
                  <p className="font-medium mb-2">Answer review requires individual question submission data.</p>
                  <p className="text-sm">Your score and topic breakdown above are accurate.</p>
                </div>
              )}
            </div>
            {realAnswers.length > 5 && (
              <div className="p-4 text-center bg-[var(--bg-light)] rounded-b-xl border-t border-[var(--border)]">
                <button
                  onClick={() => setShowAllAnswers(!showAllAnswers)}
                  className="text-secondary font-bold text-sm hover:underline"
                >
                  {showAllAnswers ? 'Show Less ↑' : `View All ${realAnswers.length} Answers →`}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Result;
