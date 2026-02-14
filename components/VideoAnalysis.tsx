
import React, { useState } from 'react';
import { analyzeRetention } from '../services/geminiService';
import { BarChart2, Upload, Link as LinkIcon, ImageIcon, Loader2, CheckCircle2, TrendingUp } from 'lucide-react';

const VideoAnalysis: React.FC = () => {
  const [link, setLink] = useState('');
  const [image, setImage] = useState<{ b64: string; mime: string } | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleAnalyze = async () => {
    if (!link || !image) {
      alert('يرجى إكمال البيانات المطلوبة (رابط وصورة)');
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const analysis = await analyzeRetention(image.b64, image.mime, link);
      setResult(analysis);
    } catch (err: any) {
      console.error("Video analysis error:", err);
      alert('حدث خطأ أثناء التحليل. تأكد من جودة الصورة واستقرار الاتصال.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-4">
      <div className="text-center mb-8 md:mb-12">
        <div className="bg-indigo-600 w-16 h-16 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-indigo-100">
          <BarChart2 size={32} />
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">تحليل الريتنشن ثانية بثانية</h2>
        <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base px-4">ارفع صورة جراف الاحتفاظ بالجمهور ورابط الفيديو لنطبق قاعدة الـ 8 ثوانٍ ونحلل الأداء بعمق.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-start">
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-indigo-50 space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-widest">
                <LinkIcon size={14} className="text-indigo-600" /> رابط الفيديو
              </label>
              <input 
                type="text" 
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-bold text-sm" 
                placeholder="https://youtube.com/shorts/..." 
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-widest">
                <ImageIcon size={14} className="text-indigo-600" /> صورة الجراف (الريتنشن)
              </label>
              <input type="file" id="ana-img" accept="image/*" className="hidden" onChange={handleImage} disabled={isLoading} />
              <label htmlFor="ana-img" className="cursor-pointer border-3 border-dashed border-indigo-100 rounded-[2rem] p-8 md:p-12 bg-indigo-50/20 flex flex-col items-center justify-center gap-4 hover:bg-indigo-50 hover:border-indigo-300 transition-all group">
                {image ? (
                  <div className="text-emerald-600 flex flex-col items-center">
                    <CheckCircle2 size={48} />
                    <span className="mt-4 font-black text-base uppercase">تم اختيار الصورة</span>
                    <span className="text-[10px] opacity-60">اضغط للاستبدال</span>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Upload className="text-indigo-400" size={28} />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-black text-slate-600 block uppercase">ارفع لقطة شاشة</span>
                      <span className="text-[10px] text-slate-400 mt-2 font-medium">يجب أن تظهر منحنى المشاهدة بوضوح</span>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isLoading || !link || !image}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all disabled:bg-slate-300 shadow-2xl shadow-indigo-200 active:scale-[0.98]"
          >
            {isLoading ? <><Loader2 className="animate-spin" /> جاري التحليل...</> : <><TrendingUp size={24} /> بدء التحليل العميق</>}
          </button>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-indigo-50 min-h-[400px] flex flex-col">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-5">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="font-black text-lg md:text-xl text-slate-800 uppercase tracking-tight">تقرير الأداء التحليلي</h3>
          </div>
          
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-4 bg-slate-50 rounded w-full"></div>
                <div className="h-4 bg-slate-50 rounded w-5/6"></div>
                <div className="h-40 bg-slate-50 rounded-3xl w-full"></div>
                <div className="h-4 bg-slate-50 rounded w-2/3"></div>
              </div>
            ) : !result ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center space-y-5 opacity-40">
                <BarChart2 size={64} className="stroke-1" />
                <div className="max-w-[200px]">
                  <p className="font-black text-slate-500 uppercase text-sm">في انتظار البيانات</p>
                  <p className="text-[11px] mt-2 font-medium">أكمل الخطوات في اليمين لنبدأ نقد الفيديو منهجياً</p>
                </div>
              </div>
            ) : (
              <div className="prose prose-indigo max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100 text-sm md:text-base">
                  {result}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalysis;
