import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import {
  Loader2,
  CreditCard,
  Smartphone,
  QrCode,
  Building2,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_active: boolean;
  images: Array<{
    id: string;
    image_url: string;
  }>;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

interface PaymentMethod {
  value: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    icon: <Building2 className="h-5 w-5" />,
    description: "Transfer via Virtual Account",
  },
  {
    value: "credit_card",
    label: "Credit Card",
    icon: <CreditCard className="h-5 w-5" />,
    description: "Visa, Mastercard, JCB",
  },
  {
    value: "gopay",
    label: "GoPay",
    icon: <Smartphone className="h-5 w-5" />,
    description: "GoPay Wallet",
  },
  {
    value: "qris",
    label: "QRIS",
    icon: <QrCode className="h-5 w-5" />,
    description: "Scan QR Code",
  },
  {
    value: "echannel",
    label: "Mandiri E-Channel",
    icon: <Building2 className="h-5 w-5" />,
    description: "ATM Mandiri",
  },
  {
    value: "permata",
    label: "Permata VA",
    icon: <Building2 className="h-5 w-5" />,
    description: "Virtual Account Permata",
  },
  {
    value: "cstore",
    label: "Convenience Store",
    icon: <Building2 className="h-5 w-5" />,
    description: "Alfamart & Indomaret",
  },
];

const bankTypes = [
  { value: "bca", label: "BCA" },
  { value: "bni", label: "BNI" },
  { value: "bri", label: "BRI" },
  { value: "mandiri", label: "Mandiri" },
  { value: "permata", label: "Permata" },
  { value: "cimb", label: "CIMB" },
];

const storeTypes = [
  { value: "alfamart", label: "Alfamart" },
  { value: "indomaret", label: "Indomaret" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const { id } = router.query;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("bank_transfer");
  const [selectedBankType, setSelectedBankType] = useState<string>("bni");
  const [selectedStoreType, setSelectedStoreType] =
    useState<string>("alfamart");
  const [notes, setNotes] = useState<string>("");
  const [adminFee, setAdminFee] = useState<number>(2500);

  useEffect(() => {
    if (id && status !== "loading") {
      fetchProduct();
    }
  }, [id, status]);

  const fetchProduct = async () => {
    try {
      // Set access token for API client
      if (session?.accessToken) {
        apiClient.setAccessToken(session.accessToken);
      }

      const response = await apiClient.getProductById(id as string);
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to fetch product details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!product || !session) {
      toast({
        title: "Error",
        description: "Please login to continue",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Ensure access token is set
      if (session.accessToken) {
        apiClient.setAccessToken(session.accessToken);
      }

      const paymentData = {
        product_id: product.id,
        amount: Math.round(product.price), // Amount in rupiah
        admin_fee: Math.round(adminFee), // Admin fee in rupiah
        payment_method: selectedPaymentMethod,
        bank_type:
          selectedPaymentMethod === "bank_transfer"
            ? selectedBankType
            : undefined,
        store_type:
          selectedPaymentMethod === "cstore" ? selectedStoreType : undefined,
        notes: notes || undefined,
      };

      const response = await apiClient.createPayment(paymentData);

      const payment = response.data;

      // Redirect to payment page
      router.push(`/payment/${payment.payment_id}`);
    } catch (error: any) {
      console.error("Error creating payment:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Handle 505 and 500 error specifically - don't redirect to payment page
      const errorMessage = error.message || error.response?.data?.message || "";
      const errorDetails = error.response?.data?.details || "";

      if (
        error.response?.status === 505 ||
        error.response?.status === 500 ||
        error.response?.status === 503 ||
        errorMessage.includes("temporarily unavailable") ||
        errorMessage.includes("maintenance") ||
        errorMessage.includes("Unable to create va_number") ||
        errorMessage.includes("system is recovering") ||
        errorDetails.includes("505") ||
        errorDetails.includes("500") ||
        errorDetails.includes("Unable to create va_number") ||
        errorDetails.includes("system is recovering")
      ) {
        toast({
          title: "Metode Pembayaran Sedang Maintenance",
          description: errorMessage.includes("maintenance")
            ? errorMessage
            : "Metode pembayaran sedang maintenance, silakan pilih metode lain (BNI, BCA, BRI, Mandiri, GoPay, QRIS, atau Credit Card)",
          variant: "destructive",
        });
        // Don't redirect to payment page for 505 errors
        return;
      } else {
        toast({
          title: "Error",
          description:
            errorMessage ||
            error.response?.data?.error ||
            "Failed to create payment",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
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
                Please login to continue with your purchase
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

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The product you're looking for doesn't exist
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

  const totalAmount = product.price + adminFee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                {product.images && product.images.length > 0 && (
                  <img
                    src={product.images[0].image_url}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge
                      variant={product.is_active ? "default" : "secondary"}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">Stock: {product.stock}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Product Price</span>
                  <span>Rp {product.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Admin Fee</span>
                  <span>Rp {adminFee.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>Rp {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label>Select Payment Method</Label>
                <div className="grid grid-cols-1 gap-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.value
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.value)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-primary">{method.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium">{method.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {method.description}
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            selectedPaymentMethod === method.value
                              ? "border-primary bg-primary"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank Selection for Bank Transfer */}
              {selectedPaymentMethod === "bank_transfer" && (
                <div className="space-y-2">
                  <Label htmlFor="bank-type">Select Bank</Label>
                  <Select
                    value={selectedBankType}
                    onValueChange={setSelectedBankType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankTypes.map((bank) => (
                        <SelectItem key={bank.value} value={bank.value}>
                          {bank.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Store Selection for Cstore */}
              {selectedPaymentMethod === "cstore" && (
                <div className="space-y-2">
                  <Label htmlFor="store-type">Select Store</Label>
                  <Select
                    value={selectedStoreType}
                    onValueChange={setSelectedStoreType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {storeTypes.map((store) => (
                        <SelectItem key={store.value} value={store.value}>
                          {store.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any special instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={
                  submitting || !product.is_active || product.stock <= 0
                }
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay Rp ${totalAmount.toLocaleString()}`
                )}
              </Button>

              {(!product.is_active || product.stock <= 0) && (
                <p className="text-sm text-destructive text-center">
                  {!product.is_active
                    ? "This product is not available"
                    : "This product is out of stock"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
