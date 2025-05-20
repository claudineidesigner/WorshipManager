import React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: number;
  name: string;
  date: string;
  type: string;
}

interface CalendarProps {
  currentMonth: Date;
  events: CalendarEvent[];
  isLoading?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ currentMonth, events, isLoading = false }) => {
  // Get days for the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Create an array of weeks (each with 7 days)
  const weeks: Date[][] = [];
  let week: Date[] = [];
  
  // Start with appropriate offset for the first day of the month
  const firstDayOfMonth = monthStart.getDay();
  for (let i = 0; i < firstDayOfMonth; i++) {
    const prevMonthDay = new Date(monthStart);
    prevMonthDay.setDate(prevMonthDay.getDate() - (firstDayOfMonth - i));
    week.push(prevMonthDay);
  }
  
  // Add all days of the month
  days.forEach((day) => {
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    week.push(day);
  });
  
  // Fill in the last week if needed
  if (week.length > 0) {
    while (week.length < 7) {
      const nextMonthDay = new Date(monthEnd);
      nextMonthDay.setDate(nextMonthDay.getDate() + (week.length - 6));
      week.push(nextMonthDay);
    }
    weeks.push(week);
  }
  
  // Helper to get events for a specific day
  const getEventsForDay = (date: Date) => {
    if (!events) return [];
    return events.filter(
      (event) => new Date(event.date).toDateString() === date.toDateString()
    );
  };
  
  // Get color class based on event type
  const getEventColorClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sunday service':
      case 'celebration service':
        return "bg-primary-100 text-primary-800";
      case 'midweek service':
      case 'prayer service':
        return "bg-secondary-100 text-secondary-800";
      case 'youth service':
      case 'youth worship':
      case 'special event':
        return "bg-accent-100 text-accent-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div>
      <div className="grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700">
        <div className="bg-white py-2">Sun</div>
        <div className="bg-white py-2">Mon</div>
        <div className="bg-white py-2">Tue</div>
        <div className="bg-white py-2">Wed</div>
        <div className="bg-white py-2">Thu</div>
        <div className="bg-white py-2">Fri</div>
        <div className="bg-white py-2">Sat</div>
      </div>
      
      <div className="grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm">
        {isLoading ? (
          // Loading state
          Array.from({ length: 35 }).map((_, index) => (
            <div key={index} className="bg-white py-2 px-3 h-24 animate-pulse">
              <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
              <div className="mt-2 h-4 w-20 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : (
          // Calendar days
          weeks.flat().map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const dayEvents = getEventsForDay(day);
            
            return (
              <div 
                key={index}
                className={cn(
                  "bg-white py-2 px-3 h-24",
                  isToday(day) && "bg-primary-50 ring-1 ring-primary-600"
                )}
              >
                <time 
                  dateTime={format(day, 'yyyy-MM-dd')}
                  className={cn(
                    isCurrentMonth ? (
                      isToday(day) ? "font-semibold text-primary-600" : "text-gray-900"
                    ) : "text-gray-400"
                  )}
                >
                  {format(day, 'd')}
                </time>
                
                {dayEvents.length > 0 && (
                  <div className="mt-2">
                    {dayEvents.map((event, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "rounded px-2 py-1 text-xs leading-tight mb-1 truncate",
                          getEventColorClass(event.type)
                        )}
                      >
                        {event.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Calendar;
