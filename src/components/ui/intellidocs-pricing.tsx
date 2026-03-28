"use client";

import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import UpgradeModal from "@/components/UpgradeModal";

type Plan = "monthly" | "quarterly";

type PLAN = {
  id: string;
  title: string;
  desc: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  badge?: string;
  buttonText: string;
  features: string[];
  isFree?: boolean;
  comingSoon?: boolean;
};

const PLANS: PLAN[] = [
  {
    id: "free",
    title: "Free",
    desc: "Perfect for trying out intelliDocs. No credit card required — get started instantly.",
    monthlyPrice: 0,
    quarterlyPrice: 0,
    buttonText: "Get Started Free",
    isFree: true,
    features: [
      "3 PDF uploads",
      "5 messages per PDF",
      "GPT-4 powered AI",
      "PDF viewer",
      "Chat history",
    ],
  },
  {
    id: "pro",
    title: "Pro",
    desc: "For students, researchers and professionals who need unlimited document intelligence.",
    monthlyPrice: 199,
    quarterlyPrice: 499,
    badge: "Best Value",
    buttonText: "Upgrade to Pro",
    comingSoon: true,
    features: [
      "Unlimited PDF uploads",
      "Unlimited messages",
      "GPT-4 powered AI",
      "Priority AI responses",
      "Chat history",
      "Early access to features",
    ],
  },
];

export default function IntelliDocsPricing() {
  const [billPlan, setBillPlan] = useState<Plan>("monthly");
  const [modalOpen, setModalOpen] = useState(false);

  const handleSwitch = () => {
    setBillPlan((prev) => (prev === "monthly" ? "quarterly" : "monthly"));
  };

  return (
    <>
      <UpgradeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} reason="pdf_limit" />

      <div className="relative flex flex-col items-center justify-center max-w-5xl py-16 mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-6 text-gray-900">
            Simple Pricing
          </h2>
          <p className="text-base md:text-lg text-center text-gray-500 mt-4 max-w-md">
            Start free. Upgrade when you need more. No credit card required to get started.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center space-x-4 mt-8">
          <span className={cn("text-sm font-medium transition-colors", billPlan === "monthly" ? "text-gray-900" : "text-gray-400")}>
            Monthly
          </span>
          <button onClick={handleSwitch} className="relative rounded-full focus:outline-none">
            <div className="w-12 h-6 transition rounded-full shadow-md outline-none bg-violet-600" />
            <div
              className={cn(
                "absolute inline-flex items-center justify-center w-4 h-4 transition-all duration-300 ease-in-out top-1 left-1 rounded-full bg-white shadow-sm",
                billPlan === "quarterly" ? "translate-x-6" : "translate-x-0"
              )}
            />
          </button>
          <span className={cn("text-sm font-medium transition-colors", billPlan === "quarterly" ? "text-gray-900" : "text-gray-400")}>
            Quarterly
            <span className="ml-1.5 text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-full">
              Save 16%
            </span>
          </span>
        </div>

        {/* Cards */}
        <div className="grid w-full grid-cols-1 lg:grid-cols-2 pt-10 gap-4 lg:gap-6 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billPlan={billPlan}
              onUpgradeClick={() => setModalOpen(true)}
            />
          ))}
        </div>

        {/* Note */}
        <p className="mt-8 text-xs text-gray-400 text-center">
          Pro plan payments are coming soon. You will be notified when available.
        </p>
      </div>
    </>
  );
}

function PlanCard({
  plan,
  billPlan,
  onUpgradeClick,
}: {
  plan: PLAN;
  billPlan: Plan;
  onUpgradeClick: () => void;
}) {
  const isPro = plan.id === "pro";

  return (
    <div
      className={cn(
        "flex flex-col relative rounded-2xl lg:rounded-3xl transition-all items-start w-full border overflow-hidden",
        isPro
          ? "border-violet-400 bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-800 shadow-2xl"
          : "border-gray-100 bg-white shadow-sm"
      )}
    >
      {/* Pro glow */}
      {isPro && (
        <div className="absolute top-1/2 inset-x-0 mx-auto h-12 -rotate-45 w-full bg-violet-500 rounded-3xl blur-[8rem] -z-10" />
      )}

      {/* Badge */}
      {plan.badge && (
        <div className="absolute top-4 right-4">
          <span className="text-[11px] font-bold bg-yellow-400 text-yellow-900 px-2.5 py-1 rounded-full">
            {plan.badge}
          </span>
        </div>
      )}

      {/* Top section */}
      <div className="p-6 md:p-8 flex flex-col items-start w-full">
        <span className={cn("text-xs font-bold uppercase tracking-widest mb-3", isPro ? "text-violet-300" : "text-gray-400")}>
          {plan.title}
        </span>

        <div className={cn("text-3xl md:text-5xl font-bold", isPro ? "text-white" : "text-gray-900")}>
          {plan.isFree ? (
            <span>₹0</span>
          ) : (
            <NumberFlow
              value={billPlan === "monthly" ? plan.monthlyPrice : plan.quarterlyPrice}
              prefix="₹"
              suffix={billPlan === "monthly" ? "/mo" : "/qr"}
              format={{ minimumFractionDigits: 0, maximumFractionDigits: 0 }}
            />
          )}
        </div>

        {plan.isFree && (
          <span className={cn("text-sm mt-1", isPro ? "text-violet-300" : "text-gray-400")}>forever free</span>
        )}

        <p className={cn("text-sm mt-3 leading-relaxed", isPro ? "text-violet-200" : "text-gray-500")}>
          {plan.desc}
        </p>
      </div>

      {/* Button */}
      <div className="flex flex-col items-start w-full px-6 md:px-8 pb-2">
        {plan.isFree ? (
          <Button size="lg" className="w-full" variant={isPro ? "secondary" : "default"}>
            {plan.buttonText}
          </Button>
        ) : (
          <button
            onClick={onUpgradeClick}
            className="w-full h-10 rounded-lg px-8 bg-white/15 border border-white/25 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-colors relative overflow-hidden"
          >
            <span className="absolute inset-y-0 left-0 w-1/4 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <Lock className="w-3.5 h-3.5 text-violet-200" />
            {plan.buttonText} — Coming Soon
          </button>
        )}

        <div className="h-7 overflow-hidden w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.span
              key={billPlan}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn("text-xs text-center mt-2 mx-auto block", isPro ? "text-violet-400" : "text-gray-400")}
            >
              {plan.isFree
                ? "No credit card required"
                : billPlan === "monthly"
                ? "Billed monthly"
                : "Billed every 3 months"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Features */}
      <div className="flex flex-col items-start w-full px-6 md:px-8 py-4 mb-2 gap-y-3">
        <span className={cn("text-sm font-medium mb-1", isPro ? "text-violet-200" : "text-gray-500")}>
          Includes:
        </span>
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <div className={cn(
              "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
              isPro ? "bg-white/10" : "bg-gray-100"
            )}>
              <CheckIcon className={cn("w-2.5 h-2.5", isPro ? "text-violet-300" : "text-gray-500")} />
            </div>
            <span className={cn("text-sm", isPro ? "text-violet-100" : "text-gray-600")}>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
