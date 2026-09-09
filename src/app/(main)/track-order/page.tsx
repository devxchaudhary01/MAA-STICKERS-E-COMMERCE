"use client";
import { useState } from "react";
import { Search, Package, Truck, CheckCircle, Clock } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

const STATUS_STEPS = [
  { key: "confirmed", label: "Order Confirmed", icon: CheckCircle, color: "text-green-500" },
  { key: "processing", label: "Processing", icon: Clock, color: "text-blue-500" },
  { key: "shipped", label: "Shipped", icon: Truck, color: "text-brand-500" },
  { key: "delivered", label: "Delivered", icon: Package, color: "text-green-600" },
];

export default function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    if (!query.trim() && !email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("orderNumber", query.trim());
      if (email.trim()) params.set("email", email.trim());
      const res = await fetch(`/api/orders?${params}`);
      if (!res.ok) { setError("Order not found. Please check your details."); setOrder(null); return; }
      setOrder(await res.json());
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? STATUS_STEPS.findIndex((s) => s.key === (order.status as string)) : -1;

  return (
    <div className="min-h-screen bg-cream-50 py-14">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-brand-500" />
          </div>
          <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">Track Your Order</h1>
          <p className="text-gray-500">Enter your order number or email address to check the status</p>
        </div>

        <div className="card p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Number</label>
              <input
                type="text"
                placeholder="e.g. MS-ABC123-XYZ"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                className="input"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                className="input"
              />
            </div>
            <Button size="lg" className="w-full rounded-2xl" onClick={handleTrack} loading={loading}>
              <Search className="w-5 h-5" /> Track Order
            </Button>
          </div>
          {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
        </div>

        {order && (
          <div className="card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Order Number</p>
                <p className="font-bold text-gray-800 text-lg">{order.orderNumber as string}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                order.status === "delivered" ? "bg-green-100 text-green-700" :
                order.status === "shipped" ? "bg-brand-100 text-brand-700" :
                "bg-blue-100 text-blue-700"
              }`}>
                {String(order.status).charAt(0).toUpperCase() + String(order.status).slice(1)}
              </span>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all ${
                      i <= currentStep ? "bg-brand-500 text-white" : "bg-gray-200 text-gray-400"
                    }`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs text-center hidden sm:block ${i <= currentStep ? "text-brand-600 font-medium" : "text-gray-400"}`}>
                      {step.label}
                    </span>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`absolute h-0.5 w-full ${i < currentStep ? "bg-brand-500" : "bg-gray-200"}`} style={{ top: "16px", left: "50%", width: "calc(100% - 32px)" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order items */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Items Ordered</p>
              <div className="space-y-2">
                {(order.items as Array<{productName: string; quantity: number; price: number; variantInfo?: string}>).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{item.productName}</p>
                      {item.variantInfo && <p className="text-xs text-gray-500">{item.variantInfo}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">× {item.quantity}</p>
                      <p className="font-semibold text-brand-600">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
              <span>Total Paid</span>
              <span className="text-brand-600">{formatPrice(order.total as number)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
