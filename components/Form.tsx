
import React, { useState, useRef } from 'react';
import { ScriptRequest, VideoType, ScriptLanguage, ScriptMode, CuriosityLevel, ScriptGoal, ContentFormat } from '../types';
import { Upload, X, RefreshCw, Zap, LayoutGrid, Timer, MessageSquare, CheckCircle2, FileText, Image as ImageIcon } from 'lucide-react';

interface FormProps {
  onSubmit: (data: ScriptRequest) => void;
  isLoading: boolean;
  hasLearnedPatterns?: boolean;
}

const Form: React.FC<FormProps> = ({ onSubmit, isLoading }) => {
  const [mode, setMode] = useState<ScriptMode>(ScriptMode.FORMAT);
  const [selectedFormats, setSelectedFormats] = useState<ContentFormat[]>([]);
  const [topic, setTopic] = useState('');
  const [videoType, setVideoType] = useState<VideoType>(VideoType.SHORTS_60S);
  const [language, setLanguage] = useState<ScriptLanguage>(ScriptLanguage.EGYPTIAN);
  
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; mimeType: string; data: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatIcons: Record<string, any> = {
    [ContentFormat.VSL]: '📈',
    [ContentFormat.CHALLENGES]: '🧪',
    [ContentFormat.LISTS]: '🔢',
    [ContentFormat.COMPARISON]: '⚖️',
    [ContentFormat.MYTH_BUSTING]: '🛡️',
    [ContentFormat.WHAT_IF]: '❓',
    [ContentFormat.VIRAL_VSL]: '💰',
    [ContentFormat.SKETCH]: '🎭',
    [ContentFormat.VLOGS]: '🤳',
    [ContentFormat.QA]: '🎙️',
  };

  const toggleFormat = (f: ContentFormat) => {
    setSelectedFormats(prev => 
      prev.includes(f) ? prev.filter(item => item !== f) : [...prev, f]
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
        });
        reader.readAsDataURL(file);
        const data = await base64Promise;
        newFiles.push({ name: file.name, mimeType: file.type, data });
      }
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      mode,
      goal: ScriptGoal.VIRAL,
      selectedFormats: mode === ScriptMode.FORMAT ? selectedFormats : undefined,
      topic: topic.trim() || undefined,
      videoType, 
      language,
      curiosityLevel: CuriosityLevel.PROFESSIONAL,
      domainFiles: attachedFiles.length > 0 ? attachedFiles.map(f => ({ mimeType: f.mimeType, data: f.data })) : undefined,
    });
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-indigo-50 p-6 md:p-8 h-fit max-h-[92vh] overflow-y-auto">
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 gap-1.5 shadow-inner">
        <button 
          type="button" 
          onClick={() => setMode(ScriptMode.FORMAT)} 
          className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${mode === ScriptMode.FORMAT ? 'bg-white text-indigo-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          قسم الفورمات (6+1)
        </button>
        <button 
          type="button" 
          onClick={() => setMode(ScriptMode.GENERATION)} 
          className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${mode === ScriptMode.GENERATION ? 'bg-white text-indigo-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          إنشاء حر
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {mode === ScriptMode.FORMAT && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                <LayoutGrid size={18} className="text-indigo-600" /> 1. اختر فورمات المحتوى (9 خيارات)
              </label>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-bold">يمكنك اختيار أكثر من واحد</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {Object.values(ContentFormat).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFormat(f)}
                  className={`text-right p-3.5 rounded-2xl border-2 transition-all flex justify-between items-center group ${
                    selectedFormats.includes(f) 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-sm' 
                      : 'border-slate-100 bg-white text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{formatIcons[f] || '🎬'}</span>
                    <span className="text-[11px] font-bold leading-tight">{f}</span>
                  </div>
                  {selectedFormats.includes(f) ? (
                    <CheckCircle2 size={16} className="text-indigo-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-200 group-hover:border-indigo-300"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <label className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
            <FileText size={18} className="text-indigo-600" /> 2. أدخل محتواك (موضوع أو تعريف بمشروعك)
          </label>
          
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none text-sm h-40 text-right resize-none shadow-sm transition-all focus:ring-4 focus:ring-indigo-50"
            placeholder="اكتب هنا الموضوع الذي تريد التحدث عنه، أو عرّفنا بعملك لنقوم بتحليله وإنتاج محتوى مناسب له..."
          />
          
          <div className="grid grid-cols-1 gap-3">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-3 py-4 px-6 border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-600 bg-indigo-50/30 hover:bg-indigo-50 transition-all text-xs font-black shadow-inner"
            >
              <ImageIcon size={18} /> ارفع صورة أو ملف تعريفي (PDF/Images)
            </button>
            
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 animate-fade-in">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-md">
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button type="button" onClick={() => removeFile(idx)} className="hover:text-red-400 transition-colors"><X size={14}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 px-1 flex items-center gap-1 justify-end">
              <Timer size={12} /> المدة المستهدفة
            </label>
            <select value={videoType} onChange={(e) => setVideoType(e.target.value as VideoType)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-xs font-bold text-slate-700 text-right outline-none bg-white focus:border-indigo-300">
              {Object.values(VideoType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 px-1 flex items-center gap-1 justify-end">
              <MessageSquare size={12} /> اللهجة المطلوبة
            </label>
            <select value={language} onChange={(e) => setLanguage(e.target.value as ScriptLanguage)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-xs font-bold text-slate-700 text-right outline-none bg-white focus:border-indigo-300">
              {Object.values(ScriptLanguage).map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>
        </div>

        <button 
          disabled={isLoading || (mode === ScriptMode.FORMAT && selectedFormats.length === 0)} 
          className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 disabled:bg-slate-300 shadow-2xl shadow-indigo-100 transition-all transform active:scale-[0.97] mt-4 flex items-center justify-center gap-4"
        >
          {isLoading ? (
            <>
              <RefreshCw className="animate-spin" size={24} /> جاري تحليل المحتوى وبناء النماذج...
            </>
          ) : (
            <>
              <Zap size={24} className="fill-white" /> توليد 7 نتائج استراتيجية
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Form;
