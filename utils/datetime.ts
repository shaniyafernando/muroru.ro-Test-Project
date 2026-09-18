import dayjs from 'dayjs'

export function parseTimeAgo(timeAgoStr: string) {
  const now = dayjs();
  const lowerStr = timeAgoStr.toLowerCase();
  
  const numberMatch = lowerStr.match(/\d+/);
  if (!numberMatch) return null;
  const value = parseInt(numberMatch[0], 10);

  if (lowerStr.includes('minute')) {
    return now.subtract(value, 'minute');
  } else if (lowerStr.includes('hour')) {
    return now.subtract(value, 'hour');
  } else if (lowerStr.includes('day')) {
    return now.subtract(value, 'day');
  } else if (lowerStr.includes('week')) {
    return now.subtract(value, 'week');
  } else if (lowerStr.includes('month')) {
    return now.subtract(value, 'month');
  } else if (lowerStr.includes('year')) {
    return now.subtract(value, 'year');
  }
  
  return null;
}