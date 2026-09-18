import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  try {
    const payload = typeof data === 'object' ? JSON.stringify(data) : String(data);
    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 280,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};
