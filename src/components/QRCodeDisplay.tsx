import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, ExternalLink } from "lucide-react";

interface QRCodeDisplayProps {
  paymentData: {
    snap_redirect_url?: string;
    total_amount: number;
    payment_method: string;
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

        {paymentData.snap_redirect_url && (
          <Button
            onClick={() => window.open(paymentData.snap_redirect_url, "_blank")}
            className="w-full"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {paymentData.payment_method === "gopay"
              ? "Open GoPay"
              : "View QR Code"}
          </Button>
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
