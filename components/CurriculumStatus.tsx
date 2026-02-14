import React from 'react';
import { BookOpen, PenTool, Layers, CheckCircle2, Zap } from 'lucide-react';
import { CurriculumModule } from '../types';

const modules: CurriculumModule[] = [
  { id: '1', name: 'منهج صناعة المحتوى الأساسي', status: 'active', icon: 'book' },
  { id: '2', name: 'منهج الـ VSL & Webinar المتقدم', status: 'active', icon: 'zap' },
  { id: '3', name: 'مكتبة الهوكات والأساليب الفيروسية', status: 'active', icon: 'layers' },
];

const CurriculumStatus: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
      <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
        <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
        سجل المناهج النشطة (Advanced)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <div key={mod.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 transition-all hover:border-indigo-200 hover:bg-indigo-50/30">
            <div className={`p-2 rounded-md ${mod.icon === 'zap' ? 'bg-yellow-100 text-yellow-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {mod.icon === 'book' && <BookOpen size={18} />}
              {mod.icon === 'zap' && <Zap size={18} />}
              {mod.icon === 'layers' && <Layers size={18} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700">{mod.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">نشط ومُفعل</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurriculumStatus;