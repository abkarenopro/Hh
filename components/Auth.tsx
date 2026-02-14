
import React, { useState } from 'react';
import { User } from '../types';
import { PenTool, UserPlus, LogIn, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const usersStr = localStorage.getItem('am_users') || '[]';
    const users: User[] = JSON.parse(usersStr);

    if (isLogin) {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onAuthSuccess(user);
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } else {
      if (users.find(u => u.email === email)) {
        setError('هذا البريد الإلكتروني مسجل بالفعل');
        return;
      }
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        password
      };
      users.push(newUser);
      localStorage.setItem('am_users', JSON.stringify(users));
      onAuthSuccess(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-indigo-50">
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <PenTool className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Al-Muhtawa Pro</h1>
          <p className="text-slate-500 text-sm">نظام المناهج التعليمية لصناعة المحتوى</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">الاسم</label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-3 text-slate-400" size={18} />
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                  placeholder="اسمه الكامل"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 text-slate-400" size={18} />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                placeholder="example@mail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 text-slate-400" size={18} />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-bold hover:underline"
          >
            {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
