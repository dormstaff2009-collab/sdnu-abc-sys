export type ExpenseType = 
  | 'ค่าจ้างชั่วคราว'
  | 'ค่าใช้สอยและวัสดุ'
  | 'ค่าครุภัณฑ์ที่ดินและสิ่งก่อสร้าง';

export interface FiscalYear {
  id: string;
  year: string; // e.g. "2568", "2570"
  allocatedBudget: number; // งบประมาณที่ได้รับประจำปี (บาท)
  description?: string;
  categoryBudgets?: Record<string, number>; // วงเงินงบประมาณที่ได้รับจัดสรรแยกตามหมวดหมู่ (รายจ่าย)
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  fiscalYear: string; // 1. ปีงปม. (ปีงบประมาณ)
  type: ExpenseType; // 2. ประเภทรายการ
  category: string; // 3. หมวดหมู่ (รายจ่าย)
  description: string; // 4. รายละเอียด รายจ่าย
  amount: number; // 5. จำนวนเงิน (บาท)
  date: string; // 6. วันที่ทำรายการ (YYYY-MM-DD)
  note?: string; // 7. บันทึกช่วยจำ
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategorySummary {
  category: string;
  type: ExpenseType;
  totalAmount: number;
  count: number;
  percentage: number;
  color: string;
}

export interface TypeSummary {
  type: ExpenseType;
  totalAmount: number;
  count: number;
  percentage: number;
  color: string;
}

export interface CategoryBudgetStatus {
  category: string;
  type: ExpenseType;
  allocated: number;
  spent: number;
  remaining: number;
  disbursementRate: number;
  hasAllocation: boolean;
  count: number;
  color: string;
}

export interface BudgetStats {
  allocatedBudget: number;
  totalSpent: number;
  remainingBudget: number;
  disbursementRate: number; // Percentage spent
  transactionCount: number;
}
