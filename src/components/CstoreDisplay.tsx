import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Building2 } from "lucide-react";

interface CstoreDisplayProps {
  paymentData: {
    payment_code?: string;
    store_type?: string;
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

export default function CstoreDisplay({
  paymentData,
  onCopy,
}: CstoreDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Convenience Store Payment</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-orange-700 font-medium">Store:</span>
              <span className="font-semibold text-orange-900 capitalize">
                {paymentData.store_type || "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-orange-700 font-medium">Payment Code:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-semibold text-orange-900">
                  {paymentData.payment_code || "N/A"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onCopy(paymentData.payment_code || "", "Payment Code")
                  }
                  disabled={!paymentData.payment_code}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-orange-700 font-medium">Amount:</span>
              <span className="font-semibold text-orange-900">
                {formatCurrency(paymentData.total_amount)}
              </span>
            </div>

            {paymentData.expiry_time && (
              <div className="flex items-center justify-between">
                <span className="text-orange-700 font-medium">Expires:</span>
                <span className="font-semibold text-orange-900">
                  {formatDateTime(paymentData.expiry_time)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium text-gray-800">Payment Instructions:</p>
          <p>1. Go to the nearest {paymentData.store_type} store</p>
          <p>2. Tell the cashier you want to pay online</p>
          <p>3. Show the payment code above</p>
          <p>
            4. Pay the exact amount: {formatCurrency(paymentData.total_amount)}
          </p>
          <p>5. Keep the receipt as proof of payment</p>
        </div>
      </CardContent>
    </Card>
  );
}
