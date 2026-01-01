import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface DateWheelPickerProps {
  value?: { month: number; day: number; year?: number };
  onChange: (value: { month: number; day: number; year?: number }) => void;
  showYear?: boolean;
  yearPlaceholder?: string;
  className?: string;
}

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

export const DateWheelPicker = ({ 
  value, 
  onChange, 
  showYear = false,
  yearPlaceholder = "Год рождения?",
  className 
}: DateWheelPickerProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  
  const [selectedMonth, setSelectedMonth] = useState(value?.month ?? new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(value?.day ?? new Date().getDate());
  const [selectedYear, setSelectedYear] = useState<number | undefined>(value?.year);
  const [yearInput, setYearInput] = useState(value?.year?.toString() || '');
  
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  
  const daysInCurrentMonth = DAYS_IN_MONTH[selectedMonth];
  const days = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  // Scroll to selected items on mount
  useEffect(() => {
    if (monthRef.current) {
      monthRef.current.scrollTop = selectedMonth * ITEM_HEIGHT;
    }
  }, []);

  useEffect(() => {
    if (dayRef.current) {
      dayRef.current.scrollTop = (selectedDay - 1) * ITEM_HEIGHT;
    }
  }, []);

  // Adjust day if it exceeds days in new month
  useEffect(() => {
    if (selectedDay > daysInCurrentMonth) {
      setSelectedDay(daysInCurrentMonth);
    }
  }, [selectedMonth, daysInCurrentMonth, selectedDay]);

  // Notify parent of changes
  useEffect(() => {
    const validDay = Math.min(selectedDay, daysInCurrentMonth);
    onChange({ 
      month: selectedMonth, 
      day: validDay,
      year: showYear ? selectedYear : undefined
    });
  }, [selectedMonth, selectedDay, selectedYear, daysInCurrentMonth, onChange, showYear]);

  const handleScroll = useCallback((
    ref: React.RefObject<HTMLDivElement>,
    setter: (value: number) => void,
    isMonth: boolean
  ) => {
    if (!ref.current) return;
    
    const scrollTop = ref.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const maxIndex = isMonth ? 11 : daysInCurrentMonth - 1;
    const clampedIndex = Math.max(0, Math.min(index, maxIndex));
    
    setter(isMonth ? clampedIndex : clampedIndex + 1);
  }, [daysInCurrentMonth]);

  const snapToItem = (ref: React.RefObject<HTMLDivElement>, index: number) => {
    if (ref.current) {
      ref.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: 'smooth'
      });
    }
  };

  const handleMonthScrollEnd = () => {
    handleScroll(monthRef, setSelectedMonth, true);
    snapToItem(monthRef, selectedMonth);
  };

  const handleDayScrollEnd = () => {
    handleScroll(dayRef, setSelectedDay, false);
    snapToItem(dayRef, selectedDay - 1);
  };

  const handleYearInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setYearInput(val);
    
    if (val.length === 4) {
      const year = parseInt(val);
      if (year >= 1920 && year <= currentYear) {
        setSelectedYear(year);
      }
    } else {
      setSelectedYear(undefined);
    }
  };

  const renderWheel = (
    items: (string | number)[],
    selectedIndex: number,
    ref: React.RefObject<HTMLDivElement>,
    onScrollEnd: () => void,
    isMonth: boolean
  ) => {
    const paddingItems = Math.floor(VISIBLE_ITEMS / 2);
    
    return (
      <div className="relative flex-1">
        {/* Gradient overlays */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-secondary to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-secondary to-transparent z-10 pointer-events-none" />
        
        {/* Selection indicator */}
        <div 
          className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-11 bg-background rounded-xl z-0"
        />
        
        {/* Scrollable area */}
        <div
          ref={ref}
          className="relative h-[220px] overflow-y-auto scrollbar-hide snap-y snap-mandatory"
          onScroll={() => handleScroll(ref, isMonth ? setSelectedMonth : setSelectedDay, isMonth)}
          onTouchEnd={onScrollEnd}
          onMouseUp={onScrollEnd}
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {/* Top padding */}
          <div style={{ height: paddingItems * ITEM_HEIGHT }} />
          
          {items.map((item, index) => {
            const isSelected = isMonth ? index === selectedIndex : index + 1 === selectedIndex;
            const distance = isMonth 
              ? Math.abs(index - selectedIndex)
              : Math.abs(index + 1 - selectedIndex);
            
            return (
              <div
                key={index}
                className={cn(
                  "h-11 flex items-center justify-center transition-all duration-150 snap-center cursor-pointer",
                  isMonth ? "text-left pl-4" : "text-center",
                  isSelected 
                    ? "text-foreground font-semibold text-lg" 
                    : distance === 1 
                      ? "text-muted-foreground text-base"
                      : "text-muted-foreground/50 text-sm"
                )}
                style={{ height: ITEM_HEIGHT }}
                onClick={() => {
                  if (isMonth) {
                    setSelectedMonth(index);
                    snapToItem(ref, index);
                  } else {
                    setSelectedDay(index + 1);
                    snapToItem(ref, index);
                  }
                }}
              >
                {item}
              </div>
            );
          })}
          
          {/* Bottom padding */}
          <div style={{ height: paddingItems * ITEM_HEIGHT }} />
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Date picker label */}
      <p className="text-sm font-medium text-foreground">Выберите дату</p>
      
      {/* Wheel picker */}
      <div className="bg-secondary rounded-2xl p-2">
        <div className="flex">
          {renderWheel(MONTHS, selectedMonth, monthRef, handleMonthScrollEnd, true)}
          {renderWheel(days, selectedDay, dayRef, handleDayScrollEnd, false)}
        </div>
      </div>
      
      {/* Year input */}
      {showYear && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Выберите год</p>
          <input
            type="text"
            inputMode="numeric"
            placeholder={yearPlaceholder}
            value={yearInput}
            onChange={handleYearInputChange}
            className="w-full h-12 px-4 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}
    </div>
  );
};
