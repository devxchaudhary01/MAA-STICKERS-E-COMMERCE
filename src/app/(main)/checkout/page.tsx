"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle, Lock, ChevronDown, ChevronUp, ArrowLeft, Smartphone, CreditCard, Banknote, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI / Google Pay / PhonePe", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "cod", label: "Cash on Delivery", icon: Banknote },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [step, setStep] = useState<"address" | "payment" | "success">("address");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    line1: "", line2: "", city: "", state: "", pincode: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const sub = subtotal();
  const shipping = sub >= 499 ? 0 : 59;
  const total = sub + shipping;

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateAddress = () => {
    const errs: Partial<typeof form> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Valid email required";
    if (!form.phone.match(/^[6-9]\d{9}$/)) errs.phone = "Valid 10-digit mobile number required";
    if (!form.line1.trim()) errs.line1 = "Address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state) errs.state = "State is required";
    if (!form.pincode.match(/^\d{6}$/)) errs.pincode = "Valid 6-digit pincode required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddressNext = () => {
    if (validateAddress()) setStep("payment");
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: form.name,
          guestEmail: form.email,
          guestPhone: form.phone,
          shippingAddress: JSON.stringify({
            name: form.name, phone: form.phone,
            line1: form.line1, line2: form.line2,
            city: form.city, state: form.state, pincode: form.pincode,
          }),
          paymentMethod,
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.name,
            productImage: i.image,
            quantity: i.quantity,
            price: i.price,
            variantInfo: i.variantInfo,
            customization: i.customization,
            uploadedImage: i.uploadedImage,
          })),
          subtotal: sub,
          shippingCost: shipping,
          total,
        }),
      });

      if (!res.ok) throw new Error("Order failed");
      clearCart();
      setStep("success");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="w-14 h-14 text-brand-300 mb-4" strokeWidth={1.5} />
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
        <Button onClick={() => router.push("/products")}>Browse Products</Button>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="card p-10 max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-800 mb-2">Order Placed!</h2>
          <p className="text-gray-500 mb-2">Thank you, {form.name.split(" ")[0]}!</p>
          <p className="text-sm text-gray-400 mb-6">
            A confirmation has been sent to <span className="font-medium text-gray-600">{form.email}</span>.
            Your order will be delivered in 3–7 business days.
          </p>
          <div className="bg-brand-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 mb-1">Delivering to</p>
            <p className="font-medium text-gray-700">{form.name}</p>
            <p className="text-sm text-gray-500">{form.line1}, {form.city}, {form.state} – {form.pincode}</p>
          </div>
          <Button className="w-full" onClick={() => router.push("/products")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">Checkout</h1>

        {/* Progress steps */}
        <div className="flex items-center gap-3 mb-8 text-sm">
          {["address", "payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-px bg-gray-300" />}
              <div className={`flex items-center gap-2 ${step === s || (s === "address" && step === "payment") ? "text-brand-600 font-medium" : "text-gray-400"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  (s === "address" && step !== "address") ? "bg-green-500 text-white" :
                  step === s ? "bg-brand-500 text-white" : "bg-gray-200 text-gray-400"
                }`}>
                  {s === "address" && step !== "address" ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="capitalize hidden sm:inline">{s === "address" ? "Delivery Address" : "Payment"}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            {step === "address" && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-800 text-lg mb-5">Delivery Address</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Full Name *" placeholder="Priya Sharma" value={form.name} onChange={update("name")} error={errors.name} />
                    <Input label="Email *" type="email" placeholder="priya@example.com" value={form.email} onChange={update("email")} error={errors.email} />
                  </div>
                  <Input label="Mobile Number *" type="tel" placeholder="9876543210" value={form.phone} onChange={update("phone")} error={errors.phone} />
                  <Input label="Address Line 1 *" placeholder="House no., Street, Area" value={form.line1} onChange={update("line1")} error={errors.line1} />
                  <Input label="Address Line 2 (optional)" placeholder="Landmark, Apartment, etc." value={form.line2} onChange={update("line2")} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input label="City *" placeholder="Jaipur" value={form.city} onChange={update("city")} error={errors.city} />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                      <select value={form.state} onChange={update("state")} className={`input ${errors.state ? "border-red-400" : ""}`}>
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
                    </div>
                    <Input label="Pincode *" placeholder="302001" value={form.pincode} onChange={update("pincode")} error={errors.pincode} />
                  </div>
                </div>
                <Button size="lg" className="w-full mt-6 rounded-2xl" onClick={handleAddressNext}>
                  Continue to Payment
                </Button>
              </div>
            )}

            {step === "payment" && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-gray-800 text-lg">Payment Method</h2>
                  <button onClick={() => setStep("address")} className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Edit address
                  </button>
                </div>

                {/* Delivery address recap */}
                <div className="bg-cream-100 rounded-xl p-4 mb-6 text-sm">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Delivering to</p>
                  <p className="font-semibold text-gray-800">{form.name}</p>
                  <p className="text-gray-600">{form.line1}, {form.city}, {form.state} – {form.pincode}</p>
                  <p className="text-gray-500">{form.phone}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? "border-brand-500 bg-brand-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="accent-brand-500"
                      />
                      <method.icon className="w-6 h-6 text-brand-500" strokeWidth={1.75} />
                      <span className="font-medium text-gray-700">{method.label}</span>
                    </label>
                  ))}
                </div>

                {paymentMethod === "upi" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
                    You&apos;ll be redirected to your UPI app to complete the payment of <strong>{formatPrice(total)}</strong>.
                  </div>
                )}
                {paymentMethod === "cod" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-700">
                    Pay <strong>{formatPrice(total)}</strong> in cash when your order is delivered. COD charges may apply.
                  </div>
                )}

                <Button size="lg" className="w-full rounded-2xl" onClick={handlePlaceOrder} loading={loading}>
                  <Lock className="w-4 h-4" />
                  {loading ? "Placing order…" : `Place Order — ${formatPrice(total)}`}
                </Button>
                <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Your payment information is 100% secure
                </p>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24">
              <button
                className="flex items-center justify-between w-full mb-4 lg:cursor-default"
                onClick={() => setShowOrderSummary(!showOrderSummary)}
              >
                <h3 className="font-semibold text-gray-800">
                  Order Summary ({items.length} item{items.length !== 1 ? "s" : ""})
                </h3>
                <span className="lg:hidden text-gray-400">
                  {showOrderSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              <div className={`space-y-3 mb-4 ${showOrderSummary ? "block" : "hidden lg:block"}`}>
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-cream-100">
                      <Image
                        src={item.uploadedImage || item.image}
                        alt={item.name}
                        fill
                        className={item.uploadedImage ? "object-contain bg-white" : "object-cover"}
                        sizes="56px"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      {item.variantInfo && <p className="text-xs text-gray-400 truncate">{item.variantInfo}</p>}
                      <p className="text-sm font-semibold text-brand-600 mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatPrice(sub)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-brand-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
