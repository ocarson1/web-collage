export const formatTimestamp = () => {
    const date = new Date();
    
    // Pad single-digit numbers with a leading zero
    const pad = (num) => num.toString().padStart(2, '0');
    
    // Get date components
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Months are 0-indexed
    const year = date.getFullYear();
    
    // Get time components
    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = pad(hours);
    
    // Construct the timestamp string
    return `Web Collage ${day}/${month}/${year} ${formattedHours}:${minutes}${ampm}`;
  };