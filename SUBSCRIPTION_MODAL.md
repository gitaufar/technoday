# Subscription Modal Component

## Overview
Component modal untuk payment dan subscription dengan design modern, form validation, dan integrasi payment.

## Features

### ✨ Key Features:
- **Two-column layout**: Form di kiri, plan details di kanan
- **Payment form**: Card number, expiration date, CVV dengan auto-formatting
- **Billing information**: Full name, country, address
- **Real-time validation**: Input formatting untuk card number dan expiration date
- **Plan summary**: Display fitur plan dan pricing
- **Free trial CTA**: Option untuk start 14-day trial
- **Security badges**: SSL Encrypted & PCI Compliant indicators
- **Responsive design**: Works on mobile dan desktop
- **Loading states**: Spinner animation saat processing payment

## Component Props

```typescript
type SubscriptionModalProps = {
  isOpen: boolean           // Control modal visibility
  onClose: () => void       // Callback ketika modal ditutup
  planName: string          // Nama plan (e.g., "Professional")
  planPrice: number         // Harga dalam IDR (e.g., 250000)
  planFeatures: string[]    // Array of plan features
  onSuccess?: () => void    // Optional callback setelah payment success
}
```

## Usage Example

### Basic Usage:

```tsx
import { SubscriptionModal } from "@/components/SubscriptionModal"
import { useState } from "react"

function BillingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Upgrade Plan
      </button>

      <SubscriptionModal
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
          alert("Subscription successful!")
          // Handle post-payment logic here
        }}
      />
    </>
  )
}
```

### Advanced Usage with Plan Selection:

```tsx
import { SubscriptionModal } from "@/components/SubscriptionModal"
import { useState } from "react"

type PlanKey = "basic" | "premium" | "enterprise"

const PLANS = {
  premium: {
    name: "Professional",
    price: 250000,
    features: [
      "Up to 10,000 contracts / month",
      "AI Risk Analyzer",
      "100 GB storage",
      "Team collaboration & role management",
      "Priority email support",
      "Daily backup & 7-day log retention"
    ]
  },
  enterprise: {
    name: "Enterprise",
    price: 470000,
    features: [
      "Unlimited users",
      "Unlimited contracts",
      "Multi-company support",
      "Advanced reports",
      "24/7 SLA support"
    ]
  }
}

function BillingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null)

  const handleSelectPlan = (planKey: PlanKey) => {
    setSelectedPlan(planKey)
    setIsModalOpen(true)
  }

  const handlePaymentSuccess = async () => {
    if (!selectedPlan) return
    
    // Update subscription in database
    await updateSubscription(selectedPlan)
    
    // Refresh data
    await fetchSubscriptionData()
    
    // Close modal
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        {Object.entries(PLANS).map(([key, plan]) => (
          <div key={key} className="border rounded-lg p-6">
            <h3>{plan.name}</h3>
            <p>Rp {plan.price.toLocaleString()}/month</p>
            <button onClick={() => handleSelectPlan(key as PlanKey)}>
              Choose Plan
            </button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <SubscriptionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          planName={PLANS[selectedPlan].name}
          planPrice={PLANS[selectedPlan].price}
          planFeatures={PLANS[selectedPlan].features}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}
```

## Form Fields

### Payment Information:
1. **Card Number**
   - Auto-formatted dengan spaces (1234 5678 9012 3456)
   - Max 16 digits
   - Visa/Mastercard icons displayed

2. **Expiration Date**
   - Format: MM/YY
   - Auto-formatted dengan slash

3. **CVV**
   - 3 digits
   - Numbers only

4. **Business Checkbox**
   - Optional untuk business purchases

### Billing Information:
1. **Full Name**
   - Cardholder name

2. **Country/Region**
   - Dropdown dengan options: Indonesia, Singapore, Malaysia, Thailand, Philippines

3. **Address Line 1**
   - Required street address

4. **Address Line 2**
   - Optional (apartment, suite, etc.)

## Styling

