import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, Database, PieChart, CheckCircle2 } from 'lucide-react';

export const LoginBanner: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();

  if (user) return null;

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden my-6 border border-blue-800/40">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Database className="w-3.5 h-3.5" />
            เชื่อมต่อ Firebase โปรเจกต์ sdnu-abc-sys
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            ระบบควบคุมงบประมาณรายจ่ายประจำปี หอพักบุคลากร
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            กรุณาเข้าสู่ระบบด้วยบัญชี Google เพื่อเริ่มบันทึกและควบคุมงบประมาณรายจ่ายประจำปี แยกตามปีงบประมาณและหมวดหมู่อย่างเป็นระบบ
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-300 pt-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              สรุปผลแยก 3 ประเภท 23 หมวดหมู่
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              แผนภูมิวงกลมอินเตอร์แอคทีฟ
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ส่งออก Excel และพิมพ์รายงานได้ทันที
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <button
            onClick={signInWithGoogle}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-50 font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-98"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>เข้าสู่ระบบด้วย Google ทันที</span>
          </button>
        </div>

      </div>
    </div>
  );
};
