import React, { useState, useMemo } from 'react';
import { Expense, ExpenseType } from '../types/budget';
import { 
  EXPENSE_TYPES, 
  CATEGORY_LIST, 
  formatBaht, 
  formatThaiDate, 
  getTypeBadge, 
  getCategoryColor 
} from '../constants/categories';
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  FileSpreadsheet, 
  AlertCircle,
  Plus
} from 'lucide-react';

interface ExpenseTableProps {
  expenses: Expense[];
  selectedCategoryFilter: string | null;
  onSelectCategoryFilter: (category: string | null) => void;
  selectedTypeFilter: ExpenseType | null;
  onSelectTypeFilter: (type: ExpenseType | null) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string, description: string) => Promise<void>;
  onOpenAddExpense: () => void;
  onOpenPrintReport: () => void;
  currentYear: string;
}

type SortField = 'date' | 'amount' | 'category' | 'type';
type SortOrder = 'asc' | 'desc';

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  selectedCategoryFilter,
  onSelectCategoryFilter,
  selectedTypeFilter,
  onSelectTypeFilter,
  onEditExpense,
  onDeleteExpense,
  onOpenAddExpense,
  onOpenPrintReport,
  currentYear,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter and sort items
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      // Type filter
      if (selectedTypeFilter && item.type !== selectedTypeFilter) {
        return false;
      }
      // Category filter
      if (selectedCategoryFilter && item.category !== selectedCategoryFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchDesc = item.description.toLowerCase().includes(term);
        const matchNote = (item.note || '').toLowerCase().includes(term);
        const matchCat = item.category.toLowerCase().includes(term);
        const matchType = item.type.toLowerCase().includes(term);
        const matchAmount = String(item.amount).includes(term);
        if (!matchDesc && !matchNote && !matchCat && !matchType && !matchAmount) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.date.localeCompare(b.date);
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortField === 'type') {
        comparison = a.type.localeCompare(b.type);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [expenses, selectedTypeFilter, selectedCategoryFilter, searchTerm, sortField, sortOrder]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDeleteClick = async (expense: Expense) => {
    if (window.confirm(`ยืนยันการลบรายการ: "${expense.description}" จำนวนเงิน ${formatBaht(expense.amount)}?`)) {
      setDeletingId(expense.id);
      try {
        await onDeleteExpense(expense.id, expense.description);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบรายการ');
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      alert('ไม่มีรายการข้อมูลสำหรับส่งออก');
      return;
    }

    const headers = [
      'ลำดับ',
      'ปีงบประมาณ',
      'ประเภทรายการ',
      'หมวดหมู่รายจ่าย',
      'รายละเอียดรายจ่าย',
      'จำนวนเงิน (บาท)',
      'วันที่ทำรายการ',
      'บันทึกช่วยจำ',
    ];

    const rows = filteredExpenses.map((item, index) => [
      index + 1,
      `ปี ${item.fiscalYear}`,
      `"${item.type}"`,
      `"${item.category}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      item.amount.toFixed(2),
      item.date,
      `"${(item.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `รายงานงบประมาณรายจ่าย_หอพักบุคลากร_ปี${currentYear}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              ตารางบันทึกข้อมูลรายจ่ายประจำปี {currentYear}
            </h3>
            <p className="text-xs text-slate-500">
              พบ {filteredExpenses.length} รายการ จากทั้งหมด {expenses.length} รายการ (รวม {formatBaht(totalFilteredAmount)})
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก Excel/CSV</span>
            </button>

            <button
              onClick={onOpenPrintReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์รายงาน</span>
            </button>

            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มรายการ</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2">
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหารายละเอียด, หมวดหมู่, หรือบันทึกช่วยจำ..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Type filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedTypeFilter || ''}
              onChange={(e) => onSelectTypeFilter((e.target.value as ExpenseType) || null)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">ทุกประเภทรายการ (ทั้งหมด)</option>
              {EXPENSE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategoryFilter || ''}
              onChange={(e) => onSelectCategoryFilter(e.target.value || null)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">ทุกหมวดหมู่รายจ่าย (ทั้งหมด)</option>
              {CATEGORY_LIST.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 sm:px-4 w-12 text-center">ลำดับ</th>
              <th 
                className="py-3 px-3 sm:px-4 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  <span>6. วันที่ทำรายการ</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-3 px-3 sm:px-4 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-1">
                  <span>2. ประเภทรายการ</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-3 px-3 sm:px-4 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-1">
                  <span>3. หมวดหมู่ (รายจ่าย)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 sm:px-4">4. รายละเอียด รายจ่าย</th>
              <th 
                className="py-3 px-3 sm:px-4 text-right cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>5. จำนวนเงิน (บาท)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 sm:px-4">7. บันทึกช่วยจำ</th>
              <th className="py-3 px-3 sm:px-4 text-center w-24">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">ไม่พบรายการรายจ่าย</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchTerm || selectedTypeFilter || selectedCategoryFilter
                        ? 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองด้านบน'
                        : 'กดปุ่ม "เพิ่มรายการ" เพื่อเริ่มบันทึกงบประมาณ'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredExpenses.map((item, index) => {
                const typeBadge = getTypeBadge(item.type);
                const catColor = getCategoryColor(item.category);

                return (
                  <tr 
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-3 px-3 sm:px-4 text-center text-slate-400 font-mono text-xs">
                      {index + 1}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap font-medium text-slate-700">
                      {formatThaiDate(item.date)}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${typeBadge.bgClass}`}>
                        {item.type}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: catColor }} 
                        />
                        <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                          {item.category}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-3 sm:px-4 max-w-xs">
                      <p className="text-slate-800 font-medium line-clamp-2">
                        {item.description}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ปีงปม. {item.fiscalYear}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap font-bold text-slate-900 font-mono text-sm sm:text-base">
                      {formatBaht(item.amount)}
                    </td>

                    {/* Note */}
                    <td className="py-3 px-3 sm:px-4 max-w-[160px] text-xs text-slate-500 truncate">
                      {item.note || '-'}
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditExpense(item)}
                          title="แก้ไขรายการ"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          disabled={deletingId === item.id}
                          title="ลบรายการ"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {filteredExpenses.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-900">
                <td colSpan={5} className="py-3.5 px-3 sm:px-4 text-right uppercase text-xs tracking-wider">
                  รวมยอดค่าใช้จ่ายที่แสดงผล ({filteredExpenses.length} รายการ):
                </td>
                <td className="py-3.5 px-3 sm:px-4 text-right text-base text-blue-700 font-mono font-extrabold whitespace-nowrap">
                  {formatBaht(totalFilteredAmount)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
