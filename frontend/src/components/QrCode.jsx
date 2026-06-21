import { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

// Renders a real, scannable QR code for `text`.
export function QrCode({ text, size = 160, dark = '#0F172A', light = '#FFFFFF' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !text) return;
    QRCodeLib.toCanvas(canvasRef.current, text, {
      width: size,
      margin: 1,
      color: { dark, light },
      errorCorrectionLevel: 'M',
    }).catch(() => { /* ignore render errors */ });
  }, [text, size, dark, light]);

  return <canvas ref={canvasRef} width={size} height={size} style={{ borderRadius: 8, display: 'block' }} />;
}
