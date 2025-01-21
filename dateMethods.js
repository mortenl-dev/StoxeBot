function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  function getCurrentAndPreviousMonthDates() { 
    const currentDate = new Date();
    const oneMonthAgoDate = new Date();
    
    // Set the date to one month ago
    oneMonthAgoDate.setMonth(oneMonthAgoDate.getMonth() - 1);
  
    return {
        current: getFormattedDate(currentDate),
        oneMonthAgo: getFormattedDate(oneMonthAgoDate),
    };
  }
module.exports = {getCurrentAndPreviousMonthDates};