import { useEffect, useState } from "react"
import type { CSSProperties } from "react"

import type { LucideIcon } from "lucide-react"
import { Check, Crown, Rocket, Sparkles } from "lucide-react"

type ButtonVariant = "primary" | "dark"

type Plan = {
  name: string
  icon: LucideIcon
  audience: string
  price: string
  cadence: string
  billing: string
  cta: string
  ctaVariant: ButtonVariant
  features: string[]
  popular?: boolean
}

const planAccents: Record<string, { primary: string; secondary: string }> = {
  "Free Plan": { primary: "#22c55e", secondary: "rgba(34,197,94,0.25)" },
  "Professional Plan": { primary: "#f97316", secondary: "rgba(249,115,22,0.25)" },
  "Enterprise Plan": { primary: "#2563eb", secondary: "rgba(37,99,235,0.25)" }
}

const plans: Plan[] = [
  {
    name: "Free Plan",
    icon: Rocket,
    audience: "Teams getting started with contract automation",
    price: "$0",
    cadence: "month",
    billing: "No credit card required",
    cta: "Get Started",
    ctaVariant: "dark",
    features: [
      "Up to 3 team members with flexible roles",
      "AI-assisted clause highlights and smart templates",
      "Core procurement workflows: draft, upload, track",
      "Compliance reminders and basic analytics",
      "Up to 50 active contracts"
    ]
  },
  {
    name: "Professional Plan",
    icon: Sparkles,
    audience: "Mid-sized businesses (20-100 employees)",
    price: "$220",
    cadence: "month",
    billing: "Billed monthly",
    cta: "Get Started",
    ctaVariant: "dark",
    popular: true,
    features: [
      "10 user slots with flexible roles (procurement, legal, management, etc.)",
      "Advanced analytics and reporting tools",
      "AI-powered risk assessment for smarter contract decisions",
      "Custom workflows tailored to your business processes",
      "Up to 500 active contracts",
      "Priority support for faster issue resolution"
    ]
  },
  {
    name: "Enterprise Plan",
    icon: Crown,
    audience: "Large enterprises (100+ employees)",
    price: "$470",
    cadence: "month",
    billing: "Billed monthly",
    cta: "Get Started",
    ctaVariant: "dark",
    features: [
      "Unlimited users and unlimited active contracts",
      "Advanced AI capabilities: predictive risk scoring & compliance automation",
      "Custom integrations with ERP, CRM, and e-procurement systems",
      "24/7 support"
    ]
  }
]

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
  dark: "bg-slate-900 text-white hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
}

