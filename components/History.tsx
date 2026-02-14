
import React, { useState } from 'react';
import { SavedScript, SuccessPattern } from '../types';
import { Calendar, Tag, Target, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Image as ImageIcon, Loader2, ShieldCheck, PlayCircle, FileText, Clapperboard, BrainCircuit, X } from 'lucide-react';
import { analyzeRetention, verifyAndLearnScript } from '../services/geminiService';

interface HistoryProps {
  scripts: SavedScript[];
  onUpdate: (script: SavedScript) => void;
  onNewPattern?: (pattern: SuccessPattern) => void;
}

const History: React.FC<HistoryProps> = ({ scripts, onUpdate, onNewPattern }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [views, setViews] = useState('');
  const [link, setLink] = useState('');
  const [image, setImage] = useState<{ b64: string; mime: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const startEvaluation = (id: string, status: 'success' | 'weak') => {
    setEvaluatingId(id);
    setViews('');
    setLink('');
    setImage(null);
    setFeedback(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = (reader.result as string).split(',')[1];
        setImage({ b64, mime: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const parseScriptContent = (text: string) => {
    const titleMatch = text.match(/العنوان:\s*(.*?)(?:\n|التصنيف)/);
    const title = titleMatch ? titleMatch[1].trim() : "عنوان غير متوفر";
    const cleanScript = (text.split('--- SECTION: CLEAN_SCRIPT ---')[1] || "").split('--- SECTION:')[0].trim();
    const analyticalScript = (text.split('--- SECTION: ANALYTICAL_TABLE ---')[1] || "").split('--- SECTION:')[0].trim();
    const suggestedScenes = (text.split('--- SECTION: SUGGESTED_SCENES_TABLE ---')[1] || "").trim();
    return { title, cleanScript, analyticalScript, suggestedScenes };
  };

  const saveEvaluation = async (script: SavedScript, status: 'success' | 'weak') => {
    if (status === 'success' && !link) {
      setFeedback("يرجى إدخال رابط الفيديو للتحقق.");
      return;
    }
    
    setIsProcessing(true);
    let analysisResult = '';
    let isVerified = false;

    try {
      if (status === 'weak' && image) {
        analysisResult = await analyzeRetention(image.b64, image.mime, link, script.text);
      } else if (status === 'success' && link) {
        const verification = await verifyAndLearnScript(link, script.text);
        if (verification.isVerified && verification.pattern) {
          isVerified = true;
          if (onNewPattern) {
            onNewPattern({
              id: Date.now().toString(),
              type: verification.pattern.type as any,
              verifiedLink: link,
              hookStyle: verification.pattern.hookStyle!,
              structure: verification.pattern.structure!,
              pacing: verification.pattern.pacing!,
              persuasionTechnique: verification.pattern.persuasionTechnique!
            });
          }
          setFeedback("تم التحقق! السكربت ناجح مؤكد. ✅");
        } else {
          setFeedback("المشاهدات أقل من 100 ألف. حفظ يدوي.");
        }
      }
    } catch (err: any) {
      console.error("Evaluation error:", err);
      setFeedback("خطأ أثناء العملية.");
    }

    onUpdate({ ...script, status, views, link, retentionAnalysis: analysisResult, isVerified });
    setIsProcessing(false);
    if (!feedback) setEvaluatingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg"><Tag size={20} /></div>
          الأرشيف المنهجي
        </h2>
        <span className="text-xs font-bold text-slate-400">{scripts.length} سكربت</span>
      </div>

      {scripts.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl text-center text-slate-300 border border-dashed border-slate-200">لا توجد بيانات مسجلة</div>
      ) : (
        <div className="space-y-4">
          {scripts.map(script => {
            const { title, cleanScript, analyticalScript, suggestedScenes } = parseScriptContent(script.text);
            return (
              <div key={script.id} className={`bg-white rounded-3xl shadow-md border-2 transition-all ${expandedId === script.id ? 'border-indigo-500' : 'border-slate-50'}`}>
                <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-3xl" onClick={() => toggleExpand(script.id)}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl shadow-inner ${script.isVerified ? 'bg-emerald-50 text-emerald-600' : script.status === 'success' ? 'bg-green-50 text-green-600' : script.status === 'weak' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                      {script.isVerified ? <ShieldCheck size={20} /> : script.status === 'success' ? <ThumbsUp size={20} /> : script.status === 'weak' ? <ThumbsDown size={20} /> : <Target size={20} />}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 line-clamp-1 text-sm md:text-base">{title || script.domain || 'سكربت بدون عنوان'}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-bold">
                        <span className="flex items-center gap-1 uppercase tracking-wider"><Calendar size={12} /> {new Date(script.date).toLocaleDateString('ar-EG')}</span>
                        {script.isVerified && <span className="text-emerald-500">● ناجح (+100k)</span>}
                      </div>
                    </div>
                  </div>
                  {expandedId === script.id ? <ChevronUp className="text-indigo-600" /> : <ChevronDown className="text-slate-300" />}
                </div>

                {expandedId === script.id && (
                  <div className="p-5 md:p-8 border-t border-slate-50 space-y-6 md:space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col h-full">
                        <h5 className="text-[10px] font-black text-indigo-600 mb-3 uppercase tracking-widest flex items-center gap-2">
                          <FileText size={14} /> السكربت الصافي
                        </h5>
                        <div className="text-xs text-slate-700 whitespace-pre-wrap flex-1 font-medium">{cleanScript || script.text}</div>
                      </div>
                      <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 flex flex-col h-full">
                        <h5 className="text-[10px] font-black text-purple-600 mb-3 uppercase tracking-widest flex items-center gap-2">
                          <BrainCircuit size={14} /> التحليلي
                        </h5>
                        <div className="text-xs text-slate-700 whitespace-pre-wrap flex-1">{analyticalScript || "لا يوجد تحليل."}</div>
                      </div>
                      <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 flex flex-col h-full">
                        <h5 className="text-[10px] font-black text-emerald-600 mb-3 uppercase tracking-widest flex items-center gap-2">
                          <Clapperboard size={14} /> المشاهد
                        </h5>
                        <div className="text-xs text-slate-700 whitespace-pre-wrap flex-1 italic">{suggestedScenes || "لا توجد مشاهد."}</div>
                      </div>
                    </div>

                    {!script.status && !evaluatingId && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => startEvaluation(script.id, 'success')} className="flex-1 py-4 bg-green-600 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-sm shadow-lg shadow-green-100 hover:bg-green-700 transition-all">
                          <ThumbsUp size={18} /> اسكربت ناجح
                        </button>
                        <button onClick={() => startEvaluation(script.id, 'weak')} className="flex-1 py-4 bg-red-600 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-sm shadow-lg shadow-red-100 hover:bg-red-700 transition-all">
                          <ThumbsDown size={18} /> اسكربت ضعيف
                        </button>
                      </div>
                    )}

                    {evaluatingId === script.id && (
                      <div className="bg-indigo-600 p-6 rounded-[2rem] space-y-5 text-white shadow-2xl animate-fade-in relative">
                        <button onClick={() => setEvaluatingId(null)} className="absolute top-4 left-4 p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={16}/></button>
                        <h5 className="font-black text-lg uppercase tracking-tight">بيانات التحقق والتقييم:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="number" value={views} onChange={e => setViews(e.target.value)} className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl outline-none placeholder:text-white/50 text-sm font-bold" placeholder="إجمالي المشاهدات" disabled={isProcessing} />
                          <input type="text" value={link} onChange={e => setLink(e.target.value)} className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl outline-none placeholder:text-white/50 text-sm font-bold" placeholder="رابط الفيديو (TikTok/YT)" disabled={isProcessing} />
                        </div>
                        
                        {script.status === 'weak' && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-70">صورة الريتنشن للتحليل (اختياري)</label>
                            <input type="file" id={`img-${script.id}`} className="hidden" onChange={handleImageUpload} accept="image/*" disabled={isProcessing} />
                            <label htmlFor={`img-${script.id}`} className="flex items-center justify-center gap-3 p-4 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/10 transition-all text-xs font-bold">
                              {image ? <span className="text-emerald-400 flex items-center gap-2"><ShieldCheck size={16}/> تم اختيار الجراف</span> : <span className="flex items-center gap-2"><ImageIcon size={16}/> ارفع صورة الجراف</span>}
                            </label>
                          </div>
                        )}

                        {feedback && <div className="p-4 text-xs bg-white text-indigo-900 rounded-2xl font-black leading-relaxed shadow-lg">{feedback}</div>}
                        
                        <button onClick={() => saveEvaluation(script, script.status || 'success')} disabled={isProcessing} className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black flex justify-center items-center gap-3 hover:bg-indigo-50 disabled:bg-indigo-400 transition-all shadow-xl">
                          {isProcessing ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20}/> حفظ وتحليل النمط</>}
                        </button>
                      </div>
                    )}

                    {(script.status || script.retentionAnalysis) && (
                      <div className="bg-slate-900 p-6 rounded-3xl space-y-4 shadow-xl border border-slate-800">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${script.status === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                              {script.status === 'success' ? 'ناجح' : 'ضعيف'}
                            </span>
                            <span className="text-xs font-bold text-slate-400">المشاهدات: {script.views || 'N/A'}</span>
                          </div>
                          {script.link && <a href={script.link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 p-2 bg-slate-800 rounded-xl transition-all"><PlayCircle size={20}/></a>}
                        </div>
                        {script.retentionAnalysis && (
                          <div className="text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                            {script.retentionAnalysis}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
