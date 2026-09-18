import crypto from 'crypto';

export const generateBookingReference = () => {
  const prefix = 'SC';
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${randomPart}-${timestamp}`;
};
