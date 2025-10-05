import { useState } from "react"

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

  primary: "bg-blue-600 text-white hover:bg-blue-700",

  dark: "bg-slate-900 text-white hover:bg-blue-600"

}



export const PricingSection = () => {

  const [hoveredDarkPlan, setHoveredDarkPlan] = useState<string | null>(null)



  return (

    <section className="relative isolate bg-gradient-to-b from-white via-white to-blue-50 py-24">

      {/* Decorative bubbles */}

      <div className="pointer-events-none absolute right-[-140px] top-[-160px] h-[420px] w-[420px] rounded-full bg-blue-200/30 blur-[120px]" />

      <div className="pointer-events-none absolute right-[120px] top-10 h-[220px] w-[220px] rounded-full bg-blue-200/50 blur-[80px]" />

      <div className="pointer-events-none absolute right-[-60px] bottom-[-120px] h-[360px] w-[360px] rounded-full bg-slate-200/40 blur-[120px]" />

      <div className="pointer-events-none absolute left-[-180px] bottom-[-120px] h-[320px] w-[320px] rounded-full bg-blue-100/30 blur-[120px]" />



      <img

        src="/landingpage/bubble.svg"

        alt="floating bubbles"

        className="pointer-events-none absolute -top-44 right-0 w-[660px] max-w-none translate-x-1/4"

      />



      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">

        <div className="text-center">

          <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">

            Choose Your <span className="text-orange-500">Perfect Plan</span>

          </h2>

          <p className="mt-4 text-base text-slate-600 sm:text-lg">

            Select the plan that best fits your needs. All plans include our core features with varying levels of usage and support.

          </p>

        </div>



        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

          {plans.map(({ name, icon: Icon, audience, price, cadence, billing, cta, ctaVariant, features, popular }) => (

            <div

              key={name}

              className={[

                "group relative flex h-full flex-col overflow-hidden rounded-[36px] border border-slate-200 bg-white/85 p-10 shadow-xl backdrop-blur-xl transition-all duration-300",

                popular

                  ? "hover:-translate-y-3 hover:border-blue-400 hover:shadow-blue-200/70"

                  : "hover:-translate-y-2 hover:border-blue-300 hover:shadow-slate-200/70"

              ].join(" ")}

            >

              {popular && (

                <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white">

                  Most Popular

                </div>

              )}



              <div className={`${popular ? "mt-16" : "mt-6"} flex h-full flex-col`}>

                <div className="flex items-center justify-center">

                  <div className={`flex h-16 w-16 items-center justify-center rounded-full ${

                    popular ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"

                  }`}>

                    <Icon className="h-8 w-8" strokeWidth={1.6} />

                  </div>

                </div>



                <div className="mt-6 text-center">

                  <h3 className="text-xl font-semibold text-slate-900">{name}</h3>

                  <p className="mt-2 text-sm text-slate-500">{audience}</p>

                </div>



                <div className="mt-8 text-center">

                  <div className="flex items-baseline justify-center gap-2 text-4xl font-bold text-slate-900">

                    <span>{price}</span>

                    <span className="text-base font-medium text-slate-500">/{cadence}</span>

                  </div>

                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">{billing}</p>

                </div>



                <div className="mt-8 flex-1">

                  <ul className="space-y-4 text-sm text-slate-600">

                    {features.map(feature => (

                      <li key={feature} className="flex items-start gap-3">

                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">

                          <Check className="h-3 w-3" strokeWidth={2.5} />

                        </span>

                        <span>{feature}</span>

                      </li>

                    ))}

                  </ul>

                </div>

                <div className="mt-10 flex justify-center">

                  <button

                    type="button"

                    onMouseEnter={() => {

                      if (ctaVariant === "dark") setHoveredDarkPlan(name)

                    }}

                    onMouseLeave={() => {

                      if (ctaVariant === "dark") setHoveredDarkPlan(null)

                    }}

                    className={`w-full max-w-[200px] rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200 ${buttonStyles[ctaVariant]}`}

                  >

                    {ctaVariant === "dark" && hoveredDarkPlan === name ? "Start Plan" : cta}

                  </button>

                </div>
              </div>
            </div>

          ))}

        </div>

      </div>

    </section>

  )

}

