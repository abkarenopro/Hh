
import React, { useState } from 'react';
import { Trophy, Link as LinkIcon, FileText, Loader2, CheckCircle2, AlertCircle, Brain } from 'lucide-react';
import { verifyAndLearnScript } from '../services/geminiService';
import { SuccessPattern } from '../types';

interface LearnScriptProps {
  onPatternLearned: (pattern: SuccessPattern) => void;
}

const LearnScript: React.FC<LearnScriptProps> = ({ onPatternLearned }) => {
  const [link, setLink] = useState('');
  const [script, setScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLearn = async () => {
    if (!link && !script) return;
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await verifyAndLearnScript(link, script);
      if (result.isVerified && result.pattern) {
        const newPattern: SuccessPattern = {
          id: Date.now().toString(),
          type: result.pattern.type as any,
          hookStyle: result.pattern.hookStyle!,
          structure: result.pattern.structure!,
          pacing: result.pattern.pacing!,
          persuasionTechnique: result.pattern.persuasionTechnique!,
          verifiedLink: link
        };
        onPatternLearned(newPattern);
        setMessage({ type: 'success', text: 'تم التحقق من الرابط واستخلاص أنماط النجاح! سيتم استخدامها في كتاباتك القادمة.' });
        setLink('');
        setScript('');
      } else {
        setMessage({ type: 'error', text: 'فشل التحقق. يجب أن يحقق الفيديو 100,000 مشاهدة على الأقل للتعلّم منه.' });
      }
    } catch (err: any) {
      console.error("Learn script error:", err);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الاتصال بالنظام.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
          <Trophy className="text-white" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">أضف اسكربت ناجح للتعلّم</h2>
        <p className="text-slate-600">تعلّم من أنماط الفيديوهات التي حققت ملايين المشاهدات لتحسين كتاباتك</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <LinkIcon size={18} className="text-indigo-600" /> رابط الفيديو (اختياري للتحقق)
            </label>
            <input 
              type="text" 
              value={link}
              onChange={e => setLink(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              placeholder="https://youtube.com/..."
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" /> نص السكربت (اختياري للاستخلاص)
            </label>
            <textarea 
              value={script}
              onChange={e => setScript(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 outline-none transition-all h-48 resize-none"
              placeholder="ضع نص السكربت الناجح هنا..."
              disabled={isLoading}
            />
          </div>

          <button 
            onClick={handleLearn}
            disabled={isLoading || (!link && !script)}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md disabled:bg-slate-300"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <><Brain size={20} /> بدء التحليل والتعلّم</>}
          </button>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-center text-center">
          {message ? (
            <div className={`space-y-4 animate-fade-in ${message.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
              {message.type === 'success' ? <CheckCircle2 size={48} className="mx-auto" /> : <AlertCircle size={48} className="mx-auto" />}
              <p className="font-bold text-lg">{message.text}</p>
            </div>
          ) : (
            <div className="text-slate-400 space-y-4 opacity-70">
              <Brain size={64} className="mx-auto" />
              <div className="space-y-2">
                <p className="font-bold text-slate-600">كيف يعمل التعلّم؟</p>
                <ul className="text-xs space-y-1">
                  <li>• يتم التأكد من وصول الفيديو لـ 100 ألف مشاهدة</li>
                  <li>• نحلل سيكولوجية الهوك وبناء القصة</li>
                  <li>• نستخلص "النمط" وليس "النص"</li>
                  <li>• نستخدم هذه الأنماط فقط عند طلبك</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnScript;
