import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageSlider } from "@/components/ui/ImageSlider";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { apiClient, Product } from "@/lib/api-client";
import Link from "next/link";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  useEffect(() => {
    if (id && typeof id === "string") {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getProductById(productId);

      if (response.success) {
        setProduct(response.data);
      } else {
        throw new Error("Failed to fetch product");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    // TODO: Implement add to cart functionality
    console.log("Add to cart:", {
      productId: product.id,
      quantity,
      selectedSize,
    });
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    // TODO: Implement add to wishlist functionality
    console.log("Add to wishlist:", product.id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading product details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-6xl mb-4">😞</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Product Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                {error || "The product you're looking for doesn't exist."}
              </p>
              <div className="space-x-4">
                <Button onClick={() => router.back()} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button onClick={() => router.push("/")}>
                  Browse Products
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare images for slider
  const sliderImages = product.images.map((img) => ({
    id: img.id,
    imageUrl: img.image_url,
    altText: `${product.name} - Image ${product.images.indexOf(img) + 1}`,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <ImageSlider
              images={sliderImages}
              className="w-full"
              height="500px"
              showThumbnails={true}
              showFullscreen={true}
              autoPlay={false}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                  {product.is_active ? "Available" : "Out of Stock"}
                </Badge>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddToWishlist}
                    className="p-2"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="p-2"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">(4.8)</span>
                </div>
                <span className="text-sm text-gray-500">
                  Sold by {product.user.username}
                </span>
              </div>

              <div className="text-3xl font-bold text-blue-600 mb-4">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* Product Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>

            {/* Stock & Seller Info */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {product.stock}
                    </div>
                    <div className="text-sm text-gray-600">In Stock</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {product.user.username}
                    </div>
                    <div className="text-xs text-gray-600">Seller</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                disabled={!product.is_active || product.stock === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>

              <Button
                variant="outline"
                className="w-full"
                disabled={!product.is_active || product.stock === 0}
              >
                Buy Now
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Truck className="h-4 w-4 text-green-600" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>1 year warranty included</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <RotateCcw className="h-4 w-4 text-orange-600" />
                <span>30-day return policy</span>
              </div>
            </div>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product ID:</span>
                  <span className="font-mono text-sm">{product.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Added:</span>
                  <span>{formatDate(product.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span>{formatDate(product.updated_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
