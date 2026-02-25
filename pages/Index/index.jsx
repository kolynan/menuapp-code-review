import React from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/components/i18n";
import { Button } from "@/components/ui/button";
import { QrCode, ClipboardList, UtensilsCrossed, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

export default function Index() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleLogin = async () => {
    await base44.auth.redirectToLogin("/partnerhome");
  };

  const features = [
    {
      icon: QrCode,
      title: t("index.features.qr_menu.title"),
      description: t("index.features.qr_menu.description"),
    },
    {
      icon: ClipboardList,
      title: t("index.features.realtime_orders.title"),
      description: t("index.features.realtime_orders.description"),
    },
    {
      icon: UtensilsCrossed,
      title: t("index.features.table_management.title"),
      description: t("index.features.table_management.description"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-indigo-600">MenuApp</div>
            <Button variant="outline" size="sm" onClick={handleLogin}>
              {t("index.header.login")}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            {t("index.hero.title")}
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 mb-8">
            {t("index.hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8" onClick={handleLogin}>
              {t("index.hero.create_restaurant")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={handleLogin}>
              {t("index.hero.login")}
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t("index.cta.title")}
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            {t("index.cta.subtitle")}
          </p>
          <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-100" onClick={handleLogin}>
            {t("index.cta.start")}
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
