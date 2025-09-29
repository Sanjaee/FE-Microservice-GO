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
import VirtualAccountDisplay from "@/components/VirtualAccountDisplay";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import CstoreDisplay from "@/components/CstoreDisplay";
import ProgressIndicator from "@/components/ProgressIndicator";
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
  ArrowLeft,
  Truck,
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
  store_type?: string;
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
  echannel: <Building2 className="h-5 w-5" />,
  permata: <Building2 className="h-5 w-5" />,
  cstore: <Building2 className="h-5 w-5" />,
};

export default function PaymentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const { id } = router.query;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

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
      console.log(response.data);
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

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text, label);
  };

  const fetchPaymentStatus = async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
    } else {
      setIsPolling(true);
    }

    await fetchPayment();

    if (isManual) {
      setRefreshing(false);
    } else {
      setIsPolling(false);
    }
  };

  const isPaymentSuccessful = (status: string) => {
    return status === "SUCCESS";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "EXPIRED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="h-3 w-3" />;
      case "PENDING":
        return <Clock className="h-3 w-3" />;
      case "FAILED":
      case "CANCELLED":
        return <XCircle className="h-3 w-3" />;
      case "EXPIRED":
        return <Clock className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatRupiahWithSymbol = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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

      case "echannel":
        return (
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">
                Mandiri E-Channel Payment
              </h3>
              <p className="text-red-700">
                Please complete the payment through Mandiri ATM or Internet
                Banking
              </p>
            </div>
            {payment.snap_redirect_url && (
              <Button
                onClick={() => window.open(payment.snap_redirect_url, "_blank")}
                className="w-full"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Payment Instructions
              </Button>
            )}
          </div>
        );

      case "permata":
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">
                Permata Virtual Account
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-purple-700">Bank:</span>
                  <span className="font-mono font-semibold">PERMATA</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-700">Virtual Account:</span>
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
                  <span className="text-purple-700">Amount:</span>
                  <span className="font-semibold">
                    {formatCurrency(payment.total_amount)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>1. Open your Permata mobile banking app</p>
              <p>2. Select "Transfer" or "Bayar"</p>
              <p>3. Enter the Virtual Account number above</p>
              <p>4. Enter the exact amount</p>
              <p>5. Complete the payment</p>
            </div>
          </div>
        );

      case "cstore":
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">
                Convenience Store Payment
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-orange-700">Store:</span>
                  <span className="font-semibold capitalize">
                    {payment.store_type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-700">Payment Code:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-semibold">
                      {payment.payment_code}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(
                          payment.payment_code || "",
                          "Payment Code"
                        )
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-700">Amount:</span>
                  <span className="font-semibold">
                    {formatCurrency(payment.total_amount)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>1. Go to the nearest {payment.store_type} store</p>
              <p>2. Tell the cashier you want to pay online</p>
              <p>3. Show the payment code above</p>
              <p>4. Pay the exact amount</p>
              <p>5. Keep the receipt as proof of payment</p>
            </div>
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

  // Progress steps
  const steps = [
    {
      id: "payment",
      title: "Payment",
      completed: payment.status === "SUCCESS",
      current: payment.status === "PENDING",
    },
    {
      id: "processing",
      title: "Processing",
      completed: payment.status === "SUCCESS",
      current: payment.status === "PENDING",
    },
    {
      id: "completed",
      title: "Completed",
      completed: payment.status === "SUCCESS",
      current: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator steps={steps} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Left Side - Payment Information */}
          <div className="space-y-6">
            {/* Payment Method Display */}
            {payment.payment_method === "bank_transfer" && (
              <VirtualAccountDisplay
                paymentData={{
                  va_number: payment.va_number,
                  bank_type: payment.bank_type,
                  total_amount: payment.total_amount,
                  expiry_time: payment.expiry_time,
                }}
                onCopy={handleCopy}
              />
            )}

            {(payment.payment_method === "gopay" ||
              payment.payment_method === "qris") && (
              <QRCodeDisplay
                paymentData={{
                  snap_redirect_url: payment.snap_redirect_url,
                  total_amount: payment.total_amount,
                  payment_method: payment.payment_method,
                }}
                onCopy={handleCopy}
              />
            )}

            {payment.payment_method === "cstore" && (
              <CstoreDisplay
                paymentData={{
                  payment_code: payment.payment_code,
                  store_type: payment.store_type,
                  total_amount: payment.total_amount,
                  expiry_time: payment.expiry_time,
                }}
                onCopy={handleCopy}
              />
            )}

            {payment.payment_method === "credit_card" && (
              <Card>
                <CardHeader>
                  <CardTitle>Credit Card Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Please complete your credit card payment using the provided
                    link.
                  </p>
                  {payment.actions && payment.actions.length > 0 && (
                    <div className="mt-4">
                      {payment.actions.map((action: any, index: number) => (
                        <Button
                          key={index}
                          onClick={() => window.open(action.url, "_blank")}
                          className="w-full mb-2"
                        >
                          {action.name.replace(/-/g, " ").toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Order ID</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">
                      {payment.order_id}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(payment.order_id, "Order ID")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Product Price</span>
                    <span>{formatRupiahWithSymbol(payment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admin Fee</span>
                    <span>{formatRupiahWithSymbol(payment.admin_fee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span>{formatRupiahWithSymbol(payment.total_amount)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Payment Method</span>
                    <div className="flex items-center space-x-2">
                      {payment.payment_method === "bank_transfer" && (
                        <>
                          {payment.bank_type === "bca" && (
                            <img
                              src="/bca_va.png"
                              alt="BCA"
                              className="w-6 h-6 object-contain"
                            />
                          )}
                          {payment.bank_type === "permata" && (
                            <img
                              src="/permata_va.svg"
                              alt="Permata"
                              className="w-6 h-6 object-contain"
                            />
                          )}
                          {payment.bank_type === "bri" && (
                            <img
                              src="/bri_va.png"
                              alt="BRI"
                              className="w-6 h-6 object-contain"
                            />
                          )}
                          {payment.bank_type === "bni" && (
                            <img
                              src="/bni_va.png"
                              alt="BNI"
                              className="w-6 h-6 object-contain"
                            />
                          )}
                        </>
                      )}
                      {(payment.payment_method === "gopay" ||
                        payment.payment_method === "qris") && (
                        <img
                          src="/qris.png"
                          alt="QRIS"
                          className="w-6 h-6 object-contain"
                        />
                      )}
                      {payment.payment_method === "cstore" && (
                        <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-600">
                            🏪
                          </span>
                        </div>
                      )}
                      <span className="capitalize">
                        {payment.payment_method === "bank_transfer"
                          ? `${payment.bank_type?.toUpperCase()} Virtual Account`
                          : payment.payment_method?.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge className={getStatusColor(payment.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(payment.status)}
                        <span>{payment.status?.toUpperCase()}</span>
                        {isPolling && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current ml-1"></div>
                        )}
                      </div>
                    </Badge>
                  </div>
                  {isPolling && (
                    <div className="text-center text-xs text-gray-500">
                      <span>
                        Auto-checking status... (will stop automatically)
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isPaymentSuccessful(payment.status) && (
                <Button
                  onClick={() => fetchPaymentStatus(true)}
                  variant="outline"
                  className="w-full"
                  disabled={isPolling}
                >
                  {isPolling ? "Checking..." : "Refresh Status"}
                </Button>
              )}

              {isPaymentSuccessful(payment.status) && (
                <>
                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="w-full"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                  <Button
                    onClick={() => router.push("/")}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Home
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
