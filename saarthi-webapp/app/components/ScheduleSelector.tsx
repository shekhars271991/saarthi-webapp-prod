import React, { useState, useMemo } from 'react';
import { Calendar, Clock, ChevronDown } from 'lucide-react';

interface ScheduleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
  value,
  onChange,
  label = "Schedule",
  className = ""
}) => {
  const [showDateDropdown, setShowDateDropdown] = useState<boolean>(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState<boolean>(false);

  // Parse current value to get selected date and time
  const { selectedDate, selectedTime } = useMemo(() => {
    if (value) {
      try {
        // Handle datetime-local format (YYYY-MM-DDTHH:MM)
        if (value.includes('T')) {
          const [dateStr, timeStr] = value.split('T');
          const [hours, minutes] = timeStr.split(':');
          const result = { 
            selectedDate: dateStr, 
            selectedTime: `${hours}:${minutes}` 
          };
          console.log('Parsed value:', value, 'Result:', result);
          return result;
        } else {
          // Fallback to Date parsing
          const date = new Date(value);
          const dateStr = date.toISOString().split('T')[0];
          const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          return { selectedDate: dateStr, selectedTime: timeStr };
        }
      } catch (error) {
        console.error('Error parsing date value:', value, error);
        return { selectedDate: '', selectedTime: '' };
      }
    }
    return { selectedDate: '', selectedTime: '' };
  }, [value]);

  // Generate date options (today, tomorrow, day after tomorrow)
  const dateOptions = useMemo(() => {
    const today = new Date();
    const options = [];
    
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let label = '';
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';
      else label = 'Day After Tomorrow';
      
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const displayDate = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      
      options.push({
        value: dateStr,
        label: label,
        displayDate: displayDate,
        fullDate: date
      });
    }
    
    return options;
  }, []);

  // Generate time options in 15-minute intervals
  const timeOptions = useMemo(() => {
    if (!selectedDate) return [];
    
    const options = [];
    const now = new Date();
    const todayDateStr = new Date().toISOString().split('T')[0];
    
    // Start from current time + 30 minutes if today is selected
    let startHour = selectedDate === todayDateStr ? now.getHours() : 6;
    let startMinute = 0;
    
    if (selectedDate === todayDateStr) {
      // For today, start from current time + 30 minutes
      const futureTime = new Date(now.getTime() + 30 * 60000); // Add 30 minutes
      startHour = futureTime.getHours();
      startMinute = Math.ceil(futureTime.getMinutes() / 15) * 15; // Round up to next 15-minute interval
      
      if (startMinute >= 60) {
        startHour += 1;
        startMinute = 0;
      }
    }
    
    // Generate time slots from start time to 11:45 PM
    for (let hour = startHour; hour < 24; hour++) {
      const startMin = (hour === startHour) ? startMinute : 0;
      
      for (let minute = startMin; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        options.push({
          value: timeStr,
          label: displayTime
        });
      }
    }
    
    return options;
  }, [selectedDate]);

  const handleDateSelect = (dateValue: string) => {
    setShowDateDropdown(false);
    
    // Create new datetime with selected date and reset time
    const date = new Date(dateValue + 'T00:00:00');
    
    // Format as datetime-local string
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const isoString = `${year}-${month}-${day}T00:00`;
    onChange(isoString);
  };

  const handleTimeSelect = (timeValue: string) => {
    setShowTimeDropdown(false);
    
    if (selectedDate) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      // Create a new date object from the selected date string
      const date = new Date(selectedDate + 'T00:00:00');
      date.setHours(hours, minutes, 0, 0);
      
      // Format as datetime-local string
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      
      const isoString = `${year}-${month}-${day}T${hour}:${minute}`;
      console.log('Time selected:', timeValue, 'Final value:', isoString);
      onChange(isoString);
    }
  };

  const selectedDateLabel = useMemo(() => {
    const option = dateOptions.find(opt => opt.value === selectedDate);
    return option ? `${option.label} (${option.displayDate})` : 'Select Date';
  }, [dateOptions, selectedDate]);

  const selectedTimeLabel = useMemo(() => {
    const option = timeOptions.find(opt => opt.value === selectedTime);
    return option ? option.label : 'Select Time';
  }, [timeOptions, selectedTime]);

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Date Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowDateDropdown(!showDateDropdown);
              setShowTimeDropdown(false);
            }}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
          >
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <span className={`text-sm md:text-base ${selectedDate ? 'text-gray-900' : 'text-gray-500'}`}>
                {selectedDateLabel}
              </span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showDateDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
              {dateOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleDateSelect(option.value)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                    selectedDate === option.value ? 'bg-teal-50 text-teal-900' : 'text-gray-900'
                  }`}
                >
                  <div className="font-medium text-sm md:text-base">{option.label}</div>
                  <div className="text-xs md:text-sm text-gray-500">{option.displayDate}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Time Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (!selectedDate) {
                return;
              }
              setShowTimeDropdown(!showTimeDropdown);
              setShowDateDropdown(false);
            }}
            disabled={!selectedDate}
            className={`w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 ${
              !selectedDate ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <span className={`text-sm md:text-base ${selectedTime ? 'text-gray-900' : 'text-gray-500'}`}>
                {selectedDate ? selectedTimeLabel : 'Select date first'}
              </span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showTimeDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showTimeDropdown && selectedDate && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleTimeSelect(option.value)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-sm md:text-base ${
                    selectedTime === option.value ? 'bg-teal-50 text-teal-900' : 'text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Selected Schedule Summary */}
      {selectedDate && selectedTime && (
        <div className="mt-3 p-3 bg-teal-50 rounded-md border border-teal-200">
          <div className="flex items-center text-teal-800">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              Scheduled for {selectedDateLabel.split(' (')[0]} at {selectedTimeLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSelector;