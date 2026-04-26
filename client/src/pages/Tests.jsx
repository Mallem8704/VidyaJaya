import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import ProUpgradeModal from '../components/ProUpgradeModal';
import { useAuthStore } from '../store/authStore';
import { Lock, BookOpen, Filter, Share2, Award, CheckCircle, Clock, X, Book, Search, Sparkles, ArrowRight } from 'lucide-react';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useAuthStore();

  const isUserPro = user?.is_pro || user?.role === 'admin';

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axios.get('/api/tests');
        setTests(res.data);
      } catch (err) {
        console.error('Error fetching tests:', err);
        toast.error('Failed to load tests');
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  // BUG 10 FIX: Apply category filter from query param on load
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setActiveFilter(categoryParam);
    }
  }, [searchParams]);

  const clearCategoryFilter = () => {
    setActiveFilter('All');
    setSearchParams({});
  };

  const handleTestClick = (e, test) => {
    if (test.is_premium && !isUserPro) {
      e.preventDefault();
      // Option 1: Show modal (current behavior)
      setShowUpgradeModal(true);
      // Option 2: Redirect to pricing (as per new requirement)
      // window.location.href = '/pricing'; 
    }
  };
  
  const filteredTests = activeFilter === 'All' 
    ? tests 
    : tests.filter(t => 
        t.category === activeFilter || 
        (activeFilter === 'PRO' && t.is_premium) ||
        // BUG 10 FIX: Also match category from practice page (partial match)
        t.category?.toLowerCase().includes(activeFilter.toLowerCase())
      );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-white rounded-full animate-spin"></div>
        <p className="text-secondary font-bold font-heading animate-pulse">Loading Tests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-primary text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
         <div className="relative z-10 w-full md:w-2/3">
           <h2 className="text-3xl font-heading font-bold flex items-center gap-2 mb-2">
             <BookOpen size={28} className="text-secondary" /> Exam Simulation Center
           </h2>
           <p className="text-gray-300 mb-6">Take rigorous mock tests designed by experts and graded instantly by AI.</p>
           
           <div className="flex gap-2 bg-[rgba(255,255,255,0.1)] p-1 rounded-xl w-max border border-[rgba(255,255,255,0.1)] backdrop-blur-sm">
             {['All', 'UPSC', 'SSC', 'PRO'].map(f => (
               <button 
                 key={f}
                 onClick={() => { setActiveFilter(f); setSearchParams({}); }}
                 className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeFilter === f ? 'bg-secondary text-white shadow-md' : 'text-gray-300 hover:text-white'}`}
               >
                 {f}
               </button>
             ))}
           </div>
         </div>

         {!isUserPro && (
           <Link to="/pro-tests" className="relative z-10 flex flex-col items-center bg-gradient-to-br from-accent-gold to-yellow-600 p-4 rounded-xl shadow-lg hover:scale-[1.02] transition-all group">
             <div className="flex items-center gap-2 text-[#0a2540] font-black text-sm mb-1">
               <Sparkles size={16} />
               GO PREMIUM
             </div>
             <p className="text-[10px] text-[#0a2540]/80 font-bold text-center">Unlock 50+ High-Quality Mock Tests & Earn Rewards</p>
             <ArrowRight size={18} className="mt-2 text-[#0a2540] group-hover:translate-x-1 transition-transform" />
           </Link>
         )}
      </div>

      <div className="flex justify-between items-center px-2">
         <div className="flex items-center gap-3">
           <h3 className="font-heading font-bold text-xl">Available Test Series ({filteredTests.length})</h3>
           {/* BUG 10 FIX: Show active category filter badge with clear button */}
           {activeFilter !== 'All' && !['UPSC', 'SSC', 'PRO'].includes(activeFilter) && (
             <span className="flex items-center gap-1 text-xs bg-secondary text-white px-3 py-1 rounded-full font-bold">
               {activeFilter}
               <button onClick={clearCategoryFilter} className="hover:opacity-70">
                 <X size={12} />
               </button>
             </span>
           )}
         </div>
         <button className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><Filter size={16}/> Sort By: Newest</button>
      </div>

      {tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Book size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">No Tests Available Yet</h3>
          <p className="text-[var(--text-secondary)] max-w-md mb-6">The daily contest loads automatically at midnight. Check back soon or ask an admin to seed test data.</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">No Tests Found for "{activeFilter}"</h3>
          <p className="text-[var(--text-secondary)] mb-6">Try a different category or view all tests.</p>
          <button onClick={clearCategoryFilter} className="btn btn-primary">View All Tests</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTests.map((test, idx) => {
            const isLocked = test.is_premium && !isUserPro;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={test.id} 
                className={`card group hover:-translate-y-1 transition-all border border-[var(--border)] ${isLocked ? 'hover:border-accent-gold' : 'hover:border-primary'} overflow-hidden flex flex-col relative`}
              >
                {isLocked && (
                  <div className="absolute top-2 right-2 z-20">
                    <div className="p-1.5 bg-accent-gold/10 text-accent-gold rounded-full backdrop-blur-sm border border-accent-gold/20">
                      <Lock size={14} />
                    </div>
                  </div>
                )}

                <div className={`p-4 border-b border-[var(--border)] flex justify-between items-start ${test.is_premium ? 'bg-amber-50/10' : 'bg-[var(--bg-light)]'}`}>
                   <span className={`text-xs font-bold px-2 py-0.5 rounded ${test.category === 'UPSC' ? 'bg-blue-100 text-blue-700 dark:bg-[#07192a] dark:text-blue-400' : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                     {test.category}
                   </span>
                   {test.is_premium ? (
                     <span className="text-[10px] bg-accent-gold text-white font-bold px-2 py-0.5 rounded shadow flex items-center gap-1"><Award size={10}/> PRO</span>
                   ) : (
                     <span className="text-[10px] text-accent-green font-bold px-2 py-0.5 flex items-center gap-1"><CheckCircle size={12}/> FREE</span>
                   )}
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                   <h4 className="font-bold text-lg leading-tight mb-4">{test.title}</h4>
                   
                   <div className="flex gap-4 text-sm text-[var(--text-secondary)] mb-6 mt-auto">
                     <div className="flex items-center gap-1"><Clock size={16}/> {Math.round((test.duration || 0) / 60)}m</div>
                     <div className="flex items-center gap-1"><BookOpen size={16}/> {test.total_questions} Qs</div>
                   </div>
                   
                   <div className="flex gap-3">
                     <Link 
                       to={isLocked ? '/pricing' : `/test/${test.id}`} 
                       className={`flex-1 btn ${isLocked ? 'bg-gradient-to-r from-accent-gold to-yellow-600 text-white' : 'btn-primary'} text-center py-2 flex items-center justify-center gap-2`}
                     >
                       {isLocked ? (
                         <>
                           <Lock size={16} />
                           Unlock with PRO
                         </>
                       ) : 'Take Test'}
                     </Link>
                     <button className="p-2 border border-[var(--border)] rounded-lg hover:bg-[var(--bg-light)] text-[var(--text-secondary)]"><Share2 size={20}/></button>
                   </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ProUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        feature="tests"
      />
      
    </div>
  );
};

export default Tests;
