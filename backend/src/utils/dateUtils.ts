export const calculateRentalDays = (start: Date, end: Date): number => {
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return 0;
  // Calculate full 24-hour cycles, with ceil so any partial day counts as an extra day
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
};

export const hasDateOverlap = (
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean => {
  return startA < endB && endA > startB;
};

export const isValidDate = (d: any): boolean => {
  return d instanceof Date && !isNaN(d.getTime());
};