export const PricingSection = () => {
  const [hoveredDarkPlan, setHoveredDarkPlan] = useState<string | null>(null)
  const [visiblePlans, setVisiblePlans] = useState<string[]>([])
  const [activePlan, setActivePlan] = useState<string | null>(null)

  useEffect(() => {
    const timeouts = plans.map((plan, index) =>
      window.setTimeout(() => {
        setVisiblePlans(prev => (prev.includes(plan.name) ? prev : [...prev, plan.name]))
      }, 150 + index * 160)
    )

    return () => {
      timeouts.forEach(timeoutId => window.clearTimeout(timeoutId))
    }
  }, [])

  const handleCardEnter = (name: string) => setActivePlan(name)
  const handleCardLeave = () => setActivePlan(null)

  return (
    <section id="pricing" className="relative isolate overflow-hidden bg-gradient-to-b from-white via-white to-blue-50/60 py-24 scroll-mt-24">
      <div className="animate-float-slow pointer-events-none absolute right-[-140px] top-[-160px] h-[420px] w-[420px] rounded-full bg-blue-200/40 blur-[120px]" />
      <div className="animate-float-delayed pointer-events-none absolute right-[120px] top-10 h-[220px] w-[220px] rounded-full bg-blue-200/60 blur-[80px]" />
      <div className="animate-float-reverse pointer-events-none absolute right-[-60px] bottom-[-120px] h-[360px] w-[360px] rounded-full bg-slate-200/50 blur-[120px]" />
      <div className="animate-float-soft pointer-events-none absolute left-[-200px] bottom-[-140px] h-[320px] w-[320px] rounded-full bg-blue-100/40 blur-[120px]" />

      <img
        src="/landingpage/bubble.svg"
        alt="floating bubbles"
        className="animate-orbit pointer-events-none absolute -top-44 right-0 w-[660px] max-w-none translate-x-1/4"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="mx-auto max-w-3xl text-4xl font-bold text-slate-900 sm:text-5xl">
            Choose Your <span className="text-[#FF7A00]">Perfect Plan</span>
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Select the plan that best fits your needs. Every subscription unlocks seamless contract automation with animated polish across devices.
          </p>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map(({ name, icon: Icon, audience, price, cadence, billing, cta, ctaVariant, features, popular }) => {
            const accent = planAccents[name] ?? planAccents["Enterprise Plan"]
            const isVisible = visiblePlans.includes(name)
            const isActive = activePlan === name
            const cardStyle: CSSProperties = {
              "--card-accent": accent.primary,
              "--card-secondary": accent.secondary
            }

            return (
              <div
                key={name}
                role="group"
                tabIndex={0}
                onMouseEnter={() => handleCardEnter(name)}
                onMouseLeave={handleCardLeave}
                onFocus={() => handleCardEnter(name)}
                onBlur={handleCardLeave}
                className={[
                  "pricing-card group relative flex h-full flex-col overflow-hidden rounded-[36px] border border-slate-200/40 bg-white/75 p-10 shadow-xl backdrop-blur-2xl transition-all duration-500",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white/30",
                  isVisible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-10",
                  isActive
                    ? "ring-2 ring-[color:var(--card-accent)] ring-offset-4 ring-offset-white/60 shadow-[0_28px_60px_-24px_rgba(37,99,235,0.55)]"
                    : "ring-1 ring-transparent",
                  popular ? "popular-plan" : ""
                ].join(" ")}
                style={cardStyle}
              >
                {popular && (
                  <div className="animate-bounce-slow absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className={`${popular ? "mt-16" : "mt-6"} flex h-full flex-col space-y-8`}>
                  <div className="flex items-center justify-center">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-500 ${
                        popular ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                      } group-hover:scale-110 group-hover:rotate-6 group-focus:scale-110 group-focus:rotate-6`}
                    >
                      <Icon className="h-8 w-8" strokeWidth={1.6} />
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-slate-900 sm:text-2xl">{name}</h3>
                    <p className="mt-2 text-sm text-slate-500 sm:text-base">{audience}</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-2 text-4xl font-bold text-slate-900 sm:text-[2.75rem]">
                      <span>{price}</span>
                      <span className="text-base font-medium text-slate-500">/{cadence}</span>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.35em] text-slate-400">
                      {billing}
                    </p>
                  </div>

                  <div className="flex-1">
                    <ul className="space-y-4 text-sm text-slate-600">
                      {features.map(feature => (
                        <li
                          key={feature}
                          className="group/item flex items-start gap-3 rounded-xl bg-white/10 px-2 py-1 transition-transform duration-300 hover:translate-x-1 hover:bg-white/40 focus-within:translate-x-1 focus-within:bg-white/60"
                        >
                          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition-transform duration-500 group-hover/item:scale-110 group-hover/item:rotate-6">
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          </span>
                          <span className="leading-relaxed text-slate-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onMouseEnter={() => {
                        if (ctaVariant === "dark") setHoveredDarkPlan(name)
                      }}
                      onMouseLeave={() => {
                        if (ctaVariant === "dark") setHoveredDarkPlan(null)
                      }}
                      className={`w-full max-w-[220px] rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${buttonStyles[ctaVariant]} group-hover:shadow-[0_18px_45px_-20px_rgba(37,99,235,0.8)] group-focus:shadow-[0_18px_45px_-20px_rgba(37,99,235,0.8)]`}
                    >
                      {ctaVariant === "dark" && hoveredDarkPlan === name ? "Start Plan" : cta}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
