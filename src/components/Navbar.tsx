import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiscalYear } from '../types/budget';
import { 
  Building2, 
  Calendar, 
  Plus, 
  LogOut, 
  LogIn, 
  Settings, 
  ShieldCheck, 
  Database,
  Coins
} from 'lucide-react';

interface NavbarProps {
  fiscalYears: FiscalYear[];
  selectedYear: string;
  onSelectYear: (year: string) => void;
  onOpenAddExpense: () => void;
  onOpenYearModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  fiscalYears,
  selectedYear,
  onSelectYear,
  onOpenAddExpense,
  onOpenYearModal,
}) => {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo & System Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight truncate">
                  หอพักบุคลากร
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <Database className="w-3 h-3" />
                  sdnu-abc-sys
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 truncate">
                ระบบควบคุมงบประมาณรายจ่ายประจำปี
              </p>
            </div>
          </div>

          {/* Controls: Year Selector & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Fiscal Year Switcher */}
            {fiscalYears.length > 0 && (
              <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                <Calendar className="w-4 h-4 text-slate-500 ml-2 mr-1 hidden sm:inline" />
                <label htmlFor="year-select" className="text-xs font-medium text-slate-600 mr-1 hidden sm:inline">
                  ปีงบฯ:
                </label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => onSelectYear(e.target.value)}
                  className="bg-white text-slate-800 text-sm font-semibold rounded-md px-2 py-1 border border-slate-200 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {fiscalYears.map((fy) => (
                    <option key={fy.id} value={fy.year}>
                      ปี {fy.year}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Manage Fiscal Years Button */}
            <button
              onClick={onOpenYearModal}
              title="จัดการปีงบประมาณและงบจัดสรร"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline">จัดการปีงบฯ</span>
            </button>

            {/* Add Expense Button */}
            {user && (
              <button
                onClick={onOpenAddExpense}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>บันทึกรายจ่าย</span>
              </button>
            )}

            {/* Auth section */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-400 transition-all">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full object-cover border border-slate-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 hidden group-hover:block transition-all z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">เข้าสู่ระบบด้วย Google</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.displayName || 'เจ้าหน้าที่หอพัก'}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      {user.email === 'dormstaff2009@gmail.com' && (
                        <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" /> ผู้ดูแลระบบ
                        </span>
                      )}
                    </div>
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span className="hidden sm:inline">เข้าสู่ระบบ Google</span>
                <span className="sm:hidden">เข้าสู่ระบบ</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
