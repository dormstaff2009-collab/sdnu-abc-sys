import React, { useState, useMemo } from 'react';
import { Expense, ExpenseType } from '../types/budget';
import { EXPENSE_TYPES, getCategoryColor, formatBaht, formatBahtNumber } from '../constants/categories';
import { PieChart as PieIcon, Layers, Filter, Check, RotateCcw } from 'lucide-react';

interface PieChartSectionProps {
  expenses: Expense[];
  selectedCategoryFilter: string | null;
  onSelectCategoryFilter: (category: string | null) => void;
  selectedTypeFilter: ExpenseType | null;
  onSelectTypeFilter: (type: ExpenseType | null) => void;
}

type ViewMode = 'category' | 'type';

interface SliceData {
  id: string;
  label: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
  startAngle: number;
  endAngle: number;
}

export const PieChartSection: React.FC<PieChartSectionProps> = ({
  expenses,
  selectedCategoryFilter,
  onSelectCategoryFilter,
  selectedTypeFilter,
  onSelectTypeFilter,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('category');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute aggregated data
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses]);

  const slices: SliceData[] = useMemo(() => {
    if (totalAmount === 0 || expenses.length === 0) return [];

    if (viewMode === 'type') {
      // Group by 3 types
      const map = new Map<ExpenseType, { amount: number; count: number }>();
      EXPENSE_TYPES.forEach((t) => map.set(t.id, { amount: 0, count: 0 }));

      expenses.forEach((item) => {
        const curr = map.get(item.type) || { amount: 0, count: 0 };
        curr.amount += Number(item.amount) || 0;
        curr.count += 1;
        map.set(item.type, curr);
      });

      let currentAngle = 0;
      const result: SliceData[] = [];
      EXPENSE_TYPES.forEach((t) => {
        const item = map.get(t.id);
        if (item && item.amount > 0) {
          const percentage = (item.amount / totalAmount) * 100;
          const angle = (percentage / 100) * 360;
          result.push({
            id: t.id,
            label: t.label,
            amount: item.amount,
            percentage,
            count: item.count,
            color: t.color,
            startAngle: currentAngle,
            endAngle: currentAngle + angle,
          });
          currentAngle += angle;
        }
      });
      return result;
    } else {
      // Group by category (หมวดหมู่รายจ่าย)
      const map = new Map<string, { amount: number; count: number }>();
      expenses.forEach((item) => {
        const cat = item.category || 'อื่นๆ';
        const curr = map.get(cat) || { amount: 0, count: 0 };
        curr.amount += Number(item.amount) || 0;
        curr.count += 1;
        map.set(cat, curr);
      });

      // Sort descending by amount
      const sorted = Array.from(map.entries()).sort((a, b) => b[1].amount - a[1].amount);

      let currentAngle = 0;
      const result: SliceData[] = [];
      sorted.forEach(([catName, data], index) => {
        const percentage = (data.amount / totalAmount) * 100;
        const angle = (percentage / 100) * 360;
        result.push({
          id: catName,
          label: catName,
          amount: data.amount,
          percentage,
          count: data.count,
          color: getCategoryColor(catName, index),
          startAngle: currentAngle,
          endAngle: currentAngle + angle,
        });
        currentAngle += angle;
      });
      return result;
    }
  }, [expenses, totalAmount, viewMode]);

  // Convert polar to cartesian coordinates for SVG path
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  // Helper to generate SVG Arc Path
  const describeArc = (
    centerX: number,
    centerY: number,
    radius: number,
    innerRadius: number,
    startAngleDeg: number,
    endAngleDeg: number
  ) => {
    // Offset by -90 deg so 0 is at top (12 o'clock)
    const startRad = ((startAngleDeg - 90) * Math.PI) / 180;
    const endRad = ((endAngleDeg - 90) * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArcFlag = endAngleDeg - startAngleDeg <= 180 ? 0 : 1;

    return [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');
  };

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  const handleSliceClick = (slice: SliceData) => {
    if (viewMode === 'type') {
      const typeKey = slice.id as ExpenseType;
      if (selectedTypeFilter === typeKey) {
        onSelectTypeFilter(null);
      } else {
        onSelectTypeFilter(typeKey);
      }
    } else {
      if (selectedCategoryFilter === slice.id) {
        onSelectCategoryFilter(null);
      } else {
        onSelectCategoryFilter(slice.id);
      }
    }
  };

  const isFiltered = selectedCategoryFilter !== null || selectedTypeFilter !== null;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              แผนภูมิแสดงสัดส่วนงบประมาณรายจ่าย
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            คลิกที่แถบหรือชิ้นแผนภูมิเพื่อกรองรายการในตารางด้านล่างได้ทันที
          </p>
        </div>

        {/* View Toggle Button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {isFiltered && (
            <button
              onClick={() => {
                onSelectCategoryFilter(null);
                onSelectTypeFilter(null);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              ล้างตัวกรอง
            </button>
          )}

          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setViewMode('category');
                onSelectTypeFilter(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'category'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              แยกตามหมวดหมู่
            </button>
            <button
              onClick={() => {
                setViewMode('type');
                onSelectCategoryFilter(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'type'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              แยกตาม 3 ประเภทรายการ
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Donut Chart + Legend */}
      {slices.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <PieIcon className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">ยังไม่มีข้อมูลรายจ่ายในปีงบประมาณนี้</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            เพิ่มรายการรายจ่ายใหม่ผ่านปุ่ม &quot;บันทึกรายจ่าย&quot; เพื่อดูการสรุปผลและแผนภูมิสัดส่วน
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-4">
          
          {/* Donut Chart Visual */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72">
              <svg viewBox="0 0 300 300" className="w-full h-full transform transition-all drop-shadow-sm">
                <g>
                  {slices.map((slice, index) => {
                    const isHovered = hoveredIndex === index;
                    const isSelected =
                      viewMode === 'category'
                        ? selectedCategoryFilter === slice.id
                        : selectedTypeFilter === slice.id;

                    const radius = isHovered || isSelected ? 135 : 125;
                    const innerRadius = isHovered || isSelected ? 72 : 75;

                    // If single slice takes 100%
                    if (slices.length === 1) {
                      return (
                        <circle
                          key={slice.id}
                          cx="150"
                          cy="150"
                          r={(radius + innerRadius) / 2}
                          fill="none"
                          stroke={slice.color}
                          strokeWidth={radius - innerRadius}
                          className="cursor-pointer transition-all duration-300"
                          onClick={() => handleSliceClick(slice)}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      );
                    }

                    const path = describeArc(
                      150,
                      150,
                      radius,
                      innerRadius,
                      slice.startAngle,
                      slice.endAngle >= 360 ? 359.99 : slice.endAngle
                    );

                    return (
                      <path
                        key={slice.id}
                        d={path}
                        fill={slice.color}
                        className={`cursor-pointer transition-all duration-300 ${
                          isSelected ? 'stroke-2 stroke-slate-900' : 'stroke-1 stroke-white'
                        }`}
                        style={{
                          opacity:
                            (selectedCategoryFilter && selectedCategoryFilter !== slice.id) ||
                            (selectedTypeFilter && selectedTypeFilter !== slice.id)
                              ? 0.35
                              : 1,
                        }}
                        onClick={() => handleSliceClick(slice)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    );
                  })}
                </g>
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                {activeSlice ? (
                  <div className="animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-[11px] font-semibold text-slate-500 block truncate max-w-[130px]">
                      {activeSlice.label}
                    </span>
                    <span className="text-lg sm:text-xl font-extrabold text-slate-900 block leading-tight">
                      ฿{formatBahtNumber(activeSlice.amount)}
                    </span>
                    <span className="text-xs font-bold text-blue-600 block mt-0.5">
                      {activeSlice.percentage.toFixed(1)}%
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                      ยอดใช้จ่ายรวม
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-slate-900 block leading-tight">
                      ฿{formatBahtNumber(totalAmount)}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {slices.length} {viewMode === 'category' ? 'หมวดหมู่' : 'ประเภท'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 text-center">
              นำเมาส์ชี้บนแผนภูมิเพื่อดูสัดส่วนและยอดเงิน
            </p>
          </div>

          {/* Legend & Breakdown List */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                รายการสรุปแยกสัดส่วน ({slices.length})
              </span>
              <span className="text-xs font-medium text-slate-500">
                รวม {formatBaht(totalAmount)}
              </span>
            </div>

            {/* Scrollable breakdown list */}
            <div className="max-h-72 overflow-y-auto pr-1 space-y-1.5 divide-y divide-slate-100">
              {slices.map((slice, index) => {
                const isHovered = hoveredIndex === index;
                const isSelected =
                  viewMode === 'category'
                    ? selectedCategoryFilter === slice.id
                    : selectedTypeFilter === slice.id;

                return (
                  <div
                    key={slice.id}
                    onClick={() => handleSliceClick(slice)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-300 shadow-2xs'
                        : isHovered
                        ? 'bg-slate-50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Left: Color dot & Label */}
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span
                        className="w-3.5 h-3.5 rounded-md shrink-0 shadow-2xs"
                        style={{ backgroundColor: slice.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              isSelected ? 'text-blue-900' : 'text-slate-800'
                            }`}
                          >
                            {slice.label}
                          </span>
                          {isSelected && (
                            <span className="shrink-0 text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded-full">
                              เลือกอยู่
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {slice.count} รายการ
                        </span>
                      </div>
                    </div>

                    {/* Right: Amount & Percent */}
                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        {formatBaht(slice.amount)}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500">
                        {slice.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
