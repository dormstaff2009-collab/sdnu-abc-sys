import React from 'react';
import { Expense, FiscalYear, BudgetStats } from '../types/budget';
import { EXPENSE_TYPES, CATEGORY_LIST, formatBaht, formatThaiDate } from '../constants/categories';
import { X, Printer, Building2, CheckCircle2 } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  fiscalYear: FiscalYear | undefined;
  expenses: Expense[];
  stats: BudgetStats;
  currentYear: string;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  fiscalYear,
  expenses,
  stats,
  currentYear,
}) => {
  if (!isOpen) return null;

  // Breakdown by 3 main types
  const typeSummary = EXPENSE_TYPES.map((t) => {
    const items = expenses.filter((e) => e.type === t.id);
    const amount = items.reduce((sum, i) => sum + i.amount, 0);
    const percentage = stats.totalSpent > 0 ? (amount / stats.totalSpent) * 100 : 0;
    return {
      type: t.id,
      label: t.label,
      count: items.length,
      amount,
      percentage,
    };
  });

  // Category allocation & spent summary
  const spentMap = new Map<string, number>();
  expenses.forEach((item) => {
    const cat = item.category || 'อื่นๆ';
    spentMap.set(cat, (spentMap.get(cat) || 0) + (Number(item.amount) || 0));
  });

  const categoryAllocations = CATEGORY_LIST.map((c) => {
    const allocated = Number(fiscalYear?.categoryBudgets?.[c.name]) || 0;
    const spent = spentMap.get(c.name) || 0;
    const remaining = allocated - spent;
    const rate = allocated > 0 ? (spent / allocated) * 100 : 0;
    return {
      category: c.name,
      type: c.defaultType,
      allocated,
      spent,
      remaining,
      rate,
      hasAllocation: allocated > 0,
    };
  }).filter((c) => c.hasAllocation || c.spent > 0);

  const handlePrint = () => {
    window.print();
  };

  const todayThai = formatThaiDate(new Date().toISOString().split('T')[0]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls (Hidden in print) */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800">ตัวอย่างรายงานเพื่อการพิมพ์ / บันทึก PDF</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              พิมพ์รายงานนี้
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 text-slate-800 space-y-6 print:p-0 print:text-black">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="w-6 h-6 text-slate-800" />
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                รายงานสรุปการใช้จ่ายเงินงบประมาณประจำปี
              </h1>
            </div>
            <h2 className="text-lg font-bold text-slate-700">
              หอพักบุคลากร ประจำปีงบประมาณ พ.ศ. {currentYear}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              วันที่พิมพ์รายงาน: {todayThai} | ฐานข้อมูลระบบ: Firebase (sdnu-abc-sys)
            </p>
          </div>

          {/* Budget Overview Summary Box */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-transparent print:border-slate-400">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">งบประมาณที่ได้รับ</span>
              <span className="text-base font-extrabold text-slate-900">{formatBaht(stats.allocatedBudget)}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">งบประมาณที่ใช้จ่ายไปแล้ว</span>
              <span className="text-base font-extrabold text-amber-700">{formatBaht(stats.totalSpent)}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">งบประมาณคงเหลือ</span>
              <span className="text-base font-extrabold text-emerald-700">{formatBaht(stats.remainingBudget)}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">ร้อยละการเบิกจ่าย</span>
              <span className="text-base font-extrabold text-blue-700">{stats.disbursementRate.toFixed(2)}%</span>
            </div>
          </div>

          {/* Type Summary Table */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              1. สรุปผลการใช้จ่ายจำแนกตามประเภทรายการงบประมาณ (3 ประเภท)
            </h4>
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                  <th className="py-2 px-3 text-left">ประเภทรายการ</th>
                  <th className="py-2 px-3 text-center w-24">จำนวนรายการ</th>
                  <th className="py-2 px-3 text-right w-40">จำนวนเงิน (บาท)</th>
                  <th className="py-2 px-3 text-right w-24">สัดส่วน (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {typeSummary.map((item) => (
                  <tr key={item.type}>
                    <td className="py-2 px-3 font-semibold">{item.label}</td>
                    <td className="py-2 px-3 text-center">{item.count}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">{formatBaht(item.amount)}</td>
                    <td className="py-2 px-3 text-right">{item.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t border-slate-300">
                  <td className="py-2 px-3 text-right">รวมทั้งสิ้น:</td>
                  <td className="py-2 px-3 text-center">{stats.transactionCount}</td>
                  <td className="py-2 px-3 text-right font-mono text-sm">{formatBaht(stats.totalSpent)}</td>
                  <td className="py-2 px-3 text-right">100.0%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Category Budget Allocation Table */}
          {categoryAllocations.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">
                2. สรุปสถานะงบประมาณจำแนกตามหมวดหมู่ (รายจ่าย) ที่ได้รับจัดสรร
              </h4>
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                    <th className="py-2 px-3 text-left">หมวดหมู่ (รายจ่าย)</th>
                    <th className="py-2 px-3 text-right w-36">งบที่ได้รับจัดสรร (บาท)</th>
                    <th className="py-2 px-3 text-right w-32">ใช้จ่ายไปแล้ว</th>
                    <th className="py-2 px-3 text-right w-36">ยอดคงเหลือสุทธิ</th>
                    <th className="py-2 px-3 text-right w-24">% เบิกจ่าย</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {categoryAllocations.map((item) => (
                    <tr key={item.category}>
                      <td className="py-1.5 px-3 font-medium">
                        {item.category}
                        <span className="text-[10px] text-slate-400 block">{item.type}</span>
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold">
                        {item.hasAllocation ? formatBaht(item.allocated) : '-'}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono text-amber-700">
                        {formatBaht(item.spent)}
                      </td>
                      <td className={`py-1.5 px-3 text-right font-mono font-bold ${
                        item.hasAllocation ? (item.remaining < 0 ? 'text-red-600' : 'text-emerald-700') : 'text-slate-400'
                      }`}>
                        {item.hasAllocation ? formatBaht(item.remaining) : '-'}
                      </td>
                      <td className="py-1.5 px-3 text-right">
                        {item.hasAllocation ? `${item.rate.toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detailed Item List */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              3. บัญชีรายละเอียดรายการใช้จ่ายเงินงบประมาณ ({expenses.length} รายการ)
            </h4>
            <table className="w-full text-[11px] border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                  <th className="py-2 px-2 text-center w-8">ที่</th>
                  <th className="py-2 px-2 text-left w-20">วันที่</th>
                  <th className="py-2 px-2 text-left w-28">ประเภท</th>
                  <th className="py-2 px-2 text-left w-36">หมวดหมู่</th>
                  <th className="py-2 px-2 text-left">รายละเอียดรายจ่าย</th>
                  <th className="py-2 px-2 text-right w-24">จำนวนเงิน (บาท)</th>
                  <th className="py-2 px-2 text-left w-24">บันทึกช่วยจำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-slate-400">
                      ไม่มีรายการรายจ่าย
                    </td>
                  </tr>
                ) : (
                  expenses.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="py-1.5 px-2 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-1.5 px-2 whitespace-nowrap">{formatThaiDate(item.date)}</td>
                      <td className="py-1.5 px-2">{item.type}</td>
                      <td className="py-1.5 px-2 font-medium">{item.category}</td>
                      <td className="py-1.5 px-2">{item.description}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold">{formatBaht(item.amount)}</td>
                      <td className="py-1.5 px-2 text-slate-500">{item.note || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Signatures Section for Official Report */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-12">
              <p>ลงชื่อ..............................................................ผู้รายงาน</p>
              <div>
                <p>(..............................................................)</p>
                <p className="text-slate-500 mt-1">เจ้าหน้าที่ผู้รับผิดชอบงานงบประมาณหอพัก</p>
              </div>
            </div>
            <div className="space-y-12">
              <p>ลงชื่อ..............................................................ผู้ตรวจทาน/อนุมัติ</p>
              <div>
                <p>(..............................................................)</p>
                <p className="text-slate-500 mt-1">ผู้จัดการ/หัวหน้างานหอพักบุคลากร</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
