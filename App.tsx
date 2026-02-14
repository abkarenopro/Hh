
import React, { useState, useEffect } from 'react';
import { ScriptRequest, User, SavedScript, SuccessPattern } from './types';
import { generateScript } from './services/geminiService';
import Form from './components/Form';
import Result from './components/Result';
import CurriculumStatus from './components/CurriculumStatus';
import History from './components/History';
import VideoAnalysis from './components/VideoAnalysis';
import LearnScript from './components/LearnScript';
import Auth from './components/Auth';
import { PenTool, History as HistoryIcon, LogOut, BarChart2, LayoutDashboard, Trophy, Menu, X, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'form' | 'history' | 'analysis' | 'learn'>('form');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedScript[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('am_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    const savedHistory = localStorage.getItem('am_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('am_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('am_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('am_history', JSON.stringify(history));
  }, [history]);

  const handleFormSubmit = async (request: ScriptRequest) => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const generated = await generateScript(request, currentUser.learnedPatterns, currentUser.userStyleNotes);
      setResult(generated);
      
      const newScript: SavedScript = {
        id: Date.now().toString(),
        userId: currentUser.id,
        text: generated,
        goal: request.goal,
        style: request.selectedFormats?.join(', '),
        domain: request.topic || request.domainContext,
        date: new Date().toISOString(),
      };
      setHistory(prev => [newScript, ...prev]);
    } catch (err: any) {
      console.error("Script generation error:", err);
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPattern = (pattern: SuccessPattern) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? {
      ...prev,
      learnedPatterns: [...(prev.learnedPatterns || []), pattern]
    } : null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('form');
  };

  const NavItems = () => (
    <>
      <button onClick={() => { setView('form'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 text-sm font-bold p-2 transition-colors ${view === 'form' ? 'text-indigo-600 bg-indigo-50 md:bg-transparent rounded-lg' : 'text-slate-50'}`}><LayoutDashboard size={18} /> الرئيسة</button>
      <button onClick={() => { setView('history'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 text-sm font-bold p-2 transition-colors ${view === 'history' ? 'text-indigo-600 bg-indigo-50 md:bg-transparent rounded-lg' : 'text-slate-500'}`}><HistoryIcon size={18} /> سجل السكربتات</button>
      <button onClick={() => { setView('learn'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 text-sm font-bold p-2 transition-colors ${view === 'learn' ? 'text-indigo-600 bg-indigo-50 md:bg-transparent rounded-lg' : 'text-slate-500'}`}><Trophy size={18} /> أضف اسكربت ناجح</button>
      <button onClick={() => { setView('analysis'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 text-sm font-bold p-2 transition-colors ${view === 'analysis' ? 'text-indigo-600 bg-indigo-50 md:bg-transparent rounded-lg' : 'text-slate-500'}`}><BarChart2 size={18} /> تحليل الفيديو</button>
    </>
  );

  if (!currentUser) {
    return <Auth onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  const userHistory = history.filter(h => h.userId === currentUser.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-10">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg shrink-0">
              <PenTool className="text-white" size={20} />
            </div>
            <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 truncate">Al-Muhtawa Pro</h1>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <NavItems />
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden sm:inline-block text-[10px] md:text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">{currentUser.learnedPatterns?.length || 0} نمط تعلّم</span>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={18} /></button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl p-4 flex flex-col gap-4 animate-fade-in z-40">
            <NavItems />
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {view === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-4 order-1">
              <div className="lg:sticky lg:top-24">
                <Form onSubmit={handleFormSubmit} isLoading={isLoading} hasLearnedPatterns={(currentUser.learnedPatterns?.length || 0) > 0} />
              </div>
            </div>
            <div className="lg:col-span-8 order-2">
              <CurriculumStatus />
              {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-bold border border-red-100">{error}</div>}
              {isLoading && (
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 animate-pulse">
                  <div className="h-8 bg-slate-100 rounded w-1/3 mb-6"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-100 rounded w-4/6"></div>
                  </div>
                </div>
              )}
              {result && <Result content={result} />}
              {!result && !isLoading && (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 md:p-16 text-center text-slate-400 transition-all hover:border-indigo-300">
                  <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <PenTool size={32} className="opacity-30" />
                  </div>
                  <p className="font-bold text-slate-500">جاهز لبناء محتوى استراتيجي؟</p>
                  <p className="text-sm mt-2">املأ النموذج في الجانب وسأقوم بتوليد 5 نماذج احترافية لك بناءً على المنهج المتقدم.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'history' && <History scripts={userHistory} onUpdate={(u) => setHistory(p => p.map(h => h.id === u.id ? u : h))} onNewPattern={handleNewPattern} />}
        {view === 'learn' && <LearnScript onPatternLearned={handleNewPattern} />}
        {view === 'analysis' && <VideoAnalysis />}
      </main>
    </div>
  );
};

export default App;
