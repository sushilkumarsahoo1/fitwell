// Date utilities
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

export const parseDate = (dateString: string): Date => {
  return new Date(dateString + "T00:00:00Z");
};

export const getDayOfWeek = (date: Date | string): number => {
  const d = new Date(date);
  return d.getDay();
};

export const getWeekStart = (date: Date | string): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const getMonthStart = (date: Date | string): Date => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

export const getMonthEnd = (date: Date | string): Date => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

export const daysAgo = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

export const isToday = (date: Date | string): boolean => {
  return formatDate(date) === formatDate(new Date());
};

export const isPastDate = (date: Date | string): boolean => {
  return new Date(date) < new Date(formatDate(new Date()));
};

export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};
