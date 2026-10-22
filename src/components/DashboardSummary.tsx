import React from 'react';
import { BudgetStats } from '../types/budget';
import { formatBaht } from '../constants/categories';
import { 
  Wallet, 
  TrendingDown, 
  PieChart as PieIcon, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Receipt,
  Edit2
} from 'lucide-react';

interface DashboardSummaryProps {
  stats: BudgetStats;
  currentYear: string;
  onEditBudget: () => void;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  stats,
  currentYear,
  onEditBudget,
}) => {
  const { allocatedBudget, totalSpent, remainingBudget, disbursementRate, transactionCount } = stats;

  const isOverBudget = remainingBudget < 0;
  const isWarning = disbursementRate >= 80 && !isOverBudget;
  const isNormal = disbursementRate < 80;

  return (
    <div className="space-y-4">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: งบประมาณที่ได้รับประจำปี */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              งบประมาณที่ได้รับจัดสรร
            </span>
            <button
              onClick={onEditBudget}
              title="แก้ไขจำนวนเงินงบประมาณที่ได้รับ"
              className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatBaht(allocatedBudget)}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>ปีงบประมาณ {currentYear || '-'}</span>
            <span className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={onEditBudget}>
              ปรับปรุงงบ
            </span>
          </div>
        </div>

        {/* Card 2: งบประมาณใช้จ่ายไปแล้ว */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              งบประมาณใช้จ่ายไปแล้ว
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            {formatBaht(totalSpent)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>บันทึกแล้ว {transactionCount} รายการ</span>
            <span className="font-semibold text-amber-600">{disbursementRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Card 3: งบประมาณคงเหลือสุทธิ */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-24 h-24 ${isOverBudget ? 'bg-red-500/10' : 'bg-emerald-500/5'} rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform`} />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              งบประมาณคงเหลือสุทธิ
            </span>
            <div className={`w-8 h-8 rounded-lg ${isOverBudget ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'} flex items-center justify-center`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isOverBudget ? 'text-red-600' : 'text-emerald-700'}`}>
            {formatBaht(remainingBudget)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              {isOverBudget ? 'เกินวงเงินงบประมาณ' : 'สถานะงบคงเหลือ'}
            </span>
            <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
              {allocatedBudget > 0 ? `${((remainingBudget / allocatedBudget) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Card 4: ร้อยละการเบิกจ่าย & สถานะ */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              ร้อยละการเบิกจ่าย
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {disbursementRate.toFixed(1)}%
            </span>
            {isOverBudget && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                <AlertCircle className="w-3 h-3" /> เกินงบ
              </span>
            )}
            {isWarning && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                <AlertTriangle className="w-3 h-3" /> ใกล้เต็ม
              </span>
            )}
            {isNormal && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3" /> ปกติ
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3 pt-2 border-t border-slate-100">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget
                    ? 'bg-red-500'
                    : isWarning
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                }`}
                style={{ width: `${Math.min(disbursementRate, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