### Design System:
- **Colors**: Blue primary (#3B82F6), Emerald success (#10B981), Slate neutrals
- **Rounded corners**: rounded-lg (8px), rounded-xl (12px), rounded-2xl (16px)
- **Shadows**: shadow-sm, shadow-xl
- **Typography**: Font sizes 12px-24px, font weights 400-700
- **Spacing**: Consistent padding/margin with Tailwind scale

### Responsive Breakpoints:
- **Mobile**: Single column layout, full-width
- **Desktop (lg)**: Two-column layout with sticky right sidebar

## Input Formatting

### Card Number:
```typescript
const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value.replace(/\s/g, "")  // Remove spaces
  value = value.replace(/\D/g, "")                 // Only digits
  value = value.substring(0, 16)                   // Max 16 digits
  const formatted = value.match(/.{1,4}/g)?.join(" ") || value
  setCardNumber(formatted)
}
```

### Expiration Date:
```typescript
const handleExpirationDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value.replace(/\D/g, "")  // Only digits
  if (value.length >= 2) {
    value = value.substring(0, 2) + "/" + value.substring(2, 4)
  }
  setExpirationDate(value)
}
```

### CVV:
```typescript
const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value.replace(/\D/g, "").substring(0, 3)
  setCvv(value)
}
```

## Currency Formatting

```typescript
const formatCurrency = (amount: number) => {
  return `Rp ${amount.toLocaleString("id-ID")}`
}

// Examples:
formatCurrency(250000)  // "Rp 250.000"
formatCurrency(470000)  // "Rp 470.000"
```

## Integration with Payment Gateway

### Future Implementation:
Modal ini siap untuk diintegrasikan dengan payment gateway seperti:
- **Midtrans**
- **Xendit**
- **Stripe**
- **PayPal**

### Example with Midtrans:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)

  try {
    // Create payment token
    const response = await fetch("/api/payment/create-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardNumber: cardNumber.replace(/\s/g, ""),
        expirationMonth: expirationDate.split("/")[0],
        expirationYear: "20" + expirationDate.split("/")[1],
        cvv,
        amount: planPrice
      })
    })

    const { token } = await response.json()

    // Process payment with token
    const paymentResponse = await fetch("/api/payment/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        planName,
        amount: planPrice
      })
    })

    if (paymentResponse.ok) {
      if (onSuccess) onSuccess()
      onClose()
    } else {
      alert("Payment failed. Please try again.")
    }
  } catch (error) {
    console.error("Payment error:", error)
    alert("An error occurred. Please try again.")
  } finally {
    setIsSubmitting(false)
  }
}
```

## Accessibility

### Features:
- ✅ Keyboard navigation support
- ✅ Focus states on all interactive elements
- ✅ Semantic HTML (form, label, button)
- ✅ ARIA labels where needed
- ✅ Escape key to close modal
- ✅ Click outside to close modal

### Keyboard Shortcuts:
- **Escape**: Close modal
- **Tab**: Navigate between fields
- **Enter**: Submit form (when focused on input)

## Security Considerations

### Display:
- ✅ SSL Encrypted badge
- ✅ PCI Compliant badge
- ✅ Lock icon on submit button
- ✅ Secure payment message

### Implementation Notes:
- Never store raw card data in frontend state longer than necessary
- Always use HTTPS in production
- Implement proper backend validation
- Use payment gateway tokenization
- Follow PCI-DSS compliance guidelines

## Testing Checklist

### Visual Testing:
- [ ] Modal opens/closes correctly
- [ ] Layout responsive on mobile and desktop
- [ ] All icons displayed properly
- [ ] Color scheme consistent
- [ ] Typography readable

### Functional Testing:
- [ ] Card number formats correctly
- [ ] Expiration date formats with slash
- [ ] CVV accepts only 3 digits
- [ ] Form validation works
- [ ] Submit button disabled states work
- [ ] Loading spinner appears during submission
- [ ] Success callback triggered after payment

### Edge Cases:
- [ ] Empty form submission prevented
- [ ] Invalid card number handling
- [ ] Expired card date validation
- [ ] Network error handling
- [ ] Payment gateway timeout handling

## Customization

### Change Colors:
```tsx
// In modal component, replace blue-* classes:
"bg-blue-600" → "bg-[#YOUR_COLOR]"
"text-blue-600" → "text-[#YOUR_COLOR]"
"border-blue-500" → "border-[#YOUR_COLOR]"
```

### Add Fields:
```tsx
// Add state:
const [newField, setNewField] = useState("")

// Add input in billing section:
<div>
  <label className="mb-1.5 block text-sm font-medium text-slate-700">
    New Field
  </label>
  <input
    type="text"
    value={newField}
    onChange={(e) => setNewField(e.target.value)}
    className="w-full rounded-lg border border-slate-300 px-4 py-2.5..."
  />
</div>
```

### Modify Features List:
Pass different features array via props:
```tsx
<SubscriptionModal
  planFeatures={[
    "Custom feature 1",
    "Custom feature 2",
    "Custom feature 3"
  ]}
/>
```

## Dependencies

Required packages (already in project):
- `react` - Core React library
- `lucide-react` - Icon library (X, Lock, Shield, Download)
- `tailwindcss` - Utility-first CSS framework

## File Location

```
src/
  components/
    SubscriptionModal.tsx  ← Main component file
```

## Notes

- Component uses controlled inputs untuk semua form fields
- Modal backdrop prevents body scroll when open
- Sticky header stays visible when scrolling modal content
- Right sidebar sticky on desktop untuk better UX
- All transitions smooth dengan Tailwind CSS classes
