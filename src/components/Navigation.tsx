import React, { useRef, useEffect } from 'react';
import { SentenceData, isDayContent } from '../types';

interface NavigationProps {
  availableDates: string[];
  pastMonths: string[];
  presentMonths: string[];
  selectedMonth: string;
  selectedDate: string;
  selectedCategory: string;
  sentenceData: SentenceData | null;
  lastSelectedFolder: string;
  lastSelectedMonth: string;
  onMonthChange: (month: string) => void;
  onDateChange: (date: string) => void;
  onCategoryChange: (category: string) => void;
  onPastMonthChange: (month: string) => void;
  onPresentMonthChange: (month: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  availableDates,
  pastMonths,
  presentMonths,
  selectedMonth,
  selectedDate,
  selectedCategory,
  sentenceData,
  lastSelectedFolder,
  lastSelectedMonth,
  onMonthChange,
  onDateChange,
  onCategoryChange,
  onPastMonthChange,
  onPresentMonthChange,
}) => {
  const monthScrollRef = useRef<HTMLDivElement>(null);
  const dayScrollRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Get all months (past + present)
  const allMonths = [...pastMonths, ...presentMonths].sort();
  
  // Get days for selected month
  const getDaysForMonth = () => {
    if (!sentenceData?.contents) return [];
    
    // Extract unique days from the contents
    const days = sentenceData.contents
      .filter(isDayContent)
      .map(content => content.day)
      .filter((day, index, self) => self.indexOf(day) === index)
      .sort((a, b) => a - b);
    
    return days;
  };
  
  const days = getDaysForMonth();
  
  // Get categories for selected day
  const getCategoriesForDay = () => {
    if (!sentenceData?.contents) return [];
    
    const selectedDay = parseInt(selectedDate.split('-')[2]) || 1;
    const dayContent = sentenceData.contents.find((content): content is import('../types').DayContent => 
      isDayContent(content) && content.day === selectedDay
    );
    
    if (!dayContent?.content) return [];
    
    return dayContent.content.map(cat => cat.category);
  };
  
  const categories = getCategoriesForDay();

  const formatMonth = (month: string) => {
    if (!month) return '';
    
    if (month.includes('-')) {
      // Format: 2022-01
      const [year, monthNum] = month.split('-');
      return `${year}년 ${monthNum}월`;
    } else if (month.length === 6) {
      // Format: 202508
      const year = month.substring(0, 4);
      const monthNum = month.substring(4, 6);
      return `${year}년 ${monthNum}월`;
    }
    
    return month; // Return as-is if format is unexpected
  };

  // Auto-scroll to selected item
  useEffect(() => {
    const scrollToSelected = (ref: React.RefObject<HTMLDivElement | null>, selector: string) => {
      if (ref.current) {
        const selectedElement = ref.current.querySelector(selector);
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    };

    scrollToSelected(monthScrollRef, '.month-item.active');
    scrollToSelected(dayScrollRef, '.day-item.active');
    scrollToSelected(categoryScrollRef, '.category-item.active');
  }, [selectedMonth, selectedDate, selectedCategory]);

  return (
    <nav className="navigation-vertical">
      {/* Month Navigation */}
      <div className="nav-section">
        <div className="nav-scroll-container" ref={monthScrollRef}>
          <div className="nav-items-horizontal">
            {allMonths.map(month => {
              const folder = pastMonths.includes(month) ? 'past' : 'present';
              return (
                <button
                  key={month}
                  className={`month-item ${selectedMonth === month ? 'active' : ''}`}
                  onClick={() => folder === 'past' ? onPastMonthChange(month) : onPresentMonthChange(month)}
                >
                  {formatMonth(month)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Navigation */}
      {days.length > 0 && (
        <div className="nav-section">
          <div className="nav-scroll-container" ref={dayScrollRef}>
            <div className="nav-items-horizontal">
              {days.map(day => {
                const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
                return (
                  <button
                    key={day}
                    className={`day-item ${selectedDate.endsWith(String(day).padStart(2, '0')) ? 'active' : ''}`}
                    onClick={() => onDateChange(dateStr)}
                  >
                    {day}일
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Category Navigation */}
      {categories.length > 0 && (
        <div className="nav-section">
          <div className="nav-scroll-container" ref={categoryScrollRef}>
            <div className="nav-items-horizontal">
              <button
                className={`category-item ${selectedCategory === '전체' ? 'active' : ''}`}
                onClick={() => onCategoryChange('전체')}
              >
                전체
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => onCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;