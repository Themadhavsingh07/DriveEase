import crypto from 'crypto';

export const generateBookingNumber = (): string => {
  const currentYear = new Date().getFullYear();
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `DE-${currentYear}-${randomChars}`;
};
