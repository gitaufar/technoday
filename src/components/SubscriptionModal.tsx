import { X, Lock, Shield } from "lucide-react"
import { useState } from "react"

type PaymentData = {
  cardNumber: string
  expirationDate: string
  cvv: string
  fullName: string
  country: string
  addressLine1: string
  addressLine2: string
  isBusiness: boolean
}

type SubscriptionModalProps = {
  isOpen: boolean
  onClose: () => void
  planName: string
  planPrice: number
  planFeatures: string[]
  onSuccess?: (paymentData: PaymentData) => void | Promise<void>
}

export const SubscriptionModal = ({
  isOpen,
  onClose,
  planName,
  planPrice,
  planFeatures,
  onSuccess
}: SubscriptionModalProps) => {
  const [cardNumber, setCardNumber] = useState("")
  const [expirationDate, setExpirationDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [fullName, setFullName] = useState("")
  const [country, setCountry] = useState("Indonesia")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [isBusiness, setIsBusiness] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Format card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, "")
    value = value.replace(/\D/g, "")
    value = value.substring(0, 16)
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value
    setCardNumber(formatted)
  }

  // Format expiration date MM/YY
  const handleExpirationDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4)
    }
    setExpirationDate(value)
  }

  // Format CVV
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 3)
    setCvv(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!cardNumber || !expirationDate || !cvv || !fullName || !addressLine1) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Prepare payment data
      const paymentData: PaymentData = {
        cardNumber: cardNumber.replace(/\s/g, ""),
        expirationDate,
        cvv,
        fullName,
        country,
        addressLine1,
        addressLine2,
        isBusiness
      }

      // Call success callback if provided
      if (onSuccess) {
        await onSuccess(paymentData)
      }

      onClose()
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Complete Your Subscription</h2>
            <p className="text-sm text-slate-500">Secure payment powered by OptiMind</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Payment Information */}
            <div>
              <h3 className="mb-4 text-base font-semibold text-slate-900">Payment Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <div className="absolute right-3 top-1/2 flex -translate-y-1/2 gap-1">
                      <div className="h-5 w-7 rounded bg-gradient-to-br from-orange-500 to-red-500"></div>
                      <div className="h-5 w-7 rounded bg-gradient-to-br from-blue-600 to-blue-800"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      value={expirationDate}
                      onChange={handleExpirationDateChange}
                      placeholder="MM/YY"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">CVV</label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={handleCvvChange}
                      placeholder="123"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="business"
                    checked={isBusiness}
                    onChange={(e) => setIsBusiness(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <label htmlFor="business" className="text-sm text-slate-600">
                    I'm purchasing as a business
                  </label>
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div>
              <h3 className="mb-4 text-base font-semibold text-slate-900">Billing Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Country/Region
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Indonesia">Indonesia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Philippines">Philippines</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Street address"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Apartment, suite, etc."
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Charge Summary */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-slate-700">Charge Today:</span>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(planPrice)}</span>
              </div>
              <p className="text-xs text-slate-500">Monthly subscription - Cancel anytime</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Lock className="h-4 w-4" />
              {isSubmitting ? "Processing..." : "Confirm & Subscribe"}
            </button>

            <p className="text-center text-xs text-slate-500">
              <Lock className="mr-1 inline h-3 w-3" />
              Your payment information is encrypted and secure
            </p>
          </div>

          {/* Right Column - Plan Details */}
          <div className="lg:pl-6">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-blue-600">
                  Upgrade to {planName}
                </h3>
                <p className="text-sm text-slate-600">
                  Unlock unlimited contracts, AI insights, and risk monitoring
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-3">
                {planFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="mt-0.5 flex-shrink-0 rounded-full bg-emerald-100 p-1">
                      <svg
                        className="h-3 w-3 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Pricing Summary */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-slate-600">{planName}</span>
                  <span className="font-medium text-slate-900">{formatCurrency(planPrice)}</span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Total per month</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(planPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Free Trial CTA */}
              <div className="space-y-3">
                <p className="text-center text-sm text-slate-500">Want to try before you buy?</p>
                <button
                  type="button"
                  className="w-full rounded-lg border-2 border-blue-600 bg-white px-4 py-2.5 font-semibold text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Start 14-day Free Trial
                </button>
                <p className="text-center text-xs text-slate-400">No credit card required</p>
              </div>

              {/* Security Badges */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Shield className="h-4 w-4" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Lock className="h-4 w-4" />
                  <span>PCI Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
