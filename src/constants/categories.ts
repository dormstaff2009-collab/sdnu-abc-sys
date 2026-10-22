import { ExpenseType } from '../types/budget';

export const EXPENSE_TYPES: { id: ExpenseType; label: string; color: string; bgClass: string; textClass: string; borderClass: string }[] = [
  {
    id: 'ค่าจ้างชั่วคราว',
    label: '1. ค่าจ้างชั่วคราว',
    color: '#3B82F6', // Blue
    bgClass: 'bg-blue-50 text-blue-700 border-blue-200',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-500',
  },
  {
    id: 'ค่าใช้สอยและวัสดุ',
    label: '2. ค่าใช้สอยและวัสดุ',
    color: '#10B981', // Emerald/Green
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-500',
  },
  {
    id: 'ค่าครุภัณฑ์ที่ดินและสิ่งก่อสร้าง',
    label: '3. ค่าครุภัณฑ์ที่ดินและสิ่งก่อสร้าง',
    color: '#F59E0B', // Amber
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-500',
  },
];

export interface CategoryDef {
  name: string;
  defaultType: ExpenseType;
  color: string;
}

export const CATEGORY_LIST: CategoryDef[] = [
  // 1-6 ค่าจ้าง / จ้างเหมาบริการ
  { name: 'ค่าจ้างชั่วคราวรายวัน', defaultType: 'ค่าจ้างชั่วคราว', color: '#2563EB' },
  { name: 'จ้างเหมาบริการรักษาความปลอดภัย', defaultType: 'ค่าจ้างชั่วคราว', color: '#1D4ED8' },
  { name: 'ค่าจ้างบำรุงรักษาครุภัณฑ์สำนักงาน (ลิฟต์โดยสาร)', defaultType: 'ค่าจ้างชั่วคราว', color: '#3B82F6' },
  { name: 'จ้างเหมากำจัดปลวก', defaultType: 'ค่าจ้างชั่วคราว', color: '#60A5FA' },
  { name: 'จ้างซักชุดเครื่องนอนห้องรับรอง', defaultType: 'ค่าจ้างชั่วคราว', color: '#93C5FD' },
  { name: 'จ้างสูบสิ่งปฏิกูล', defaultType: 'ค่าจ้างชั่วคราว', color: '#0284C7' },

  // 7-15 วัสดุต่าง ๆ
  { name: 'วัสดุเชื้อเพลิงและหล่อลื่น', defaultType: 'ค่าใช้สอยและวัสดุ', color: '#059669' },
  { name: 'วัสดุสำนักงาน', defaultType: 'ค่าใช้สอยและวัสดุ', color: '#10B981' },
  { name: 'วัสดุก่อสร้าง', defaultType: 'ค่าใช้สอยและวัสดุ', color: '#34D399' },
  { name: 'วัสดุงานบ้านงานครัว', defaultType: 'ค่าใช้สอยและวัสดุ', color: '#6EE7B7' },
  { name: 'วัสดุไฟฟ้าและวิทยุ', defaultType: 'ค่าใช้สอยและวัสดุ', color: '#0D9488' },
  { name: 'วัสดุโฆษณาและเผยแพร่', defaultType: 'ค่าใช้สอยและวัสดุ', color: '#14B8A6' },
  { name: 'วัสดุการเกษตร', defaultType: 'ค่าใช้สอยและวัสดุ', color: '#84CC16' },
  { name: 'วัสดุเครื่องแต่งกาย', defaultType: 'ค่าใช้สอยและวัสดุ', color: '#A3E635' },
  { name: 'วัสดุยานพาหนะและขนส่ง', defaultType: 'ค่าใช้สอยและวัสดุ', color: '#65A30D' },

  // ครุภัณฑ์ที่ดินและสิ่งก่อสร้าง
  { name: 'ค่าครุภัณฑ์ประจำหอพัก', defaultType: 'ค่าครุภัณฑ์ที่ดินและสิ่งก่อสร้าง', color: '#D97706' },
  { name: 'ค่าที่ดินและสิ่งก่อสร้าง', defaultType: 'ค่าครุภัณฑ์ที่ดินและสิ่งก่อสร้าง', color: '#F59E0B' },
  { name: 'ปรับปรุงซ่อมแซมอาคารและสถานที่', defaultType: 'ค่าครุภัณฑ์ที่ดินและสิ่งก่อสร้าง', color: '#FBBF24' },
  { name: 'วัสดุอื่นๆ', defaultType: 'ค่าใช้สอยและวัสดุ', color: '#8B5CF6' },
];

export const CATEGORY_COLORS: Record<string, string> = CATEGORY_LIST.reduce((acc, curr) => {
  acc[curr.name] = curr.color;
  return acc;
}, {} as Record<string, string>);

export const PALETTE = [
  '#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', 
  '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6',
  '#E11D48', '#0D9488', '#D97706', '#3B82F6', '#A855F7',
  '#059669', '#EF4444', '#64748B'
];

export function getCategoryColor(name: string, index: number = 0): string {
  if (CATEGORY_COLORS[name]) return CATEGORY_COLORS[name];
  return PALETTE[index % PALETTE.length];
}

export function getTypeBadge(type: ExpenseType) {
  const match = EXPENSE_TYPES.find(t => t.id === type);
  return match || {
    id: type,
    label: type,
    color: '#6B7280',
    bgClass: 'bg-gray-100 text-gray-800 border-gray-300',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-400',
  };
}

export function formatBaht(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('THB', '฿');
}

export function formatBahtNumber(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatThaiDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const [yearStr, monthStr, dayStr] = dateString.split('-');
    if (!yearStr || !monthStr || !dayStr) return dateString;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    
    const monthsThai = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    // If year is AD (< 2500), convert to BE
    const thaiYear = year < 2500 ? year + 543 : year;
    return `${day} ${monthsThai[month] || ''} ${thaiYear}`;
  } catch {
    return dateString;
  }
}
