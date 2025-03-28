import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';

// For React components that need the QR code as a component
export const QRCodeComponent = ({ data }) => {
    return (
        <QRCodeSVG
            value={typeof data === 'string' ? data : JSON.stringify(data)}
            size={128}
            level="H"
            includeMargin={true}
            imageSettings={{
                src: "/logo.png",
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
            }}
        />
    );
};

// For non-React contexts that need the QR code as a data URL
export const generateQRCodeDataURL = async (data) => {
    try {
        const qrData = typeof data === 'string' ? data : JSON.stringify(data);
        const dataUrl = await QRCode.toDataURL(qrData, {
            width: 128,
            margin: 2,
            errorCorrectionLevel: 'H',
        });
        return dataUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        return null;
    }
};

export const generateVerificationURL = (certificateId) => {
    // Use a constant base URL for production, or window.location.origin for development
    const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://lrms.gov.et' 
        : window.location.origin;
    return `${baseUrl}/verify-certificate/${certificateId}`;
};
