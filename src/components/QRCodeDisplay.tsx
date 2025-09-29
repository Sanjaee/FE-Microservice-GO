import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, ExternalLink, Copy } from "lucide-react";

interface QRCodeDisplayProps {
  paymentData: {
    snap_redirect_url?: string;
    total_amount: number;
    payment_method: string;
    product_id?: string;
  };
  onCopy: (text: string, label: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function QRCodeDisplay({
  paymentData,
  onCopy,
}: QRCodeDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>
            {paymentData.payment_method === "gopay" ? "GoPay" : "QRIS"} Payment
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product ID Display */}
        {paymentData.product_id && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                <strong>Product ID:</strong> {paymentData.product_id}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy(paymentData.product_id!, "Product ID")}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-center space-y-3">
            <div className="text-green-700">
              <p className="font-medium">
                Amount: {formatCurrency(paymentData.total_amount)}
              </p>
              <p className="text-sm">
                {paymentData.payment_method === "gopay"
                  ? "Complete payment through GoPay app"
                  : "Scan QR code with your mobile banking app"}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        {paymentData.snap_redirect_url ? (
          <div className="text-center">
            <div className="inline-block bg-white border-2 border-gray-200 rounded-lg p-4">
              <img
                src={paymentData.snap_redirect_url}
                alt="QR Code for Payment"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Scan this QR code with your{" "}
              {paymentData.payment_method === "gopay"
                ? "GoPay"
                : "mobile banking"}{" "}
              app
            </p>
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">QR Code not available</p>
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium text-gray-800">Payment Instructions:</p>
          {paymentData.payment_method === "gopay" ? (
            <>
              <p>1. Click "Open GoPay" button above</p>
              <p>2. Complete payment in GoPay app</p>
              <p>3. Wait for payment confirmation</p>
            </>
          ) : (
            <>
              <p>1. Click "View QR Code" button above</p>
              <p>2. Scan QR code with your mobile banking app</p>
              <p>3. Complete the payment</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
