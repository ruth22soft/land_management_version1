
import crypto from 'crypto';
import QRCode from 'qrcode';

/**
 * Generate a unique registration number
 */
export const generateRegistrationNumber = () => {
  return `REG-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

/**
 * Generate a unique certificate number
 */
export const generateCertificateNumber = () => {
  return `CERT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

/**
 * Generate a QR code
 * @param {string} data - The data to encode in the QR code
 * @returns {Promise<string>} - A promise that resolves to the QR code as a data URL
 */
export const generateQRCode = async (data) => {
  try {
    return await QRCode.toDataURL(data);
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};