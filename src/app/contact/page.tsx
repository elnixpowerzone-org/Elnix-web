import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/contact/ContactForm';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  HelpCircle, 
  ShieldCheck, 
  Truck 
} from 'lucide-react';

export const metadata = {
  title: 'Contact Us | ELNIX POWERZONE',
  description: 'Get in touch with Elnix Powerzone for electrical, battery, plumbing, and sanitary quotations or store inquiries in Kerala.',
};

export default function ContactPage() {
  const faqs = [
    {
      q: 'Do you offer special pricing for contractors and bulk buyers?',
      a: 'Yes, we provide tiered wholesale pricing for electrical contractors, plumbers, builders, and large commercial projects across Kerala. Reach out via our quote form or visit our showroom.',
    },
    {
      q: 'Are the products covered by official manufacturer warranties?',
      a: '100% yes. All batteries (Exide, SF Sonic, Bosch, Luminous), wiring (Polycab, Finolex), and fittings (Jaquar, Cera) are direct OEM supplies with authorized manufacturer warranty cards.',
    },
    {
      q: 'Do you provide delivery for heavy materials like batteries and pipe bundles?',
      a: 'Yes, we arrange prompt on-site transport delivery throughout Ernakulam and nearby Kerala districts.',
    },
    {
      q: 'Can I test my old inverter or car battery at your store?',
      a: 'Yes! We have an automated electronic testing bench at our Eruvely showroom to measure load, specific gravity, and cranking performance free of charge.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-1">
        {/* Banner */}
        <section className="bg-[#0b1a30] text-white py-16 lg:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
            <span className="text-xs font-black tracking-widest text-sky-400 uppercase block">
              WE ARE HERE TO HELP
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
              Get in Touch with <span className="text-sky-400">Elnix</span>
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Have questions about product availability, wholesale pricing, or technical specifications? Reach out or visit our Eruvely showroom.
            </p>
          </div>
        </section>

        {/* Form and Contact Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left 5 Cols: Contact Information */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-md space-y-6">
                <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">
                  Direct Channels
                </h3>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Phone Call
                    </h4>
                    <a
                      href="tel:8848318521"
                      className="text-lg font-black text-slate-900 hover:text-sky-600 transition-colors block"
                    >
                      8848 318 521
                    </a>
                    <p className="text-xs text-slate-500">Mon - Sat: 9:00 AM - 8:00 PM</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      WhatsApp Quick Chat
                    </h4>
                    <a
                      href="https://wa.me/918848318521"
                      target="_blank"
                      rel="noreferrer"
                      className="text-base font-black text-emerald-600 hover:underline block"
                    >
                      +91 8848 318 521
                    </a>
                    <p className="text-xs text-slate-500">Instant responses during store hours</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Email Inquiries
                    </h4>
                    <a
                      href="mailto:elnixpowerzone@gmail.com"
                      className="text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors block truncate"
                    >
                      elnixpowerzone@gmail.com
                    </a>
                    <p className="text-xs text-slate-500">Quotes & purchase orders</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Showroom Address
                    </h4>
                    <p className="text-sm font-bold text-slate-900 leading-snug">
                      Elnix Tower, Eruvely, Chottanikkara, Ernakulam - 682312, Kerala, India
                    </p>
                  </div>
                </div>
              </div>

              {/* Working Hours Card */}
              <div className="p-6 bg-[#0b1a30] text-white rounded-3xl shadow-md space-y-3">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Store Timings</span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-300">Monday - Saturday:</span>
                    <span className="font-bold">9:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-300">Sunday:</span>
                    <span className="font-bold text-amber-300">9:00 AM - 4:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Contact Form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>

          {/* FAQs Section */}
          <div className="mt-20">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-black tracking-widest text-sky-600 uppercase block">
                FREQUENTLY ASKED QUESTIONS
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Common Inquiries
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {faqs.map((f, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2"
                >
                  <div className="flex items-start gap-2.5">
                    <HelpCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <h4 className="text-base font-bold text-slate-900">
                      {f.q}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 pl-7 leading-relaxed">
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

