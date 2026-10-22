import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { FiscalYear, Expense } from '../types/budget';

const FISCAL_YEARS_COLLECTION = 'fiscal_years';
const EXPENSES_COLLECTION = 'expenses';

export function subscribeFiscalYears(
  userId: string,
  onUpdate: (years: FiscalYear[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(
    collection(db, FISCAL_YEARS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const years: FiscalYear[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          year: data.year,
          allocatedBudget: Number(data.allocatedBudget) || 0,
          description: data.description || '',
          categoryBudgets: data.categoryBudgets || {},
          userId: data.userId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });
      // Sort fiscal years descending (e.g. 2570, 2569, 2568, 2567)
      years.sort((a, b) => b.year.localeCompare(a.year));
      onUpdate(years);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, FISCAL_YEARS_COLLECTION);
    }
  );
}

export async function addFiscalYear(
  data: Omit<FiscalYear, 'id'>
): Promise<string> {
  const docRef = doc(collection(db, FISCAL_YEARS_COLLECTION));
  const payload: Record<string, unknown> = {
    year: String(data.year).trim(),
    allocatedBudget: Number(data.allocatedBudget) || 0,
    description: (data.description || '').slice(0, 250),
    categoryBudgets: data.categoryBudgets || {},
    userId: data.userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${FISCAL_YEARS_COLLECTION}/${docRef.id}`);
  }
}

export async function updateFiscalYear(
  id: string,
  data: Partial<Omit<FiscalYear, 'id' | 'userId'>>,
  userId: string
): Promise<void> {
  const docRef = doc(db, FISCAL_YEARS_COLLECTION, id);
  const payload: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (data.year !== undefined) payload.year = String(data.year).trim();
  if (data.allocatedBudget !== undefined) payload.allocatedBudget = Number(data.allocatedBudget) || 0;
  if (data.description !== undefined) payload.description = (data.description || '').slice(0, 250);
  if (data.categoryBudgets !== undefined) payload.categoryBudgets = data.categoryBudgets;
  payload.userId = userId;

  try {
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${FISCAL_YEARS_COLLECTION}/${id}`);
  }
}

export async function deleteFiscalYear(id: string): Promise<void> {
  const docRef = doc(db, FISCAL_YEARS_COLLECTION, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${FISCAL_YEARS_COLLECTION}/${id}`);
  }
}

export function subscribeExpenses(
  userId: string,
  fiscalYear: string,
  onUpdate: (expenses: Expense[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const expenses: Expense[] = [];
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (!fiscalYear || data.fiscalYear === fiscalYear) {
          expenses.push({
            id: d.id,
            fiscalYear: data.fiscalYear,
            type: data.type,
            category: data.category,
            description: data.description,
            amount: Number(data.amount) || 0,
            date: data.date,
            note: data.note || '',
            userId: data.userId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        }
      });
      expenses.sort((a, b) => b.date.localeCompare(a.date));
      onUpdate(expenses);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, EXPENSES_COLLECTION);
    }
  );
}

export async function addExpense(
  data: Omit<Expense, 'id'>
): Promise<string> {
  const docRef = doc(collection(db, EXPENSES_COLLECTION));
  const payload = {
    fiscalYear: String(data.fiscalYear).trim(),
    type: data.type,
    category: data.category,
    description: (data.description || '').slice(0, 500),
    amount: Number(data.amount) || 0,
    date: data.date,
    note: (data.note || '').slice(0, 500),
    userId: data.userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${EXPENSES_COLLECTION}/${docRef.id}`);
  }
}

export async function updateExpense(
  id: string,
  data: Partial<Omit<Expense, 'id' | 'userId'>>,
  userId: string
): Promise<void> {
  const docRef = doc(db, EXPENSES_COLLECTION, id);
  const payload: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (data.fiscalYear !== undefined) payload.fiscalYear = String(data.fiscalYear).trim();
  if (data.type !== undefined) payload.type = data.type;
  if (data.category !== undefined) payload.category = data.category;
  if (data.description !== undefined) payload.description = (data.description || '').slice(0, 500);
  if (data.amount !== undefined) payload.amount = Number(data.amount) || 0;
  if (data.date !== undefined) payload.date = data.date;
  if (data.note !== undefined) payload.note = (data.note || '').slice(0, 500);
  payload.userId = userId;

  try {
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${EXPENSES_COLLECTION}/${id}`);
  }
}

export async function deleteExpense(id: string): Promise<void> {
  const docRef = doc(db, EXPENSES_COLLECTION, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${EXPENSES_COLLECTION}/${id}`);
  }
}

