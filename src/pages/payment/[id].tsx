import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  ExternalLink,
  CreditCard,
  Building2,
  Smartphone,
  QrCode,
  RefreshCw,
} from "lucide-react";

interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  product_id: string;
  amount: number;
  admin_fee: number;
  total_amount: number;
  payment_method: string;
  payment_type: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "EXPIRED";
  notes?: string;
  snap_redirect_url?: string;
  midtrans_transaction_id?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_code?: string;
  va_number?: string;
  bank_type?: string;
  expiry_time?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    is_active: boolean;
  };
  actions?: Array<{
    name: string;
    method: string;
    url: string;
  }>;
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="h-4 w-4" />,
  },
  SUCCESS: {
    label: "Success",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  FAILED: {
    label: "Failed",
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="h-4 w-4" />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800",
    icon: <XCircle className="h-4 w-4" />,
  },
  EXPIRED: {
    label: "Expired",
    color: "bg-orange-100 text-orange-800",
    icon: <Clock className="h-4 w-4" />,
  },
};

const paymentMethodIcons = {
  credit_card: <CreditCard className="h-5 w-5" />,
  bank_transfer: <Building2 className="h-5 w-5" />,
  gopay: <Smartphone className="h-5 w-5" />,
  qris: <QrCode className="h-5 w-5" />,
  shopeepay: <Smartphone className="h-5 w-5" />,
};

export default function PaymentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const { id } = router.query;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id && status !== "loading") {
      fetchPayment();
    }
  }, [id, status]);

  const fetchPayment = async () => {
    try {
      // Set access token for API client
      if (session?.accessToken) {
        apiClient.setAccessToken(session.accessToken);
      }

      const response = await apiClient.getPayment(id as string);
      setPayment(response.data);
    } catch (error) {
      console.error("Error fetching payment:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payment details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshPayment = async () => {
    setRefreshing(true);
    await fetchPayment();
    setRefreshing(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

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

  const getPaymentInstructions = () => {
    if (!payment) return null;

    switch (payment.payment_method) {
      case "bank_transfer":
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                Virtual Account Payment
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Bank:</span>
                  <span className="font-mono font-semibold">
                    {payment.bank_type?.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Virtual Account:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-semibold">
                      {payment.va_number}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(payment.va_number || "", "VA Number")
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Amount:</span>
                  <span className="font-semibold">
                    {formatCurrency(payment.total_amount)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                1. Open your {payment.bank_type?.toUpperCase()} mobile banking
                app
              </p>
              <p>2. Select "Transfer" or "Bayar"</p>
              <p>3. Enter the Virtual Account number above</p>
              <p>4. Enter the exact amount</p>
              <p>5. Complete the payment</p>
            </div>
          </div>
        );

      case "gopay":
        return (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                GoPay Payment
              </h3>
              <p className="text-green-700">
                Please complete the payment through the GoPay app
              </p>
            </div>
            {payment.snap_redirect_url && (
              <Button
                onClick={() => window.open(payment.snap_redirect_url, "_blank")}
                className="w-full"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open GoPay
              </Button>
            )}
          </div>
        );

      case "qris":
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">
                QRIS Payment
              </h3>
              <p className="text-purple-700">
                Scan the QR code with your mobile banking app
              </p>
            </div>
            {payment.snap_redirect_url && (
              <Button
                onClick={() => window.open(payment.snap_redirect_url, "_blank")}
                className="w-full"
              >
                <QrCode className="mr-2 h-4 w-4" />
                View QR Code
              </Button>
            )}
          </div>
        );

      case "credit_card":
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                Credit Card Payment
              </h3>
              <p className="text-blue-700">
                Complete the payment through the secure payment page
              </p>
            </div>
            {payment.snap_redirect_url && (
              <Button
                onClick={() => window.open(payment.snap_redirect_url, "_blank")}
                className="w-full"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Complete Payment
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Login Required</h2>
              <p className="text-muted-foreground mb-6">
                Please login to view payment details
              </p>
              <Button onClick={() => router.push("/login")} className="w-full">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Payment Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The payment you're looking for doesn't exist
              </p>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[payment.status];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Payment Details</h1>
          <Button
            onClick={refreshPayment}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="space-y-6">
          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {statusInfo.icon}
                <span>Payment Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                <span className="text-sm text-muted-foreground">
                  Order ID: {payment.order_id}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {
                  paymentMethodIcons[
                    payment.payment_method as keyof typeof paymentMethodIcons
                  ]
                }
                <span>Payment Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Payment Method
                  </Label>
                  <p className="font-medium capitalize">
                    {payment.payment_method.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Total Amount
                  </Label>
                  <p className="font-medium text-lg">
                    {formatCurrency(payment.total_amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Created At
                  </Label>
                  <p className="font-medium">
                    {formatDateTime(payment.created_at)}
                  </p>
                </div>
                {payment.paid_at && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Paid At
                    </Label>
                    <p className="font-medium">
                      {formatDateTime(payment.paid_at)}
                    </p>
                  </div>
                )}
                {payment.expiry_time && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Expires At
                    </Label>
                    <p className="font-medium">
                      {formatDateTime(payment.expiry_time)}
                    </p>
                  </div>
                )}
              </div>

              {payment.notes && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Notes
                    </Label>
                    <p className="font-medium">{payment.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Product Information */}
          {payment.product && (
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold">{payment.product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {payment.product.description}
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">
                      {formatCurrency(payment.amount)}
                    </span>
                    <Badge
                      variant={
                        payment.product.is_active ? "default" : "secondary"
                      }
                    >
                      {payment.product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Instructions */}
          {payment.status === "PENDING" && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Instructions</CardTitle>
              </CardHeader>
              <CardContent>{getPaymentInstructions()}</CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex space-x-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="flex-1"
            >
              Back to Home
            </Button>
            {payment.status === "SUCCESS" && (
              <Button
                onClick={() => router.push("/dashboard")}
                className="flex-1"
              >
                View Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
