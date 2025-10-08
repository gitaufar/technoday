"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  Building2,
  Check,
  Loader2,
  Lock,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import supabase from "@/utils/supabase";
import { useAuth } from "@/auth/AuthProvider";
import { SubscriptionModal } from "@/components/SubscriptionModal";

type FormState = {
  companyName: string;
  legalEntityName: string;
  industry: string;
  companyEmail: string;
  companyPhone: string;
  address: string;
  defaultPlan: "starter" | "professional" | "enterprise";
};

const industryOptions = [
  { label: "Technology", value: "technology" },
  { label: "Finance", value: "finance" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Retail", value: "retail" },
  { label: "Transportation & Logistics", value: "transportation" },
  { label: "Government", value: "government" },
  { label: "Education", value: "education" },
  { label: "Energy & Utilities", value: "energy" },
  { label: "Other", value: "other" },
];

const planOptions: Array<{
  label: string;
  value: FormState["defaultPlan"];
  helper: string;
}> = [
  {
    label: "Starter",
    value: "starter",
    helper: "Best for small teams getting started",
  },
  {
    label: "Professional",
    value: "professional",
    helper: "Advanced workflows & analytics",
  },
  {
    label: "Enterprise",
    value: "enterprise",
    helper: "Enterprise-grade automations & support",
  },
];

const planToSubscription: Record<
  FormState["defaultPlan"],
  "basic" | "premium" | "enterprise"
> = {
  starter: "basic",
  professional: "premium",
  enterprise: "enterprise",
};

const planCards: Array<{
  id: FormState["defaultPlan"];
  title: string;
  description: string;
  price: string;
  priceNumeric: number;
  priceSuffix?: string;
  features: string[];
  buttonLabel: string;
  borderClass: string;
  buttonClass: string;
  iconClass: string;
  tag?: string;
  tagClass?: string;
  backgroundClass?: string;
  requiresPayment?: boolean;
}> = [
  {
    id: "starter",
    title: "Starter Plan",
    description: "Perfect for small teams getting started",
    price: "Free",
    priceNumeric: 0,
    features: [
      "Upload & store contracts",
      "Basic status tracking",
      "Up to 10 contracts",
    ],
    buttonLabel: "Start Free Plan",
    borderClass: "border-slate-200",
    buttonClass: "bg-emerald-500 hover:bg-emerald-600",
    iconClass: "text-emerald-500",
    requiresPayment: false,
  },
  {
    id: "professional",
    title: "Professional Plan",
    description: "Advanced features for growing businesses",
    price: "$220",
    priceNumeric: 220,
    priceSuffix: "per month",
    features: [
      "Everything in Starter",
      "AI Contract Analyzer",
      "Risk Radar Dashboard",
      "KPI Performance Tracking",
      "Up to 100 contracts",
    ],
    buttonLabel: "Subscribe Now",
    borderClass: "border-[#357ABD] ring-2 ring-[#357ABD]/20",
    buttonClass: "bg-[#357ABD] hover:bg-[#2e6dad]",
    iconClass: "text-[#357ABD]",
    tag: "Most Popular",
    tagClass: "bg-[#357ABD] text-white",
    backgroundClass: "bg-[#F7FAFF]",
    requiresPayment: true,
  },
  {
    id: "enterprise",
    title: "Enterprise Plan",
    description: "Custom solutions for large organizations",
    price: "$470",
    priceNumeric: 470,
    priceSuffix: "per month",
    features: [
      "Everything in Professional",
      "Unlimited contracts",
      "Custom integrations",
      "Dedicated support",
    ],
    buttonLabel: "Subscribe Now",
    borderClass: "border-slate-200",
    buttonClass: "bg-[#F58A33] hover:bg-[#e67c27]",
    iconClass: "text-[#F58A33]",
    requiresPayment: true,
  },
];

const benefitItems = [
  {
    title: "AI-Powered Analysis",
    description:
      "Advanced AI analyzes your contracts for risks and opportunities.",
    icon: Sparkles,
    iconClass: "text-[#357ABD]",
  },
  {
    title: "Risk Management",
    description: "Proactive risk identification and mitigation strategies.",
    icon: ShieldCheck,
    iconClass: "text-emerald-500",
  },
  {
    title: "Performance Tracking",
    description: "Real-time KPI monitoring and reporting.",
    icon: Activity,
    iconClass: "text-[#357ABD]",
  },
];

const generateCompanyCode = (rawName: string) => {
  const base = rawName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
  const fallback = base.length >= 3 ? base : "COMP";
  const suffix = Math.random()
    .toString(36)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);
  return `${fallback}${suffix}`;
};

