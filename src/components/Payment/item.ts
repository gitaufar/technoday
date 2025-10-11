export interface Plan {
  id: string
  name: string
  price: number
  currency: string
  features: string[]
  popular?: boolean
}

export const plans: Plan[] = [
  {
    id: 'professional',
    name: 'Professional Plan',
    price: 220,
    currency: '$',
    popular: true,
    features: [
      'Up to 10,000 contracts / month',
      'AI Risk Analyzer',
      '100 GB storage',
      'Team collaboration & role management',
      'Priority email support',
      'Daily backup & 7-day log retention'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 470,
    currency: '$',
    features: [
      'Unlimited contracts',
      'Advanced AI Risk Analyzer',
      'Unlimited storage',
      'Advanced team collaboration',
      '24/7 priority support',
      'Real-time backup & 30-day log retention',
      'Custom integrations',
      'Dedicated account manager'
    ]
  }
]

export interface PaymentFormData {
  cardNumber: string
  expirationDate: string
  cvv: string
  fullName: string
  country: string
  addressLine1: string
  addressLine2?: string
  isPurchasingAsBusiness: boolean
}