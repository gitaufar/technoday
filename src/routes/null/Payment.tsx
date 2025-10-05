"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Shield, TrendingUp, Zap } from "lucide-react";
import PaymentTemplate from "@/components/Payment/Template";
import { plans } from "@/components/Payment/item";

export default function ChooseYourPlan() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<
    "starter" | "professional" | "enterprise"
  >("starter");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(
    plans[0]
  );

  const handlePlanSelect = (
    plan: "starter" | "professional" | "enterprise"
  ) => {
    setSelectedPlan(plan);
  };

  const handleSubscribeNow = (planType: string) => {
    const plan = plans.find((p) => p.id === planType) || plans[0];
    setSelectedPlanForPayment(plan);
    setShowPaymentModal(true);
  };

  const handleStartFreePlan = () => {
    // Logic untuk start free plan
    console.log("Starting free plan");
    // Navigate to owner dashboard after selecting plan
    navigate("/owner");
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          Choose Your Plan
        </h1>
        <p className="text-sm text-slate-500">
          Select the perfect plan for your contract management needs.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Plans Section - Left Side */}
        <div className="lg:col-span-3 space-y-6">
          {/* Starter Plan */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Starter Plan
                </h3>
                <p className="text-sm text-slate-500">
                  Perfect for small teams getting started
                </p>
              </div>
              <div className="text-2xl font-bold text-slate-900">Free</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-500" />
                Upload & store contracts
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-500" />
                Basic status tracking
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-500" />
                Up to 10 contracts
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartFreePlan}
              className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
            >
              Start Free Plan
            </button>
          </div>

          {/* Professional Plan */}
          <div className="rounded-2xl border-2 border-blue-500 bg-white p-6 space-y-6 relative">
            <div className="absolute -top-3 left-4">
              <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Professional Plan
                </h3>
                <p className="text-sm text-slate-500">
                  Advanced features for growing businesses
                </p>
              </div>
              <div className="flex flex-col items-start">
                <div className="text-2xl font-bold text-slate-900">$220</div>
                <div className="text-sm font-medium text-slate-500">
                  per month
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900"></h3>
              <p className="text-sm text-slate-500"></p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-500" />
                Everything in Starter
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-500" />
                AI Contract Analysis
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-500" />
                Risk Ready Dashboard
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-500" />
                KPI Performance Tracking
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-500" />
                Up to 100 contracts
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSubscribeNow("professional")}
              className="w-full rounded-lg bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
            >
              Subscribe Now
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Enterprise Plan
                </h3>
                <p className="text-sm text-slate-500">
                  Custom solutions for large organizations
                </p>
              </div>
              <div className="flex flex-col items-start">
                <div className="text-2xl font-bold text-slate-900">$470</div>
                <div className="text-sm font-medium text-slate-500">
                  per month
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-500" />
                Everything in Professional
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-500" />
                Unlimited contracts
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-500" />
                Custom integrations
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-500" />
                Dedicated support
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSubscribeNow("enterprise")}
              className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Subscribe Now
            </button>
          </div>
        </div>

        {/* Why Choose OptiMind Section - Right Side */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 h-fit sticky top-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Why Choose OptiMind?
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100 flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 text-sm">
                    AI-Powered Analysis
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Advanced AI analyzes your contracts for risks and
                    opportunities
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 flex-shrink-0">
                  <Shield className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 text-sm">
                    Risk Management
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Identify, assess, and apply mitigation strategies
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange-100 flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 text-sm">
                    Performance Tracking
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Real-time KPIs and reporting
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-purple-100 flex-shrink-0">
                  <Zap className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 text-sm">
                    Your data is secure
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Enterprise-grade encryption
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentTemplate
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedPlan={selectedPlanForPayment}
        onSuccess={() => navigate("/owner")}
      />
    </div>
  );
}
