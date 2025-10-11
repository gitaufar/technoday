"use client"

import { useState } from 'react'
import { X, Lock, Check, CreditCard, Shield } from 'lucide-react'
import type { Plan, PaymentFormData } from './item'
import { plans } from './item'

interface PaymentTemplateProps {
  isOpen: boolean
  onClose: () => void
  selectedPlan?: Plan
  onSuccess?: () => void
}

export default function PaymentTemplate({ 
  isOpen, 
  onClose, 
  selectedPlan = plans[0],
  onSuccess 
}: PaymentTemplateProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    fullName: '',
    country: 'Indonesia',
    addressLine1: '',
    addressLine2: '',
    isPurchasingAsBusiness: false
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setFormData(prev => ({ ...prev, cardNumber: formatted }))
  }

  const formatExpirationDate = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`
    }
    return v
  }

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpirationDate(e.target.value)
    setFormData(prev => ({ ...prev, expirationDate: formatted }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false)
      onSuccess?.()
      onClose()
    }, 2000)
  }

  const handleStartFreeTrial = () => {
    onSuccess?.()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Complete Your Subscription</h2>
            <p className="text-sm text-slate-500">Secure payment powered by OptiMind</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          
          {/* Left Side - Payment Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Payment Information</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-16"
                      maxLength={19}
                      required
                    />
                    <div className="absolute right-3 top-2.5 flex gap-1">
                      <div className="w-6 h-4 bg-blue-500 rounded-sm"></div>
                      <div className="w-6 h-4 bg-red-500 rounded-sm"></div>
                      <div className="w-6 h-4 bg-orange-500 rounded-sm"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Expiration Date</label>
                    <input
                      type="text"
                      name="expirationDate"
                      value={formData.expirationDate}
                      onChange={handleExpirationChange}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPurchasingAsBusiness"
                    name="isPurchasingAsBusiness"
                    checked={formData.isPurchasingAsBusiness}
                    onChange={handleInputChange}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isPurchasingAsBusiness" className="text-sm text-slate-600">
                    I'm purchasing as a business
                  </label>
                </div>
              </div>

              {/* Billing Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Billing Information</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Country/Region</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Indonesia">Indonesia</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Thailand">Thailand</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Address Line 1</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, etc."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Charge Summary */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900">Charge Today:</span>
                  <span className="text-xl font-bold text-slate-900">
                    {selectedPlan.currency} {selectedPlan.price.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">Monthly subscription - Cancel anytime</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" />
                {isLoading ? 'Processing...' : 'Confirm & Subscribe'}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Shield className="h-3 w-3" />
                Your payment information is encrypted and secure
              </div>
            </form>
          </div>

          {/* Right Side - Plan Details */}
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 text-lg mb-4">
                Upgrade to {selectedPlan.name}
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Unlock unlimited contracts, AI insights, and risk monitoring
              </p>
              
              <div className="space-y-3">
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-blue-800">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-600">{selectedPlan.name}</span>
                <span className="font-semibold">{selectedPlan.currency} {selectedPlan.price.toLocaleString('id-ID')}</span>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900">Total per month</span>
                  <span className="text-xl font-bold text-blue-600">
                    {selectedPlan.currency} {selectedPlan.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Free Trial Option */}
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-3">Want to try before you buy?</p>
              <button
                onClick={handleStartFreeTrial}
                className="w-full bg-white border border-slate-300 text-slate-700 py-2 px-4 rounded-lg font-medium hover:bg-slate-50"
              >
                Start 14-day Free Trial
              </button>
              <p className="text-xs text-slate-500 mt-2">No credit card required</p>
            </div>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                SSL Encrypted
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                PCI Compliant
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}