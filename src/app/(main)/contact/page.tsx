import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Maa Stickers for support, bulk orders, or any queries.",
};

const CONTACT_INFO = [
  { icon: Phone, label: "Phone / WhatsApp", value: "+91 98765 43210", href: "tel:+919876543210", sub: "Mon–Sat, 9am–7pm" },
  { icon: Mail, label: "Email", value: "hello@maastickers.in", href: "mailto:hello@maastickers.in", sub: "Reply within 24 hours" },
  { icon: MapPin, label: "Office", value: "123, Craft Lane, Jaipur, Rajasthan – 302001", href: "#", sub: "Visit by appointment" },
  { icon: Clock, label: "Working Hours", value: "Mon – Sat: 9:00 AM – 7:00 PM", href: "#", sub: "Sunday: Closed" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cream-50 py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-gray-800 mb-3">Get in Touch</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Have questions about your order, customization, or anything else? We&apos;re here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            {CONTACT_INFO.map((item) => (
              <a key={item.label} href={item.href} className="card p-5 flex gap-4 hover:border-brand-200 border border-transparent transition-colors">
                <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
              </a>
            ))}

            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Contact form (client component) */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