export default function CreateNewCompany() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [formData, setFormData] = useState<FormState>({
    companyName: "",
    legalEntityName: "",
    industry: "",
    companyEmail: "",
    companyPhone: "",
    address: "",
    defaultPlan: "starter",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"plan" | "form">("plan");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: number;
    features: string[];
  } | null>(null);

  const selectedPlanCard = useMemo(
    () =>
      planCards.find((card) => card.id === formData.defaultPlan) ??
      planCards[0],
    [formData.defaultPlan]
  );

  const isValid = useMemo(() => {
    return (
      formData.companyName.trim().length > 2 &&
      formData.legalEntityName.trim().length > 2 &&
      formData.industry.length > 0 &&
      formData.companyEmail.trim().length > 3
    );
  }, [formData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlanSelection = (planId: FormState["defaultPlan"]) => {
    const card = planCards.find((item) => item.id === planId);
    if (!card) return;
    
    if (card.requiresPayment) {
      setSelectedPlan({
        name: card.title,
        price: card.priceNumeric,
        features: card.features,
      });
      setIsModalOpen(true);
      return;
    }
    
    handlePlanContinue(planId);
  };

  const handlePlanContinue = (planId: FormState["defaultPlan"]) => {
    setFormData((prev) => ({
      ...prev,
      defaultPlan: planId,
    }));
    setError(null);
    setStep("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToPlans = () => {
    setError(null);
    setStep("plan");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscriptionSuccess = (paymentData: {
    cardNumber: string;
    expirationDate: string;
    cvv: string;
    fullName: string;
    country: string;
    addressLine1: string;
    addressLine2: string;
    isBusiness: boolean;
  }) => {
    console.log("Payment successful:", {
      plan: selectedPlan,
      paymentData,
    });
    
    // Find the plan ID that corresponds to the selected plan
    const planCard = planCards.find(card => card.title === selectedPlan?.name);
    if (planCard) {
      handlePlanContinue(planCard.id);
    }
    
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleCreateCompany = async () => {
    if (!isValid) {
      setError("Lengkapi form yang bertanda * sebelum membuat company.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const [{ data: authData, error: authError }] = await Promise.all([
        supabase.auth.getUser(),
      ]);

      if (authError) {
        throw authError;
      }

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error("Session tidak ditemukan. Silakan login ulang.");
      }

      const companyPayload = {
        name: formData.companyName.trim(),
        code: generateCompanyCode(formData.companyName),
        description: formData.legalEntityName.trim(),
        industry: formData.industry,
        email: formData.companyEmail.trim(),
        phone: formData.companyPhone.trim() || null,
        address: formData.address.trim() || null,
        subscription_plan: planToSubscription[formData.defaultPlan],
        subscription_status: "trial" as const,
        owner_id: userId,
      };

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert([companyPayload])
        .select()
        .single();

      if (companyError) {
        throw companyError;
      }

      const { error: linkError } = await supabase.from("company_users").insert([
        {
          company_id: company.id,
          user_id: userId,
          role: "management",
          is_admin: true,
          is_primary: true,
          status: "active",
        },
      ]);

      if (linkError) {
        console.error("Failed to link owner to company", linkError);
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          role: "owner",
          company_id: company.id,
        })
        .eq("id", userId);

      if (profileError) {
        throw profileError;
      }

      await refresh();
      navigate("/owner", { replace: true });
    } catch (err) {
      console.error("Failed to create company", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal membuat company. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/create-project");
  };

  if (step === "plan") {
    return (
      <>
        <div className="space-y-6">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">
              Choose Your Plan
            </h1>
            <p className="text-sm text-slate-500">
              Select the perfect plan for your contract management needs.
            </p>
          </header>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,1.5fr)]">
            <div className="space-y-4">
              {planCards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-3xl border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    card.borderClass
                  } ${card.backgroundClass ?? "bg-white"}`}
                >
                  {card.tag && card.tagClass && (
                    <div className="mb-4 flex justify-start">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${card.tagClass}`}
                      >
                        {card.tag}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {card.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {card.description}
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-slate-600">
                        {card.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check
                              className={`mt-0.5 h-4 w-4 ${card.iconClass}`}
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-3xl font-semibold text-slate-900">
                        {card.price}
                      </p>
                      {card.priceSuffix && (
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          {card.priceSuffix}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlanSelection(card.id)}
                    className={`mt-6 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${card.buttonClass} focus:outline-none focus:ring-2 focus:ring-[#357ABD] focus:ring-offset-2`}
                  >
                    {card.buttonLabel}
                  </button>
                </div>
              ))}
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-lg font-semibold text-slate-900">
                Why Choose OptiMind?
              </h3>
              <div className="mt-6 space-y-4">
                {benefitItems.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.title} className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                        <Icon className={`h-5 w-5 ${benefit.iconClass}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {benefit.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <Lock className="h-5 w-5 text-slate-400" />
                <span>
                  Your data is secure with enterprise-grade encryption.
                </span>
              </div>
            </aside>
          </div>
        </div>

        {/* SubscriptionModal from SubscriptionModalDemo */}
        {selectedPlan && (
          <SubscriptionModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedPlan(null);
            }}
            planName={selectedPlan.name}
            planPrice={selectedPlan.price}
            planFeatures={selectedPlan.features}
            onSuccess={handleSubscriptionSuccess}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">
            Create New Company
          </h1>
          <p className="text-sm text-slate-500">
            Add a new company to your organization with customized settings and
            configurations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedPlanCard && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {selectedPlanCard.title}
            </span>
          )}
          <button
            type="button"
            onClick={handleBackToPlans}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#357ABD] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Change Plan
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-8 p-6 sm:p-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-[#357ABD]/10 p-2">
                <Building2 className="h-5 w-5 text-[#357ABD]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Company Information
                </h2>
                <p className="text-sm text-slate-500">
                  Detail utama untuk profil perusahaan dan legal entity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="companyName"
                  className="text-sm font-medium text-slate-700"
                >
                  Company Name *
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#357ABD] focus:outline-none focus:ring-1 focus:ring-[#357ABD]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="legalEntityName"
                  className="text-sm font-medium text-slate-700"
                >
                  Legal Entity Name *
                </label>
                <input
                  id="legalEntityName"
                  name="legalEntityName"
                  value={formData.legalEntityName}
                  onChange={handleInputChange}
                  placeholder="Enter legal entity name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#357ABD] focus:outline-none focus:ring-1 focus:ring-[#357ABD]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="industry"
                  className="text-sm font-medium text-slate-700"
                >
                  Industry *
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#357ABD] focus:outline-none focus:ring-1 focus:ring-[#357ABD]"
                >
                  <option value="">Select industry</option>
                  {industryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="companyEmail"
                  className="text-sm font-medium text-slate-700"
                >
                  Company Email *
                </label>
                <input
                  id="companyEmail"
                  name="companyEmail"
                  type="email"
                  value={formData.companyEmail}
                  onChange={handleInputChange}
                  placeholder="company@example.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#357ABD] focus:outline-none focus:ring-1 focus:ring-[#357ABD]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="companyPhone"
                  className="text-sm font-medium text-slate-700"
                >
                  Company Phone
                </label>
                <input
                  id="companyPhone"
                  name="companyPhone"
                  value={formData.companyPhone}
                  onChange={handleInputChange}
                  placeholder="+62 xxx-xxxx-xxxx"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#357ABD] focus:outline-none focus:ring-1 focus:ring-[#357ABD]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="address"
                  className="text-sm font-medium text-slate-700"
                >
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter company address"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#357ABD] focus:outline-none focus:ring-1 focus:ring-[#357ABD]"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-[#357ABD]/10 p-2">
                <Settings className="h-5 w-5 text-[#357ABD]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Configuration
                </h2>
                <p className="text-sm text-slate-500">
                  Pilih konfigurasi awal untuk plan dan pengaturan perusahaan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Selected Plan
                </label>
                <div className="flex items-center justify-between w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-slate-900">
                      {planOptions.find(
                        (plan) => plan.value === formData.defaultPlan
                      )?.label || "No plan selected"}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {
                        planOptions.find(
                          (plan) => plan.value === formData.defaultPlan
                        )?.helper
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#357ABD] focus:ring-offset-2"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCreateCompany}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#357ABD] px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2e6dad] focus:outline-none focus:ring-2 focus:ring-[#357ABD] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Company
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}