import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Building2 } from "lucide-react";

interface VirtualAccountDisplayProps {
  paymentData: {
    va_number?: string;
    bank_type?: string;
    total_amount: number;
    expiry_time?: string;
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

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function VirtualAccountDisplay({
  paymentData,
  onCopy,
}: VirtualAccountDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Virtual Account Payment</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">Bank:</span>
              <span className="font-mono font-semibold text-blue-900">
                {paymentData.bank_type?.toUpperCase() || "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">
                Virtual Account:
              </span>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-semibold text-blue-900">
                  {paymentData.va_number || "N/A"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onCopy(paymentData.va_number || "", "VA Number")
                  }
                  disabled={!paymentData.va_number}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">Amount:</span>
              <span className="font-semibold text-blue-900">
                {formatCurrency(paymentData.total_amount)}
              </span>
            </div>

            {paymentData.expiry_time && (
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">Expires:</span>
                <span className="font-semibold text-blue-900">
                  {formatDateTime(paymentData.expiry_time)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium text-gray-800">Payment Instructions:</p>
          <p>
            1. Open your {paymentData.bank_type?.toUpperCase()} mobile banking
            app
          </p>
          <p>2. Select "Transfer" or "Bayar"</p>
          <p>3. Enter the Virtual Account number above</p>
          <p>
            4. Enter the exact amount:{" "}
            {formatCurrency(paymentData.total_amount)}
          </p>
          <p>5. Complete the payment</p>
        </div>
      </CardContent>
    </Card>
  );
}
