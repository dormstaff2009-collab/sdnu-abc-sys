import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { FiscalYear, Expense, ExpenseType, BudgetStats } from './types/budget';
import {
  subscribeFiscalYears,
  subscribeExpenses,
  addFiscalYear,
  updateFiscalYear,
  deleteFiscalYear,
  addExpense,
  updateExpense,
  deleteExpense,
  seedDemoDataForYear,
} from './services/budgetService';
import { Navbar } from './components/Navbar';
import { LoginBanner } from './components/LoginBanner';
import { DashboardSummary } from './components/DashboardSummary';
import { CategoryBudgetSummary } from './components/CategoryBudgetSummary';
import { PieChartSection } from './components/PieChartSection';
import { ExpenseTable } from './components/ExpenseTable';
import { ExpenseModal } from './components/ExpenseModal';
import { FiscalYearModal } from './components/FiscalYearModal';
import { PrintReportModal } from './components/PrintReportModal';
import { 
  Building2, 
  Plus, 
  Calendar, 
  Coins, 
  Sparkles, 
  Loader2,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();

  // State
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Filtering state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<ExpenseType | null>(null);

  // Show Toast
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Subscribe to fiscal years when user is authenticated
  useEffect(() => {
    if (!user) {
      setFiscalYears([]);
      setExpenses([]);
      setSelectedYear('');
      return;
    }

    setLoadingData(true);
    const unsubscribe = subscribeFiscalYears(
      user.uid,
      (years) => {
        setFiscalYears(years);
        setLoadingData(false);

        // If no selected year or selected year was deleted, select first available year
        if (years.length > 0) {
          setSelectedYear((prev) => {
            const exists = years.some((y) => y.year === prev);
            return exists ? prev : years[0].year;
          });
        } else {
          setSelectedYear('');
        }
      },
      (err) => {
        setLoadingData(false);
        showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลปีงบประมาณ', 'error');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Subscribe to expenses for the selected fiscal year
  useEffect(() => {
    if (!user || !selectedYear) {
      setExpenses([]);
      return;
    }

    const unsubscribe = subscribeExpenses(
      user.uid,
      selectedYear,
      (expList) => {
        setExpenses(expList);
      },
      (err) => {
        showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลรายจ่าย', 'error');
      }
    );

    return () => unsubscribe();
  }, [user, selectedYear]);

  // Current active fiscal year object
  const currentFiscalYear = useMemo(() => {
    return fiscalYears.find((fy) => fy.year === selectedYear);
  }, [fiscalYears, selectedYear]);

  // Budget calculations
  const stats: BudgetStats = useMemo(() => {
    const allocatedBudget = currentFiscalYear ? currentFiscalYear.allocatedBudget : 0;
    const totalSpent = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const remainingBudget = allocatedBudget - totalSpent;
    const disbursementRate = allocatedBudget > 0 ? (totalSpent / allocatedBudget) * 100 : 0;
    const transactionCount = expenses.length;

    return {
      allocatedBudget,
      totalSpent,
      remainingBudget,
      disbursementRate,
      transactionCount,
    };
  }, [currentFiscalYear, expenses]);

  // Handlers for Expenses
  const handleOpenAddExpense = () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    if (fiscalYears.length === 0) {
      setIsYearModalOpen(true);
      showToast('กรุณากำหนดปีงบประมาณและงบที่ได้รับก่อนเริ่มบันทึกรายจ่าย', 'error');
      return;
    }
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (data: Omit<Expense, 'id' | 'userId'>) => {
    if (!user) return;
    if (editingExpense) {
      await updateExpense(editingExpense.id, data, user.uid);
      showToast('แก้ไขข้อมูลรายจ่ายเรียบร้อยแล้ว');
    } else {
      await addExpense({
        ...data,
        userId: user.uid,
      });
      showToast('บันทึกข้อมูลรายจ่ายใหม่เรียบร้อยแล้ว');
    }
  };

  const handleDeleteExpense = async (id: string, description: string) => {
    await deleteExpense(id);
    showToast(`ลบรายการ "${description}" เรียบร้อยแล้ว`);
  };

  // Handlers for Fiscal Years with category budgets
  const handleAddYear = async (
    year: string,
    allocatedBudget: number,
    description: string,
    categoryBudgets: Record<string, number>
  ) => {
    if (!user) return;
    await addFiscalYear({
      year,
      allocatedBudget,
      description,
      categoryBudgets,
      userId: user.uid,
    });
    setSelectedYear(year);
    showToast(`เพิ่มปีงบประมาณ ${year} เรียบร้อยแล้ว`);
  };

  const handleUpdateYear = async (
    id: string,
    allocatedBudget: number,
    description: string,
    categoryBudgets: Record<string, number>
  ) => {
    if (!user) return;
    await updateFiscalYear(id, { allocatedBudget, description, categoryBudgets }, user.uid);
    showToast('ปรับปรุงข้อมูลงบประมาณประจำปีและหมวดหมู่เรียบร้อยแล้ว');
  };

  const handleDeleteYear = async (id: string, year: string) => {
    await deleteFiscalYear(id);
    showToast(`ลบปีงบประมาณ ${year} เรียบร้อยแล้ว`);
  };

  const handleSeedDemoData = async (year: string = '2568', budget: number = 1500000) => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    try {
      setLoadingData(true);
      await seedDemoDataForYear(user.uid, year, budget);
      setSelectedYear(year);
      showToast(`สร้างข้อมูลตัวอย่างปีงบประมาณ ${year} สำเร็จแล้ว`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'ไม่สามารถสร้างข้อมูลตัวอย่างได้', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const availableYearsList = fiscalYears.map((fy) => fy.year);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-blue-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-sm font-semibold ${
              toastMessage.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        fiscalYears={fiscalYears}
        selectedYear={selectedYear}
        onSelectYear={(yr) => {
          setSelectedYear(yr);
          setSelectedCategoryFilter(null);
          setSelectedTypeFilter(null);
        }}
        onOpenAddExpense={handleOpenAddExpense}
        onOpenYearModal={() => setIsYearModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Login Banner if not signed in */}
        <LoginBanner />

        {authLoading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">กำลังตรวจสอบข้อมูลผู้ใช้งาน...</p>
          </div>
        ) : !user ? (
          /* Empty / Guest State Preview */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center max-w-3xl mx-auto space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <Building2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                ยินดีต้อนรับสู่ระบบควบคุมงบประมาณ หอพักบุคลากร
              </h3>
              <p className="text-sm text-slate-500 max-w-lg mx-auto mt-2 leading-relaxed">
                ระบบจัดการงบประมาณรายจ่ายประจำปี พร้อมการสรุปผลอัตโนมัติ แผนภูมิวงกลมอินเตอร์แอคทีฟ 
                และตารางบันทึกรายจ่ายครบทั้ง 3 ประเภทรายการ 23 หมวดหมู่รายจ่าย
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
              >
                <span>เข้าสู่ระบบด้วย Google เพื่อเริ่มต้นใช้งาน</span>
              </button>
            </div>
          </div>
        ) : loadingData ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">กำลังโหลดข้อมูลงบประมาณหอพัก...</p>
          </div>
        ) : fiscalYears.length === 0 ? (
          /* First-time Onboarding for authenticated user */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-blue-100 shadow-sm text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                ยังไม่มีข้อมูลปีงบประมาณในระบบ
              </h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                เริ่มต้นโดยการเพิ่มปีงบประมาณและระบุจำนวนเงินงบประมาณที่ได้รับประจำปี หรือกดปุ่มด้านล่างเพื่อสร้างข้อมูลตัวอย่างสำหรับทดสอบ
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleSeedDemoData('2568', 1500000)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>เริ่มต้นปี 2568 (สร้างข้อมูลตัวอย่าง)</span>
              </button>
              <button
                onClick={() => setIsYearModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>กำหนดปีงบประมาณด้วยตนเอง</span>
              </button>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <>
            {/* Dashboard KPI Summary Cards */}
            <DashboardSummary
              stats={stats}
              currentYear={selectedYear}
              onEditBudget={() => setIsYearModalOpen(true)}
            />

            {/* Interactive Pie/Donut Chart Section */}
            <PieChartSection
              expenses={expenses}
              selectedCategoryFilter={selectedCategoryFilter}
              onSelectCategoryFilter={setSelectedCategoryFilter}
              selectedTypeFilter={selectedTypeFilter}
              onSelectTypeFilter={setSelectedTypeFilter}
            />

            {/* Category Budget Allocation & Status Summary */}
            <CategoryBudgetSummary
              fiscalYear={currentFiscalYear}
              expenses={expenses}
              onOpenEditBudget={() => setIsYearModalOpen(true)}
              selectedCategoryFilter={selectedCategoryFilter}
              onSelectCategoryFilter={setSelectedCategoryFilter}
            />

            {/* Expenses Data Table */}
            <ExpenseTable
              expenses={expenses}
              selectedCategoryFilter={selectedCategoryFilter}
              onSelectCategoryFilter={setSelectedCategoryFilter}
              selectedTypeFilter={selectedTypeFilter}
              onSelectTypeFilter={setSelectedTypeFilter}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              onOpenAddExpense={handleOpenAddExpense}
              onOpenPrintReport={() => setIsPrintReportOpen(true)}
              currentYear={selectedYear}
            />
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">ระบบควบคุมงบประมาณรายจ่ายประจำปี หอพักบุคลากร</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              Firebase Project: <strong className="text-slate-700 font-mono">sdnu-abc-sys</strong>
            </span>
            <span>ปีงบประมาณ {selectedYear || '-'}</span>
          </div>
        </div>
      </footer>

      {/* Expense Modal (Add / Edit) */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        initialData={editingExpense}
        availableYears={availableYearsList}
        currentYear={selectedYear}
      />

      {/* Fiscal Year Modal */}
      <FiscalYearModal
        isOpen={isYearModalOpen}
        onClose={() => setIsYearModalOpen(false)}
        fiscalYears={fiscalYears}
        selectedYear={selectedYear}
        onSelectYear={(yr) => {
          setSelectedYear(yr);
          setIsYearModalOpen(false);
        }}
        onAddYear={handleAddYear}
        onUpdateYear={handleUpdateYear}
        onDeleteYear={handleDeleteYear}
        onSeedDemo={handleSeedDemoData}
        expenses={expenses}
      />

      {/* Printable Report Modal */}
      <PrintReportModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        fiscalYear={currentFiscalYear}
        expenses={expenses}
        stats={stats}
        currentYear={selectedYear}
      />
    </div>
  );
}
