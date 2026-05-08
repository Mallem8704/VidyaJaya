import React, { useRef, useState } from 'react';
import { X, Download, Share2, Award, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const CertificateModal = ({ isOpen, onClose, data }) => {
  const certificateRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsGenerating(true);
    const loadToast = toast.loading("Generating your certificate...");

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `VidyaJaya_Certificate_${data.userName.replace(/\s+/g, '_')}.png`;
      link.click();
      
      toast.dismiss(loadToast);
      toast.success("Certificate downloaded! Share it on WhatsApp!");
    } catch (err) {
      console.error("Certificate generation failed:", err);
      toast.dismiss(loadToast);
      toast.error("Failed to generate certificate.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-700" />
        </button>

        <div className="p-8 md:p-12 overflow-x-auto">
          {/* THE CERTIFICATE (This is what will be captured) */}
          <div 
            ref={certificateRef}
            className="certificate-container relative w-[800px] h-[560px] bg-white p-2 mx-auto shadow-sm"
            style={{ 
              fontFamily: "'Playfair Display', serif",
              border: '20px solid #0A2540'
            }}
          >
            {/* Inner Border */}
            <div className="w-full h-full border-4 border-[#FF6B00] p-12 flex flex-col items-center text-center relative overflow-hidden">
              
              {/* Watermark Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none rotate-[-30deg]">
                <span className="text-8xl font-black">VIDYAJAYA AI</span>
              </div>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#0A2540] rounded-lg flex items-center justify-center">
                    <Trophy className="text-[#FF6B00]" size={24} />
                  </div>
                  <span className="text-2xl font-black text-[#0A2540]" style={{ fontFamily: 'sans-serif' }}>Vidya<span className="text-[#FF6B00]">Jaya</span></span>
                </div>
                <div className="text-[#FF6B00] font-bold tracking-[0.2em] text-sm uppercase mb-8">Certificate of Excellence</div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col items-center">
                <p className="text-gray-600 italic text-lg mb-4">This is to certify that</p>
                <h2 className="text-5xl font-black text-[#0A2540] mb-6 capitalize">{data.userName}</h2>
                <p className="text-gray-600 text-lg max-w-lg leading-relaxed">
                  has successfully completed the <span className="font-bold text-[#0A2540]">{data.testTitle}</span> with an outstanding accuracy of
                </p>
                <div className="my-6">
                  <span className="text-6xl font-black text-[#FF6B00]">{data.accuracy}%</span>
                </div>
                <p className="text-gray-500 text-sm italic">
                  Achieved on {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Footer / Seal */}
              <div className="w-full flex justify-between items-end mt-8">
                <div className="text-left">
                  <div className="w-32 border-b-2 border-gray-300 mb-2"></div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Verification ID: VJ-{Math.random().toString(36).substring(7).toUpperCase()}</p>
                </div>

                <div className="relative">
                  {/* Seal UI */}
                  <div className="w-24 h-24 rounded-full bg-[#FFD700] border-4 border-[#B8860B] flex items-center justify-center shadow-lg transform rotate-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"></div>
                    <div className="flex flex-col items-center">
                      <ShieldCheck className="text-[#B8860B]" size={32} />
                      <span className="text-[8px] font-bold text-[#B8860B] uppercase">AI VERIFIED</span>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="text-[#FF6B00] animate-pulse" size={20} />
                  </div>
                </div>

                <div className="text-right">
                  <img src="/logo.png" alt="Stamp" className="w-16 h-16 opacity-20 grayscale mb-1" />
                  <p className="text-xs font-bold text-[#0A2540]">VidyaJaya Academy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-[#0A2540]">Achievement Unlocked!</h4>
            <p className="text-sm text-gray-500">Download and share your rank on WhatsApp Status or LinkedIn.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 sm:flex-none btn bg-[#0A2540] hover:bg-[#1a3a5a] text-white px-6 py-2.5 flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-900/20"
            >
              <Download size={18} />
              {isGenerating ? "Processing..." : "Download Certificate"}
            </button>
            <button 
              onClick={() => {
                const text = `🏆 Check out my VidyaJaya Achievement! I scored ${data.accuracy}% in ${data.testTitle}. \n\nJoin me on VidyaJaya: ${window.location.origin}/signup`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="p-2.5 bg-[#25D366] text-white rounded-xl hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-500/20"
              title="Share to WhatsApp"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
