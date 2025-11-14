"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

export default function OrderConfirmation() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId') ?? '';

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `order-${orderId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">Your order has been confirmed</p>
        </div>

        {/* Order ID */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Order ID</p>
          <p className="text-2xl font-bold text-blue-600 font-mono">{orderId}</p>
        </div>

        {/* QR Code */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-600 mb-4 font-semibold">
            Show this QR code to the vendor when picking up your order
          </p>
          <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
            <QRCodeSVG
              id="qr-code"
              value={orderId}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <button
            onClick={handleDownloadQR}
            className="mt-4 flex items-center gap-2 mx-auto text-blue-600 hover:text-blue-800 font-semibold"
          >
            <Download size={18} />
            Download QR Code
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
          <p className="text-sm text-yellow-800">
            <strong>📋 Next Steps:</strong>
          </p>
          <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
            <li>Wait for order preparation notification</li>
            <li>Go to the vendor counter</li>
            <li>Show this QR code for verification</li>
            <li>Collect your order</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/employee/home"
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Continue Shopping
          </Link>
          <Link
            href="/employee/history"
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}