// Seed initial demo data with category budgets pre-allocated
export async function seedDemoDataForYear(userId: string, year: string, allocated: number): Promise<void> {
  const categoryBudgets: Record<string, number> = {
    'จ้างเหมาบริการรักษาความปลอดภัย': 540000,
    'ค่าจ้างบำรุงรักษาครุภัณฑ์สำนักงาน (ลิฟต์โดยสาร)': 220000,
    'จ้างเหมากำจัดปลวก': 60000,
    'จ้างซักชุดเครื่องนอนห้องรับรอง': 45000,
    'จ้างสูบสิ่งปฏิกูล': 35000,
    'วัสดุไฟฟ้าและวิทยุ': 120000,
    'วัสดุงานบ้านงานครัว': 90000,
    'วัสดุสำนักงาน': 50000,
    'ปรับปรุงซ่อมแซมอาคารและสถานที่': 300000,
    'ค่าครุภัณฑ์ประจำหอพัก': 40000,
  };

  await addFiscalYear({
    year,
    allocatedBudget: allocated,
    description: `งบประมาณรายจ่ายประจำปี ${year} หอพักบุคลากร`,
    categoryBudgets,
    userId,
  });

  const demoExpenses: Omit<Expense, 'id'>[] = [
    {
      fiscalYear: year,
      type: 'ค่าจ้างชั่วคราว',
      category: 'จ้างเหมาบริการรักษาความปลอดภัย',
      description: 'ค่าจ้างเหมาเจ้าหน้าที่ รปภ. ประจำหอพัก งวดประจำเดือน ตุลาคม',
      amount: 45000,
      date: '2026-10-05',
      note: 'สัญญาจ้างเลขที่ หพ. 12/2568',
      userId,
    },
    {
      fiscalYear: year,
      type: 'ค่าจ้างชั่วคราว',
      category: 'ค่าจ้างบำรุงรักษาครุภัณฑ์สำนักงาน (ลิฟต์โดยสาร)',
      description: 'ค่าบริการตรวจเช็คและบำรุงรักษาลิฟต์โดยสารอาคาร A และ B',
      amount: 18500,
      date: '2026-10-12',
      note: 'บริษัท มิตซูบิชิ เอลเลเวเตอร์ จก.',
      userId,
    },
    {
      fiscalYear: year,
      type: 'ค่าใช้สอยและวัสดุ',
      category: 'วัสดุไฟฟ้าและวิทยุ',
      description: 'จัดซื้อหลอดไฟ LED T8 และอุปกรณ์สวิตช์ไฟสำหรับโถงทางเดิน',
      amount: 12400,
      date: '2026-10-15',
      note: 'เบิกเปลี่ยนหลอดชำรุดชั้น 2-5',
      userId,
    },
    {
      fiscalYear: year,
      type: 'ค่าใช้สอยและวัสดุ',
      category: 'วัสดุงานบ้านงานครัว',
      description: 'น้ำยาทำความสะอาดพื้น ถุงขยะดำ และอุปกรณ์ทำความสะอาดส่วนกลาง',
      amount: 8650,
      date: '2026-10-18',
      note: 'สำหรับแม่บ้านประจำอาคาร',
      userId,
    },
    {
      fiscalYear: year,
      type: 'ค่าจ้างชั่วคราว',
      category: 'จ้างเหมากำจัดปลวก',
      description: 'ค่าจ้างเหมาอัดน้ำยาป้องกันและกำจัดปลวกประจำไตรมาส',
      amount: 15000,
      date: '2026-10-20',
      note: 'รอบที่ 1/2568',
      userId,
    },
    {
      fiscalYear: year,
      type: 'ค่าครุภัณฑ์ที่ดินและสิ่งก่อสร้าง',
      category: 'ปรับปรุงซ่อมแซมอาคารและสถานที่',
      description: 'ซ่อมแซมกระเบื้องทางเดินและระบบกันซึมดาดฟ้าหอพัก',
      amount: 78000,
      date: '2026-10-21',
      note: 'เบิกจ่ายตามใบส่งมอบงาน',
      userId,
    },
    {
      fiscalYear: year,
      type: 'ค่าใช้สอยและวัสดุ',
      category: 'วัสดุสำนักงาน',
      description: 'กระดาษ A4 แฟ้มเอกสาร และหมึกพิมพ์สำหรับงานธุรการหอพัก',
      amount: 5400,
      date: '2026-10-22',
      note: 'ร้าน สยามเครื่องเขียน',
      userId,
    },
  ];

  for (const exp of demoExpenses) {
    await addExpense(exp);
  }
}
