import React, { useState, useMemo } from 'react';
import { FiscalYear, Expense, CategoryBudgetStatus, ExpenseType } from '../types/budget';
import { 
  EXPENSE_TYPES, 
  CATEGORY_LIST, 
  formatBaht, 
  getCategoryColor,
  getTypeBadge 
} from '../constants/categories';
import { 
  Layers, 
  Search, 
  Edit3, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Filter,
  Check
} from 'lucide-react';

interface CategoryBudgetSummaryProps {
  fiscalYear: FiscalYear | undefined;
  expenses: Expense[];
  onOpenEditBudget: () => void;
  selectedCategoryFilter: string | null;
  onSelectCategoryFilter: (category: string | null) => void;
}

export const CategoryBudgetSummary: React.FC<CategoryBudgetSummaryProps> = ({
  fiscalYear,
  expenses,
  onOpenEditBudget,
  selectedCategoryFilter,
  onSelectCategoryFilter,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [onlyActive, setOnlyActive] = useState<boolean>(false);

  // Compute category statuses
  const categoryStatuses: CategoryBudgetStatus[] = useMemo(() => {
    // 1. Map expenses spent and count
    const spentMap = new Map<string, { amount: number; count: number }>();
    expenses.forEach((item) => {
      const cat = item.category || 'อื่นๆ';
      const curr = spentMap.get(cat) || { amount: 0, count: 0 };
      curr.amount += Number(item.amount) || 0;
      curr.count += 1;
      spentMap.set(cat, curr);
    });

    const catBudgets = fiscalYear?.categoryBudgets || {};

    // 2. Build for each category in master list
    const result: CategoryBudgetStatus[] = CATEGORY_LIST.map((c) => {
      const allocated = Number(catBudgets[c.name]) || 0;
      const spentData = spentMap.get(c.name) || { amount: 0, count: 0 };
      const spent = spentData.amount;
      const remaining = allocated - spent;
      const disbursementRate = allocated > 0 ? (spent / allocated) * 100 : 0;
      const hasAllocation = allocated > 0;

      return {
        category: c.name,
        type: c.defaultType,
        allocated,
        spent,
        remaining,
        disbursementRate,
        hasAllocation,
        count: spentData.count,
        color: getCategoryColor(c.name),
      };
    });

    return result;
  }, [fiscalYear, expenses]);

  // Filtered statuses
  const filteredList = useMemo(() => {
    return categoryStatuses.filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (onlyActive && item.allocated === 0 && item.spent === 0) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          item.category.toLowerCase().includes(term) ||
          item.type.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [categoryStatuses, filterType, onlyActive, searchTerm]);

  // Totals for filtered list
  const totals = useMemo(() => {
    let allocated = 0;
    let spent = 0;
    filteredList.forEach((i) => {
      allocated += i.allocated;
      spent += i.spent;
    });
    const remaining = allocated - spent;
    const rate = allocated > 0 ? (spent / allocated) * 100 : 0;
    return { allocated, spent, remaining, rate };
  }, [filteredList]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              สถานะงบประมาณที่ได้รับจัดสรร แยกตามหมวดหมู่ (รายจ่าย)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ติดตามวงเงินจัดสรร ยอดใช้จ่ายจริง ยอดคงเหลือสุทธิ และร้อยละการเบิกจ่ายอัตโนมัติ
          </p>
        </div>

        <button
          onClick={onOpenEditBudget}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors self-start md:self-auto cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>ปรับปรุงวงเงินจัดสรรรายหมวดหมู่</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-2">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาหมวดหมู่รายจ่าย..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Type filter */}
        <div className="sm:col-span-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">ทุกประเภทรายการ (ทั้งหมด)</option>
            {EXPENSE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Checkbox: Show only active */}
        <div className="sm:col-span-3 flex items-center justify-start sm:justify-end">
          <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>แสดงเฉพาะที่มีข้อมูล</span>
          </label>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 sm:px-4">หมวดหมู่ (รายจ่าย)</th>
              <th className="py-3 px-3 sm:px-4">ประเภทรายการ</th>
              <th className="py-3 px-3 sm:px-4 text-right">งบที่ได้รับจัดสรร (บาท)</th>
              <th className="py-3 px-3 sm:px-4 text-right">ใช้จ่ายไปแล้ว</th>
              <th className="py-3 px-3 sm:px-4 text-right">ยอดคงเหลือสุทธิ</th>
              <th className="py-3 px-3 sm:px-4 text-right w-36">ร้อยละการเบิกจ่าย</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  ไม่พบหมวดหมู่ที่ตรงตามเงื่อนไขค้นหา
                </td>
              </tr>
            ) : (
              filteredList.map((item) => {
                const isSelected = selectedCategoryFilter === item.category;
                const isOver = item.hasAllocation && item.remaining < 0;
                const isWarning = item.hasAllocation && item.disbursementRate >= 80 && !isOver;

                return (
                  <tr
                    key={item.category}
                    onClick={() => onSelectCategoryFilter(isSelected ? null : item.category)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Category name & Dot */}
                    <td className="py-2.5 px-3 sm:px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                          {item.category}
                        </span>
                        {item.count > 0 && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({item.count} รายการ)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type badge */}
                    <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {item.type}
                      </span>
                    </td>

                    {/* Allocated */}
                    <td className="py-2.5 px-3 sm:px-4 text-right font-mono font-bold text-slate-900">
                      {item.hasAllocation ? (
                        formatBaht(item.allocated)
                      ) : (
                        <span className="text-slate-400 font-normal text-xs">-</span>
                      )}
                    </td>

                    {/* Spent */}
                    <td className="py-2.5 px-3 sm:px-4 text-right font-mono font-bold text-amber-700">
                      {item.spent > 0 ? (
                        formatBaht(item.spent)
                      ) : (
                        <span className="text-slate-300 font-normal text-xs">-</span>
                      )}
                    </td>

                    {/* Remaining */}
                    <td className={`py-2.5 px-3 sm:px-4 text-right font-mono font-extrabold ${
                      item.hasAllocation
                        ? isOver
                          ? 'text-red-600'
                          : 'text-emerald-700'
                        : 'text-slate-400 font-normal'
                    }`}>
                      {item.hasAllocation ? (
                        formatBaht(item.remaining)
                      ) : (
                        <span className="text-slate-400 font-normal text-xs">-</span>
                      )}
                    </td>

                    {/* Disbursement % & Progress Bar */}
                    <td className="py-2.5 px-3 sm:px-4 text-right">
                      {item.hasAllocation ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className={`text-xs font-bold font-mono ${
                              isOver ? 'text-red-600' : isWarning ? 'text-amber-700' : 'text-slate-800'
                            }`}>
                              {item.disbursementRate.toFixed(1)}%
                            </span>
                            {isOver && (
                              <span className="text-[9px] font-bold text-red-700 bg-red-100 px-1 py-0.2 rounded">
                                เกินงบ
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isOver
                                  ? 'bg-red-500'
                                  : isWarning
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(item.disbursementRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {filteredList.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50/90 font-bold border-t-2 border-slate-300 text-slate-900 text-xs">
                <td colSpan={2} className="py-3 px-3 sm:px-4 text-right uppercase tracking-wider">
                  รวมยอดหมวดหมู่ที่แสดง ({filteredList.length} รายการ):
                </td>
                <td className="py-3 px-3 sm:px-4 text-right font-mono text-sm font-extrabold text-slate-900">
                  {formatBaht(totals.allocated)}
                </td>
                <td className="py-3 px-3 sm:px-4 text-right font-mono text-sm font-extrabold text-amber-700">
                  {formatBaht(totals.spent)}
                </td>
                <td className={`py-3 px-3 sm:px-4 text-right font-mono text-sm font-extrabold ${
                  totals.remaining < 0 ? 'text-red-600' : 'text-emerald-700'
                }`}>
                  {formatBaht(totals.remaining)}
                </td>
                <td className="py-3 px-3 sm:px-4 text-right font-mono text-xs font-bold text-blue-700">
                  {totals.allocated > 0 ? `${totals.rate.toFixed(1)}%` : '-'}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
