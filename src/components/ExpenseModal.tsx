import React, { useState, useEffect } from 'react';
import { Expense, ExpenseType } from '../types/budget';
import { EXPENSE_TYPES, CATEGORY_LIST, formatBaht } from '../constants/categories';
import { X, Save, AlertCircle, Calendar, Tag, FileText, DollarSign, Notebook } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Expense, 'id' | 'userId'>) => Promise<void>;
  initialData?: Expense | null;
  availableYears: string[];
  currentYear: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  availableYears,
  currentYear,
}) => {
  const [fiscalYear, setFiscalYear] = useState<string>(currentYear);
  const [type, setType] = useState<ExpenseType>('ค่าจ้างชั่วคราว');
  const [category, setCategory] = useState<string>('ค่าจ้างชั่วคราวรายวัน');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (initialData) {
      setFiscalYear(initialData.fiscalYear);
      setType(initialData.type);
      setCategory(initialData.category);
      setDescription(initialData.description);
      setAmount(String(initialData.amount));
      setDate(initialData.date);
      setNote(initialData.note || '');
    } else {
      setFiscalYear(currentYear || (availableYears[0] || '2568'));
      setType('ค่าจ้างชั่วคราว');
      setCategory('ค่าจ้างชั่วคราวรายวัน');
      setDescription('');
      setAmount('');
      // Default to today YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setNote('');
    }
    setError(null);
  }, [initialData, isOpen, currentYear, availableYears]);

  // When type changes, set recommended category if current category belongs to a different type
  const handleTypeChange = (newType: ExpenseType) => {
    setType(newType);
    const matchingCategories = CATEGORY_LIST.filter(c => c.defaultType === newType);
    if (matchingCategories.length > 0) {
      // Check if current category is already in the matching ones
      const isAlreadyMatching = matchingCategories.some(c => c.name === category);
      if (!isAlreadyMatching) {
        setCategory(matchingCategories[0].name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('กรุณากรอกจำนวนเงินให้ถูกต้อง (มากกว่า 0 บาท)');
      return;
    }

    if (!description.trim()) {
      setError('กรุณาระบุรายละเอียดรายจ่าย');
      return;
    }

    if (!date) {
      setError('กรุณาระบุวันที่ทำรายการ');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        fiscalYear: fiscalYear.trim(),
        type,
        category,
        description: description.trim(),
        amount: parsedAmount,
        date,
        note: note.trim(),
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialData ? 'แก้ไขข้อมูลรายจ่าย' : 'แบบฟอร์มบันทึกข้อมูลรายจ่าย'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบบควบคุมงบประมาณรายจ่ายประจำปี หอพักบุคลากร
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. ปีงปม. (ปีงบประมาณ) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              1. ปีงปม. (ปีงบประมาณ) <span className="text-red-500">*</span>
            </label>
            {availableYears.length > 0 ? (
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    ปีงบประมาณ {y}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                placeholder="เช่น 2568"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
              />
            )}
          </div>

          {/* 2. ประเภทรายการ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              2. ประเภทรายการ <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {EXPENSE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTypeChange(t.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition-all ${
                    type === t.id
                      ? `${t.bgClass} ring-2 ring-blue-500 shadow-2xs`
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. หมวดหมู่ (รายจ่าย) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              3. หมวดหมู่ (รายจ่าย) <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {CATEGORY_LIST.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.defaultType})
                </option>
              ))}
            </select>
          </div>

          {/* 4. รายละเอียด รายจ่าย */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              4. รายละเอียด รายจ่าย <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น ค่าจัดซื้อหลอดไฟ LED สำหรับโถงทางเดินชั้น 2-4"
              required
              maxLength={500}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* 5. จำนวนเงิน (บาท) & 6. วันที่ทำรายการ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 5. จำนวนเงิน */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                5. จำนวนเงิน (บาท) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-medium text-slate-400">
                  บาท
                </span>
              </div>
              {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                <p className="text-[11px] font-semibold text-blue-600 mt-1">
                  ยอดเงิน: {formatBaht(parseFloat(amount))}
                </p>
              )}
            </div>

            {/* 6. วันที่ทำรายการ */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                6. วันที่ทำรายการ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* 7. บันทึกช่วยจำ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Notebook className="w-3.5 h-3.5 text-blue-600" />
              7. บันทึกช่วยจำ (หมายเหตุ / เลขที่ใบเสร็จ / ผู้เบิกจ่าย)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น ใบเสร็จเลขที่ INV-2026/001, ห้างหุ้นส่วนจำกัด สยามการค้า"
              maxLength={500}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : initialData ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
