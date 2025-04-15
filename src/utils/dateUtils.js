// src/utils/dateUtils.js

/**
 * Parses a date string in the format "MM.DD.YYYY, HH:MM AM/PM"
 * and returns a JavaScript Date object.
 * 
 * @param {string} dateString - The formatted date string.
 * @returns {Date} - A JavaScript Date object.
 */
export function parseCustomDateString(dateString) {
    try {
      const [datePart, timePart] = dateString.split(', ');
      if (!datePart || !timePart) return dateString;
  
      const [month, day, year] = datePart.split('.');
      if (!month || !day || !year) return dateString;
  
      const dateTimeString = `${year}-${month}-${day} ${timePart}`;
      const parsedDate = new Date(dateTimeString);
  
      // Check if the resulting Date is valid
      if (isNaN(parsedDate.getTime())) {
        return dateString;
      }
  
      return parsedDate;
    } catch (e) {
      return dateString;
    }
  }
  /**
   * Formats a Date object into a string like "Tuesday, April 15th"
   * 
   * @param {Date} date - The Date object to format.
   * @returns {string} - The formatted date string.
   */
  export function formatDayDate(date) {
    try {
        const options = {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          };
          const formatted = new Intl.DateTimeFormat('en-US', options).format(date);
          const dayNum = date.getDate();
          const suffix =
            dayNum % 10 === 1 && dayNum !== 11 ? 'st' :
            dayNum % 10 === 2 && dayNum !== 12 ? 'nd' :
            dayNum % 10 === 3 && dayNum !== 13 ? 'rd' : 'th';
        
          const dateWithSuffix = formatted.replace(/\d+/, `${dayNum}${suffix}`);
          return `${dateWithSuffix}`;
} catch (e) {
    return date;
  }
    
    
  }
  
  /**
   * Formats a Date object into a string like "5:01 pm"
   * 
   * @param {Date} date - The Date object to format.
   * @returns {string} - The formatted time string.
   */
  export function formatTime(date) {
    try {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
} catch (e) {
    return "";
  }
  }