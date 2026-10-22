import React, { useState, useEffect, useMemo } from 'react';
import { FiscalYear, Expense, ExpenseType } from '../types/budget';
import { 
  EXPENSE_TYPES, 
  CATEGORY_LIST, 
  formatBaht, 
  formatBahtNumber, 
  getTypeBadge, 
  getCategoryColor 
} from '../constants/categories';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Calendar, 
  Coins, 
  Sparkles, 
  AlertCircle,
  Calculator,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface FiscalYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  fiscalYears: FiscalYear[];
  selectedYear: string;
  onSelectYear: (year: string) => void;
  onAddYear: (
    year: string, 
    allocatedBudget: number, 
    description: string,
    categoryBudgets: Record<string, number>
  ) => Promise<void>;
  onUpdateYear: (
    id: string, 
    allocatedBudget: number, 
    description: string,
    categoryBudgets: Record<string, number>
  ) => Promise<void>;
  onDeleteYear: (id: string, year: string) => Promise<void>;
  onSeedDemo: (year: string, budget: number) => Promise<void>;
  expenses: Expense[];
}

export const FiscalYearModal: React.FC<FiscalYearModalProps> = ({
  isOpen,
  onClose,
  fiscalYears,
  selectedYear,
  onSelectYear,
  onAddYear,
  onUpdateYear,
  onDeleteYear,
  onSeedDemo,
  expenses,
}) => {
  // New Year Form State
  const [newYear, setNewYear] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategoryBudgets, setNewCategoryBudgets] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit existing year state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBudget, setEditBudget] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editCategoryBudgets, setEditCategoryBudgets] = useState<Record<string, string>>({});

  // UI state for category section
  const [showNewCatSection, setShowNewCatSection] = useState(false);
  const [catSearchTerm, setCatSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Compute spent amount by category from current expenses
  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((item) => {
      const cat = item.category || 'อื่นๆ';
      map.set(cat, (map.get(cat) || 0) + (Number(item.amount) || 0));
    });
    return map;
  }, [expenses]);

  if (!isOpen) return null;

  // Start editing a fiscal year
  const handleStartEdit = (fy: FiscalYear) => {
    setEditingId(fy.id);
    setEditBudget(String(fy.allocatedBudget));
    setEditDescription(fy.description || '');

    // Convert category budgets map to strings
    const catMap: Record<string, string> = {};
    CATEGORY_LIST.forEach((c) => {
      const val = fy.categoryBudgets?.[c.name];
      if (val !== undefined && val > 0) {
        catMap[c.name] = String(val);
      }
    });
    setEditCategoryBudgets(catMap);
  };

  // Auto-sum category allocations to total budget for new year
  const handleAutoSumNew = () => {
    let sum = 0;
    Object.values(newCategoryBudgets).forEach((val) => {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) sum += num;
    });
    setNewBudget(sum > 0 ? sum.toFixed(2) : '');
  };

  // Auto-sum category allocations to total budget for edit year
  const handleAutoSumEdit = () => {
    let sum = 0;
    Object.values(editCategoryBudgets).forEach((val) => {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) sum += num;
    });
    setEditBudget(sum > 0 ? sum.toFixed(2) : '');
  };

  const handleSaveEdit = async (id: string) => {
    const val = parseFloat(editBudget);
    if (isNaN(val) || val < 0) {
      alert('กรุณากรอกจำนวนเงินงบประมาณรวมให้ถูกต้อง');
      return;
    }

    // Convert string category budgets to numbers
    const cleanCategoryBudgets: Record<string, number> = {};
    Object.entries(editCategoryBudgets).forEach(([cat, strVal]) => {
      const num = parseFloat(strVal);
      if (!isNaN(num) && num > 0) {
        cleanCategoryBudgets[cat] = num;
      }
    });

    setIsSubmitting(true);
    try {
      await onUpdateYear(id, val, editDescription, cleanCategoryBudgets);
      setEditingId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'ไม่สามารถแก้ไขข้อมูลได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const yearTrimmed = newYear.trim();
    if (!yearTrimmed) {
      setError('กรุณาระบุปีงบประมาณ (เช่น 2568, 2570)');
      return;
    }

    if (fiscalYears.some((f) => f.year === yearTrimmed)) {
      setError(`ปีงบประมาณ ${yearTrimmed} มีอยู่ในระบบแล้ว`);
      return;
    }

    let budgetVal = parseFloat(newBudget);
    // If budgetVal not provided but category budgets provided, calculate sum
    if (isNaN(budgetVal) || budgetVal <= 0) {
      let sum = 0;
      Object.values(newCategoryBudgets).forEach((v) => {
        const n = parseFloat(v);
        if (!isNaN(n) && n > 0) sum += n;
      });
      if (sum > 0) {
        budgetVal = sum;
      } else {
        setError('กรุณาระบุจำนวนเงินงบประมาณที่ได้รับประจำปี (ตัวเลขตั้งแต่ 0 ขึ้นไป)');
        return;
      }
    }

    // Clean category budgets
    const cleanCategoryBudgets: Record<string, number> = {};
    Object.entries(newCategoryBudgets).forEach(([cat, strVal]) => {
      const num = parseFloat(strVal);
      if (!isNaN(num) && num > 0) {
        cleanCategoryBudgets[cat] = num;
      }
    });

    setIsSubmitting(true);
    try {
      await onAddYear(yearTrimmed, budgetVal, newDescription.trim(), cleanCategoryBudgets);
      setNewYear('');
      setNewBudget('');
      setNewDescription('');
      setNewCategoryBudgets({});
      setShowNewCatSection(false);
      onSelectYear(yearTrimmed);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเพิ่มปีงบประมาณ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, year: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "ปีงบประมาณ ${year}"? ข้อมูลรายจ่ายของปีนี้จะยังคงอยู่ในระบบแต่จะมองไม่เห็นจนกว่าจะเพิ่มปีงบประมาณเดิมเข้ามาใหม่`)) {
      try {
        await onDeleteYear(id, year);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'ไม่สามารถลบปีงบประมาณได้');
      }
    }
  };

  // Filtered category list for the allocation table
  const displayedCategories = CATEGORY_LIST.filter((cat) => {
    if (filterType !== 'all' && cat.defaultType !== filterType) {
      return false;
    }
    if (catSearchTerm.trim()) {
      const term = catSearchTerm.toLowerCase();
      return cat.name.toLowerCase().includes(term) || cat.defaultType.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              จัดการข้อมูลปีงบประมาณ & งบที่ได้รับประจำปี
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              กำหนดและปรับปรุงวงเงินงบประมาณที่ได้รับจัดสรร (บาท) ทั้งภาพรวมและแยกรายหมวดหมู่ (รายจ่าย)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Section 1: Add New Fiscal Year Form */}
          <div className="bg-blue-50/40 rounded-2xl p-5 border border-blue-100 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                เพิ่มปีงบประมาณใหม่ และบันทึกงบประมาณที่ได้รับ
              </h4>
              <button
                type="button"
                onClick={() => setShowNewCatSection(!showNewCatSection)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>{showNewCatSection ? 'ซ่อนจัดสรรรายหมวดหมู่' : 'กำหนดงบจัดสรรรายหมวดหมู่'}</span>
                {showNewCatSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ปีงบประมาณ (พ.ศ.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="เช่น 2568, 2569, 2570"
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      จำนวนเงินงบประมาณที่ได้รับรวม (บาท) <span className="text-red-500">*</span>
                    </label>
                    {Object.keys(newCategoryBudgets).length > 0 && (
                      <button
                        type="button"
                        onClick={handleAutoSumNew}
                        className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <Calculator className="w-3 h-3" /> รวมจากหมวดหมู่
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="เช่น 1500000.00"
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  {newBudget && !isNaN(parseFloat(newBudget)) && (
                    <p className="text-[11px] text-blue-700 font-semibold mt-1">
                      {formatBaht(parseFloat(newBudget))}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำอธิบายหรือหมายเหตุ
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="เช่น งบประมาณเงินรายได้ หอพักบุคลากร ประจำปี 2568"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Collapsible Category Budget Allocation Section */}
              {showNewCatSection && (
                <div className="bg-white rounded-xl p-4 border border-blue-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        กำหนดวงเงินจัดสรรรายหมวดหมู่ (รายจ่าย)
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        ระบุจำนวนเงินงบประมาณที่ได้รับจัดสรรสำหรับแต่ละหมวดหมู่ (หากเว้นว่างไว้จะถือว่าไม่ได้กำหนดวงเงินเฉพาะ)
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoSumNew}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold rounded-lg self-start sm:self-auto transition-colors"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      คำนวณรวมเข้ายอดงบประมาณ
                    </button>
                  </div>

                  {/* Filter and Search */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={catSearchTerm}
                        onChange={(e) => setCatSearchTerm(e.target.value)}
                        placeholder="ค้นหาหมวดหมู่รายจ่าย..."
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                      />
                    </div>
                    <div>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                      >
                        <option value="all">แสดงทุกประเภทรายการ (23 หมวดหมู่)</option>
                        {EXPENSE_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Allocation Table */}
                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-bold">
                        <tr>
                          <th className="py-2 px-3">หมวดหมู่ (รายจ่าย)</th>
                          <th className="py-2 px-3">ประเภท</th>
                          <th className="py-2 px-3 text-right w-44">งบที่ได้รับจัดสรร (บาท)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {displayedCategories.map((c) => {
                          const val = newCategoryBudgets[c.name] || '';
                          const catColor = getCategoryColor(c.name);

                          return (
                            <tr key={c.name} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-medium text-slate-800">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                                  <span>{c.name}</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-slate-500 text-[11px]">
                                {c.defaultType}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={val}
                                  onChange={(e) =>
                                    setNewCategoryBudgets({
                                      ...newCategoryBudgets,
                                      [c.name]: e.target.value,
                                    })
                                  }
                                  placeholder="0.00"
                                  className="w-36 px-2 py-1 text-right text-xs font-semibold bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกปีงบประมาณ'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: List of Existing Fiscal Years */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              รายการปีงบประมาณทั้งหมด ({fiscalYears.length})
            </h4>

            {fiscalYears.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">ยังไม่มีข้อมูลปีงบประมาณ กรุณาเพิ่มปีงบประมาณด้านบน</p>
                <button
                  type="button"
                  onClick={() => onSeedDemo('2568', 1500000)}
                  className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  สร้างข้อมูลตัวอย่างปีงบประมาณ 2568
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {fiscalYears.map((fy) => {
                  const isCurrent = fy.year === selectedYear;
                  const isEditing = editingId === fy.id;

                  // Count how many categories have allocated budget
                  const catBudgetsCount = Object.keys(fy.categoryBudgets || {}).length;

                  return (
                    <div
                      key={fy.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-blue-50/30 border-blue-200 shadow-2xs ring-1 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isEditing ? (
                        /* Editing Form for this Year */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              <Edit3 className="w-4 h-4 text-blue-600" />
                              แก้ไขงบประมาณประจำปี {fy.year}
                            </span>
                            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              กำลังแก้ไขข้อมูล
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-semibold text-slate-700">
                                  งบประมาณที่ได้รับรวม (บาท) <span className="text-red-500">*</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={handleAutoSumEdit}
                                  className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                                >
                                  <Calculator className="w-3 h-3" /> รวมจากหมวดหมู่
                                </button>
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                value={editBudget}
                                onChange={(e) => setEditBudget(e.target.value)}
                                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                              />
                              {editBudget && !isNaN(parseFloat(editBudget)) && (
                                <p className="text-[11px] text-blue-700 font-semibold mt-1">
                                  {formatBaht(parseFloat(editBudget))}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-slate-700 block mb-1">
                                คำอธิบาย / หมายเหตุ
                              </label>
                              <input
                                type="text"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="รายละเอียดงบประมาณ"
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                              />
                            </div>
                          </div>

                          {/* Category Allocation Table in Edit Mode */}
                          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                              <div>
                                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                                  หมวดหมู่ (รายจ่าย) ที่ได้รับจัดสรร และคำนวณคงเหลือ / % เบิกจ่าย
                                </h5>
                                <p className="text-[11px] text-slate-500">
                                  ปรับปรุงวงเงินจัดสรรรายหมวดหมู่ ระบบคำนวณยอดใช้จ่ายจริง คงเหลือสุทธิ และ % เบิกจ่ายให้อัตโนมัติ
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={handleAutoSumEdit}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto"
                              >
                                <Calculator className="w-3.5 h-3.5" />
                                คำนวณรวมเข้ายอดงบประมาณ
                              </button>
                            </div>

                            {/* Table */}
                            <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-lg">
                              <table className="w-full text-xs text-left border-collapse">
                                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-bold">
                                  <tr>
                                    <th className="py-2.5 px-3">หมวดหมู่ (รายจ่าย)</th>
                                    <th className="py-2.5 px-3 text-right w-36">งบจัดสรร (บาท)</th>
                                    <th className="py-2.5 px-3 text-right w-32">ใช้จ่ายไปแล้ว</th>
                                    <th className="py-2.5 px-3 text-right w-36">คงเหลือสุทธิ</th>
                                    <th className="py-2.5 px-3 text-right w-24">% เบิกจ่าย</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {CATEGORY_LIST.map((c) => {
                                    const valStr = editCategoryBudgets[c.name] || '';
                                    const allocated = parseFloat(valStr) || 0;
                                    const spent = spentByCategory.get(c.name) || 0;
                                    const remaining = allocated - spent;
                                    const rate = allocated > 0 ? (spent / allocated) * 100 : 0;
                                    const catColor = getCategoryColor(c.name);

                                    return (
                                      <tr key={c.name} className="hover:bg-slate-50/80">
                                        <td className="py-2 px-3 font-semibold text-slate-800">
                                          <div className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                                            <span>{c.name}</span>
                                          </div>
                                          <span className="text-[10px] text-slate-400 font-normal">
                                            {c.defaultType}
                                          </span>
                                        </td>

                                        {/* Input: Allocated */}
                                        <td className="py-2 px-3 text-right">
                                          <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={valStr}
                                            onChange={(e) =>
                                              setEditCategoryBudgets({
                                                ...editCategoryBudgets,
                                                [c.name]: e.target.value,
                                              })
                                            }
                                            placeholder="0.00"
                                            className="w-32 px-2 py-1 text-right text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                                          />
                                        </td>

                                        {/* Display: Spent */}
                                        <td className="py-2 px-3 text-right font-mono font-medium text-amber-700">
                                          {formatBaht(spent)}
                                        </td>

                                        {/* Display: Remaining */}
                                        <td className={`py-2 px-3 text-right font-mono font-bold ${
                                          allocated > 0
                                            ? remaining < 0
                                              ? 'text-red-600'
                                              : 'text-emerald-700'
                                            : 'text-slate-400'
                                        }`}>
                                          {allocated > 0 ? formatBaht(remaining) : '-'}
                                        </td>

                                        {/* Display: % */}
                                        <td className="py-2 px-3 text-right">
                                          {allocated > 0 ? (
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                              remaining < 0
                                                ? 'bg-red-100 text-red-700'
                                                : rate >= 80
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                              {rate.toFixed(1)}%
                                            </span>
                                          ) : (
                                            <span className="text-slate-400 text-[10px]">-</span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Save / Cancel buttons */}
                          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
                            >
                              ยกเลิก
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(fy.id)}
                              disabled={isSubmitting}
                              className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-2xs cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              บันทึกการปรับปรุงงบประมาณ
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal View for this Year */
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-base sm:text-lg text-slate-900">
                                  ปีงบประมาณ {fy.year}
                                </span>
                                {isCurrent && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-2xs">
                                    ใช้งานอยู่
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs sm:text-sm font-bold text-emerald-700">
                                  งบที่ได้รับรวม: {formatBaht(fy.allocatedBudget)}
                                </span>
                                {catBudgetsCount > 0 && (
                                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                    จัดสรรแล้ว {catBudgetsCount} หมวดหมู่
                                  </span>
                                )}
                              </div>
                              {fy.description && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                  {fy.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              {!isCurrent && (
                                <button
                                  type="button"
                                  onClick={() => onSelectYear(fy.year)}
                                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl transition-colors cursor-pointer"
                                >
                                  เลือกใช้นี้
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleStartEdit(fy)}
                                title="กำหนดและปรับปรุงงบประมาณรายหมวดหมู่"
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-300 hover:border-blue-300 rounded-xl transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>ปรับปรุงงบจัดสรร</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(fy.id, fy.year)}
                                title="ลบปีงบประมาณ"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Quick Summary of Category Allocations for this year */}
                          {catBudgetsCount > 0 && (
                            <div className="pt-2 border-t border-slate-100">
                              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                                ตัวอย่างหมวดหมู่ที่ได้รับจัดสรร:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(fy.categoryBudgets || {}).slice(0, 6).map(([cat, amt]) => (
                                  <span
                                    key={cat}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                                  >
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(cat) }} />
                                    <span>{cat}:</span>
                                    <strong className="text-slate-900 font-mono">{formatBaht(amt)}</strong>
                                  </span>
                                ))}
                                {catBudgetsCount > 6 && (
                                  <span className="text-[11px] font-medium text-slate-400 px-1 self-center">
                                    และอีก {catBudgetsCount - 6} หมวดหมู่...
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            * ระบบจะคำนวณยอดคงเหลือสุทธิและร้อยละการเบิกจ่ายให้อัตโนมัติในทุกหมวดหมู่
          </p>
          <button
            onClick={onClose}
            className="px-4.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
