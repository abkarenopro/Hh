
import React, { useState, useEffect } from 'react';
import { Copy, Check, FileText, BrainCircuit, Clapperboard, Layers, FileDown, CheckCircle, Square, CheckSquare, Sparkles, MessageSquarePlus, Send, X } from 'lucide-react';

interface ResultProps {
  content: string;
}

interface ParsedResult {
  title: string;
  classification: string;
  cleanScript: string;
  analyticalTable: string;
  suggestedScenesTable: string;
}

const Result: React.FC<ResultProps> = ({ content }) => {
  const [results, setResults] = useState<ParsedResult[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  useEffect(() => {
    if (content) {
      // تقسيم المحتوى مع تنظيف المسافات
      let segments = content.split('<<<RESULT_SEPARATOR>>>').map(s => s.trim()).filter(s => s.length > 50);

      const parsed = segments.map(raw => {
        // استخراج العنوان والتصنيف بدقة (يدعم وجود النجوم أو عدمها)
        const titleMatch = raw.match(/(?:^|\n)(?:\*\*|)*العنوان:(?:\*\*|)*\s*(.*?)(?:\n|$)/i);
        const classMatch = raw.match(/(?:^|\n)(?:\*\*|)*التصنيف:(?:\*\*|)*\s*(.*?)(?:\n|$)/i);

        const extract = (sectionName: string) => {
          // Regex محسّن جداً يجد القسم حتى لو كان محاطاً بنجوم أو زخارف
          const regex = new RegExp(`(?:\\*\\*|)*--- SECTION: ${sectionName} ---(?:\\*\\*|)*([\\s\\S]*?)(?=(?:\\*\\*|)*--- SECTION:|<<<|$)`, 'i');
          const match = raw.match(regex);
          return match ? match[1].trim() : "";
        };

        return {
          title: titleMatch ? titleMatch[1].replace(/\*/g, '').trim() : "نموذج استراتيجي",
          classification: classMatch ? classMatch[1].replace(/\*/g, '').trim() : "فيديو احترافي",
          cleanScript: extract('CLEAN_SCRIPT'),
          analyticalTable: extract('ANALYTICAL_TABLE'),
          suggestedScenesTable: extract('SUGGESTED_SCENES_TABLE')
        };
      });

      setResults(parsed.slice(0, 7));
    }
  }, [content]);

  const toggleSelect = (index: number) => {
    setSelectedIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  if (!results.length) return null;

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xl border border-indigo-50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
            <Layers size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">النتائج الاستراتيجية الـ 7</h2>
            <p className="text-xs text-slate-500">تم تطبيق منهج القالب السباعي و VSL</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all text-sm">
          <FileDown size={18} /> تصدير تقرير PDF
        </button>
      </div>

      <div className="flex flex-col gap-12">
        {results.map((res, idx) => (
          <ResultCard 
            key={idx} 
            data={res} 
            index={idx} 
            isAiSuggestion={idx === 6}
            isSelected={selectedIndices.includes(idx)}
            onToggle={() => toggleSelect(idx)}
          />
        ))}
      </div>
    </div>
  );
};

const DynamicTable: React.FC<{ text: string; accentColor: string; classification: string }> = ({ text, accentColor, classification }) => {
  // تنظيف الأسطر واستخراج ما يبدأ برقم فقط
  const lines = text.split('\n')
    .map(l => l.trim().replace(/^\*\*|\*\*$/g, ''))
    .filter(l => /^\d+[\.\)-]/.test(l));
  
  const isVsl = classification.toLowerCase().includes('vsl');
  const stages = isVsl ? [
    "1. الـ Hook", "2. الـ Context", "3. الـ Proof", "4. Social Proof", "5. الـ Pain", 
    "6. الحل", "7. التفاصيل", "8. البونصات", "9. السعر والضمان", "10. الـ CTA"
  ] : [
    "1. الهوك", "2. السياق", "3. الصراع", "4. العقبة", "5. الذروة", "6. النتيجة", "7. الـ CTA"
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right border-collapse border border-slate-200">
        <thead>
          <tr className="bg-slate-50">
            <th className="p-3 border border-slate-200 text-[10px] font-black text-slate-500 w-1/3">المرحلة</th>
            <th className="p-3 border border-slate-200 text-[10px] font-black text-slate-500">المحتوى</th>
          </tr>
        </thead>
        <tbody>
          {stages.map((stage, i) => {
            const num = i + 1;
            const matchedLine = lines.find(l => l.startsWith(`${num}.`) || l.startsWith(`${num}-`) || l.startsWith(`${num})`));
            let content = "جاري التحليل...";
            
            if (matchedLine) {
              content = matchedLine.replace(/^\d+[\.\)-]\s*/, '').trim();
              if (content.includes(':')) content = content.split(':').slice(1).join(':').trim();
            }

            return (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className={`p-3 border border-slate-200 font-black text-[11px] ${accentColor} bg-slate-50/30`}>{stage.split('. ')[1] || stage}</td>
                <td className="p-3 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">{content}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const ResultCard: React.FC<{ data: ParsedResult; index: number; isAiSuggestion: boolean; isSelected: boolean; onToggle: () => void }> = ({ data, index, isAiSuggestion, isSelected, onToggle }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  const saveNote = () => {
    const userStr = localStorage.getItem('am_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.userStyleNotes = [...(user.userStyleNotes || []), noteContent];
      localStorage.setItem('am_user', JSON.stringify(user));
      setIsNoteSaved(true);
      setTimeout(() => { setShowNotes(false); setIsNoteSaved(false); }, 1500);
    }
  };

  return (
    <div className={`relative bg-white rounded-[2.5rem] shadow-2xl border-2 transition-all ${isSelected ? (isAiSuggestion ? 'border-amber-400 ring-8 ring-amber-50' : 'border-indigo-500 ring-8 ring-indigo-50') : 'border-slate-100'}`}>
      <div className={`p-6 flex justify-between items-center ${isSelected ? (isAiSuggestion ? 'bg-amber-600' : 'bg-indigo-600') : 'bg-slate-100'} text-white rounded-t-[2.4rem]`}>
        <div className="flex items-center gap-4">
          <button onClick={onToggle}>
            {isSelected ? <CheckSquare size={24} /> : <Square size={24} className="text-white/40" />}
          </button>
          <div>
            <span className="font-black text-[10px] uppercase tracking-widest">{isAiSuggestion ? "اقتراح ذكي من AI" : `النموذج المنهجي رقم ${index + 1}`}</span>
            <h3 className="text-lg md:text-xl font-black">{data.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-3 py-1 bg-white/20 rounded-full font-bold uppercase">{data.classification}</span>
          <button onClick={() => navigator.clipboard.writeText(data.cleanScript)} className="p-2 bg-white/10 rounded-lg"><Copy size={16} /></button>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-10">
        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
          <h4 className="text-xs font-black text-indigo-600 mb-4 flex items-center gap-2 uppercase">
            <FileText size={16} /> السكربت الصافي
          </h4>
          <div className="text-xl md:text-2xl text-slate-800 leading-relaxed font-black text-right whitespace-pre-wrap">
            {data.cleanScript || "نص السكربت قيد المعالجة..."}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 px-2 font-black text-xs uppercase">
              <BrainCircuit size={18} /> التحليل الاستراتيجي
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <DynamicTable text={data.analyticalTable} accentColor="text-indigo-600" classification={data.classification} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 px-2 font-black text-xs uppercase">
              <Clapperboard size={18} /> الإخراج البصري
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <DynamicTable text={data.suggestedScenesTable} accentColor="text-emerald-600" classification={data.classification} />
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-6 border-t border-slate-100">
          <button 
            onClick={() => setShowNotes(true)}
            className="flex items-center gap-3 px-10 py-5 bg-indigo-50 text-indigo-700 rounded-2xl font-black text-sm hover:bg-indigo-100 transition-all shadow-lg active:scale-95"
          >
            <MessageSquarePlus size={22} /> إضافة تعديلات يدوية
          </button>
        </div>
      </div>

      {showNotes && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 relative border border-indigo-50">
            <button onClick={() => setShowNotes(false)} className="absolute top-8 left-8 text-slate-400"><X size={28} /></button>
            <h3 className="text-2xl font-black text-slate-800 mb-6 text-right">تعديلاتك الخاصة</h3>
            <textarea 
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full h-48 p-6 bg-slate-50 border-2 border-slate-200 rounded-[2rem] outline-none text-right font-bold"
              placeholder="اكتب ملاحظاتك..."
            />
            <button 
              onClick={saveNote}
              className={`w-full mt-6 py-5 rounded-2xl font-black transition-all ${isNoteSaved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {isNoteSaved ? "تم الحفظ!" : "حفظ التعديلات"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Result;
