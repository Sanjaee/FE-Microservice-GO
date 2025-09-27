import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Truck, Shield, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiClient, Product } from "@/lib/api-client";

export default function HomePage() {
  const { data: session } = useSession();

  // State management for products
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);

      const response = await apiClient.getProducts({
        page,
        limit: 100,
        is_active: true,
      });

      if (response.success) {
        const data = response.data;
        if (append) {
          setProducts((prev) => [...prev, ...data.products]);
        } else {
          setProducts(data.products);
        }
        setHasMore(data.has_more);
        setTotal(data.total);
        setCurrentPage(page);
      } else {
        throw new Error("Failed to fetch products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      if (!append) {
        setLoading(false);
      }
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      await fetchProducts(currentPage + 1, true);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const refresh = () => {
    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchProducts(1, false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        hasMore &&
        !isLoadingMore &&
        !loading
      ) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingMore, loading, currentPage]);

  // Product handlers
  const handleViewDetails = (product: Product) => {
    // TODO: Navigate to product detail page
    console.log("View details for product:", product.id);
  };

  const handleAddToCart = (product: Product) => {
    // TODO: Add to cart functionality
    console.log("Add to cart:", product.id);
  };

  const handleAddToWishlist = (product: Product) => {
    // TODO: Add to wishlist functionality
    console.log("Add to wishlist:", product.id);
  };

  // Show loading skeleton for initial load
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="bg-white rounded-lg shadow-md p-4 animate-pulse"
                >
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="text-center mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-red-600">Error loading products: {error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {products.length > 0 && (
            <>
              <div className="mb-6 text-center">
                <Badge variant="secondary" className="text-sm">
                  {total} products available
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={handleViewDetails}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                ))}
                {isLoadingMore &&
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={`skeleton-${idx}`}
                      className="bg-white rounded-lg shadow-md p-4 animate-pulse"
                    >
                      <div className="h-48 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
              </div>

              {/* End of results */}
              {!hasMore && products.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    You've reached the end of the products list
                  </p>
                </div>
              )}
            </>
          )}

          {!loading && products.length === 0 && !error && (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-500">
                Check back later for new arrivals!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
