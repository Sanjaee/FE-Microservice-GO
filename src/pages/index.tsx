import React from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Truck, Shield, Heart } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to ZACloth
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover the latest fashion trends and style your perfect look
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ZACloth?
            </h2>
            <p className="text-lg text-gray-600">
              We provide the best shopping experience with quality products and
              excellent service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Wide Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Thousands of products from top brands to choose from
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Quick and reliable shipping to your doorstep
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Secure Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Safe and secure payment methods for your peace of mind
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-lg">Customer Care</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  24/7 customer support to help you with any questions
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers and discover your new favorite
            style
          </p>
          {!session ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                asChild
              >
                <Link href="/register">Create Account</Link>
              </Button>
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
              asChild
            >
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
