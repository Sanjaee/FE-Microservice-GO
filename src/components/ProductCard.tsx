import React from "react";
import { Product } from "@/lib/api-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

export function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  onAddToWishlist,
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getMainImage = () => {
    if (product.images && product.images.length > 0) {
      return product.images[0].image_url;
    }
    return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop&crop=center"; // Fallback image
  };

  return (
    <Card className="group hover:shadow-lg p-0 gap-0 transition-all duration-300 hover:-translate-y-1">
      <Link href={`/${product.id}`} className="block">
        <CardHeader className="p-0 gap-0">
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <Image
              src={getMainImage()}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-2 left-2">
              {!product.is_active && (
                <Badge variant="destructive" className="text-xs">
                  Out of Stock
                </Badge>
              )}
              {product.stock < 10 && product.stock > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Limited Stock
                </Badge>
              )}
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 rounded-full"
                onClick={(e) => {
                  e.preventDefault();
                  onAddToWishlist?.(product);
                }}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Link>

      <CardContent className="p-4">
        <div className="space-y-3">
          <Link href={`/${product.id}`} className="block">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {product.description}
              </p>
            </div>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-green-600">
                {formatPrice(product.price)}
              </p>
              <p className="text-xs text-gray-500">
                Stock: {product.stock} items
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/${product.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </Link>
            <Button
              size="sm"
              className="flex-1"
              disabled={!product.is_active || product.stock === 0}
              onClick={() => onAddToCart?.(product)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            <p>Seller: {product.user.username}</p>
            <p>Added: {new Date(product.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
