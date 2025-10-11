import { useState } from "react"
import { SubscriptionModal } from "@/components/SubscriptionModal"

/**
 * Demo page untuk showcase SubscriptionModal component
 * Accessible via /demo/subscription-modal
 */
export const SubscriptionModalDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string
    price: number
    features: string[]
  } | null>(null)

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: 0,
      features: [
        "Up to 3 users",
        "100 contracts limit",
        "Basic upload & tracking",
        "Email support"
      ],
      color: "bg-slate-600"
    },
    {
      id: "professional",
      name: "Professional",
      price: 250,
      features: [
        "Up to 10,000 contracts / month",
        "AI Risk Analyzer",
        "100 GB storage",
        "Team collaboration & role management",
        "Priority email support",
        "Daily backup & 7-day log retention"
      ],
      color: "bg-blue-600"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 470,
      features: [
        "Unlimited users",
        "Unlimited contracts",
        "Multi-company support",
        "Advanced reports",
        "24/7 SLA support",
        "Dedicated account manager"
      ],
      color: "bg-orange-600"
    }
  ]

  const handleSelectPlan = (plan: typeof plans[0]) => {
    setSelectedPlan({
      name: plan.name,
      price: plan.price,
      features: plan.features
    })
    setIsModalOpen(true)
  }

  const handlePaymentSuccess = async (paymentData: {
    cardNumber: string
    expirationDate: string
    cvv: string
    fullName: string
    country: string
    addressLine1: string
    addressLine2: string
    isBusiness: boolean
  }) => {
    console.log("Payment Data:", {
      plan: selectedPlan?.name,
      price: selectedPlan?.price,
      ...paymentData
    })
    
    // Simulate invoice creation
    alert(`Successfully subscribed to ${selectedPlan?.name} plan!\n\nPayment Details:\n- Cardholder: ${paymentData.fullName}\n- Card: **** **** **** ${paymentData.cardNumber.slice(-4)}\n- Amount: $${selectedPlan?.price.toLocaleString()}`)
  }

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Free"
    return `$${amount.toLocaleString("en-US")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold text-slate-900">
            Subscription Modal Demo
          </h1>
          <p className="text-lg text-slate-600">
            Click any plan below to test the subscription modal
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition hover:shadow-xl"
            >
              {/* Plan Header */}
              <div className="mb-6 text-center">
                <h2 className="mb-2 text-2xl font-bold text-slate-900">{plan.name}</h2>
                <div className="mb-1">
                  <span className="text-4xl font-bold text-slate-900">
                    {formatCurrency(plan.price)}
                  </span>
                </div>
                {plan.price > 0 && (
                  <p className="text-sm text-slate-500">per month</p>
                )}
              </div>

              {/* Features */}
              <ul className="mb-6 flex-1 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => handleSelectPlan(plan)}
                className={`w-full rounded-full px-6 py-3 font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 ${plan.color}`}
              >
                {plan.price === 0 ? "Start Free" : "Subscribe Now"}
              </button>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-blue-900">
            💡 Demo Information
          </h3>
          <p className="text-sm text-blue-700">
            This is a demo page to showcase the SubscriptionModal component. 
            The payment form is functional but won't process actual payments.
            Check the console for callback events.
          </p>
        </div>

        {/* Code Example */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-900 p-6">
          <h3 className="mb-4 font-mono text-sm font-semibold text-emerald-400">
            Usage Example:
          </h3>
          <pre className="overflow-x-auto text-xs text-slate-300">
            <code>{`<SubscriptionModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  planName="Professional"
  planPrice={250000}
  planFeatures={[
    "Up to 10,000 contracts / month",
    "AI Risk Analyzer",
    "100 GB storage",
    "Team collaboration & role management",
    "Priority email support",
    "Daily backup & 7-day log retention"
  ]}
  onSuccess={() => {
    alert("Payment successful!")
  }}
/>`}</code>
          </pre>
        </div>
      </div>

      {/* Subscription Modal */}
      {selectedPlan && (
        <SubscriptionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedPlan(null)
          }}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          planFeatures={selectedPlan.features}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
