import axios from 'axios';
import toast from 'react-hot-toast';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  React.useEffect(() => {
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
  
  const filteredTests = activeFilter === 'All' 
    ? tests 
    : tests.filter(t => t.category === activeFilter || (activeFilter === 'PRO' && t.is_premium));

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
                 onClick={() => setActiveFilter(f)}
                 className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeFilter === f ? 'bg-secondary text-white shadow-md' : 'text-gray-300 hover:text-white'}`}
               >
                 {f}
               </button>
             ))}
           </div>
         </div>
      </div>

      <div className="flex justify-between items-center px-2">
         <h3 className="font-heading font-bold text-xl">Available Test Series ({filteredTests.length})</h3>
         <button className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><Filter size={16}/> Sort By: Newest</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTests.map((test, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={test.id} 
            className="card hover:-translate-y-1 transition-all border border-[var(--border)] hover:border-secondary overflow-hidden flex flex-col"
          >
            <div className={`p-4 border-b border-[var(--border)] flex justify-between items-start ${test.is_premium ? 'bg-[rgba(255,107,0,0.02)]' : 'bg-[var(--bg-light)]'}`}>
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
                 <div className="flex items-center gap-1"><Clock size={16}/> {Math.round(test.duration / 60)}m</div>
                 <div className="flex items-center gap-1"><BookOpen size={16}/> {test.total_questions} Qs</div>
                 <div className={`flex items-center gap-1 font-medium ${test.difficulty === 'Hard' ? 'text-red-500' : 'text-yellow-600'}`}>
                    • {test.difficulty || 'Medium'}
                 </div>
               </div>
               
               <div className="flex gap-3">
                 <Link to={`/test/${test.id}`} className={`flex-1 btn ${test.is_premium ? 'btn-outline border-accent-gold text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-[rgba(255,215,0,0.1)]' : 'btn-primary'} text-center py-2 `}>
                   {test.is_premium ? 'Unlock with PRO' : 'Take Test'}
                 </Link>
                 <button className="p-2 border border-[var(--border)] rounded-lg hover:bg-[var(--bg-light)] text-[var(--text-secondary)]"><Share2 size={20}/></button>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
      
    </div>
  );
};

export default Tests;
