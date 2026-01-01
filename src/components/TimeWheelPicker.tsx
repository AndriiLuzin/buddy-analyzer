import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TimeWheelPickerProps {
  value?: { hours: number; minutes: number };
  onChange: (value: { hours: number; minutes: number }) => void;
  className?: string;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, 15...55

export const TimeWheelPicker = ({ 
  value, 
  onChange, 
  className 
}: TimeWheelPickerProps) => {
  const [selectedHours, setSelectedHours] = useState(value?.hours ?? 12);
  const [selectedMinutes, setSelectedMinutes] = useState(value?.minutes ?? 0);
  
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  // Scroll to selected items on mount
  useEffect(() => {
    if (hoursRef.current) {
      hoursRef.current.scrollTop = selectedHours * ITEM_HEIGHT;
    }
  }, []);

  useEffect(() => {
    if (minutesRef.current) {
      const minuteIndex = MINUTES.indexOf(selectedMinutes);
      minutesRef.current.scrollTop = (minuteIndex >= 0 ? minuteIndex : 0) * ITEM_HEIGHT;
    }
  }, []);

  // Notify parent of changes
  useEffect(() => {
    onChange({ hours: selectedHours, minutes: selectedMinutes });
  }, [selectedHours, selectedMinutes, onChange]);

  const handleScroll = useCallback((
    ref: React.RefObject<HTMLDivElement>,
    setter: (value: number) => void,
    items: number[]
  ) => {
    if (!ref.current) return;
    
    const scrollTop = ref.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    
    setter(items[clampedIndex]);
  }, []);

  const snapToItem = (ref: React.RefObject<HTMLDivElement>, index: number) => {
    if (ref.current) {
      ref.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: 'smooth'
      });
    }
  };

  const handleHoursScrollEnd = () => {
    handleScroll(hoursRef, setSelectedHours, HOURS);
    snapToItem(hoursRef, selectedHours);
  };

  const handleMinutesScrollEnd = () => {
    handleScroll(minutesRef, setSelectedMinutes, MINUTES);
    const minuteIndex = MINUTES.indexOf(selectedMinutes);
    snapToItem(minutesRef, minuteIndex >= 0 ? minuteIndex : 0);
  };

  const renderWheel = (
    items: number[],
    selectedValue: number,
    ref: React.RefObject<HTMLDivElement>,
    onScrollEnd: () => void,
    setter: (value: number) => void,
    formatValue: (val: number) => string
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
          onScroll={() => handleScroll(ref, setter, items)}
          onTouchEnd={onScrollEnd}
          onMouseUp={onScrollEnd}
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {/* Top padding */}
          <div style={{ height: paddingItems * ITEM_HEIGHT }} />
          
          {items.map((item, index) => {
            const isSelected = item === selectedValue;
            const selectedIndex = items.indexOf(selectedValue);
            const distance = Math.abs(index - selectedIndex);
            
            return (
              <div
                key={index}
                className={cn(
                  "h-11 flex items-center justify-center transition-all duration-150 snap-center cursor-pointer",
                  isSelected 
                    ? "text-foreground font-semibold text-lg" 
                    : distance === 1 
                      ? "text-muted-foreground text-base"
                      : "text-muted-foreground/50 text-sm"
                )}
                style={{ height: ITEM_HEIGHT }}
                onClick={() => {
                  setter(item);
                  snapToItem(ref, index);
                }}
              >
                {formatValue(item)}
              </div>
            );
          })}
          
          {/* Bottom padding */}
          <div style={{ height: paddingItems * ITEM_HEIGHT }} />
        </div>
      </div>
    );
  };

  const formatHours = (h: number) => h.toString().padStart(2, '0');
  const formatMinutes = (m: number) => m.toString().padStart(2, '0');

  return (
    <div className={cn("space-y-4", className)}>
      {/* Wheel picker */}
      <div className="bg-secondary rounded-2xl p-2">
        <div className="flex items-center">
          {renderWheel(HOURS, selectedHours, hoursRef, handleHoursScrollEnd, setSelectedHours, formatHours)}
          <span className="text-2xl font-bold text-foreground px-2">:</span>
          {renderWheel(MINUTES, selectedMinutes, minutesRef, handleMinutesScrollEnd, setSelectedMinutes, formatMinutes)}
        </div>
      </div>
    </div>
  );
};
