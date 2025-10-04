"use client"

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type {
  ChangeEvent,
  Dispatch,
  InputHTMLAttributes,
  SetStateAction,
  TextareaHTMLAttributes,
} from 'react'
import { useCreateContract } from '@/hooks/useProcurement'

type Step = 1 | 2 | 3 | 4

type FormState = {
  name: string
  first_party: string
  second_party: string
  contract_type: string
  first_address: string
  second_address: string
  first_contact: string
  second_contact: string
  summary: string
  value_rp: number
  currency: string
  duration_months: number
  duration_unit: string
  renewal: string
  payment_method: string
  payment_terms: string
  start_date: string
  end_date: string
  payment_terms_detail: string
  delivery_acceptance: string
  penalty_provisions: string
  force_majeure: string
  other_terms: string
}

const STEP_CONFIG: Array<{ id: Step; title: string }> = [
  { id: 1, title: 'Contract Parties' },
  { id: 2, title: 'Contract Details' },
  { id: 3, title: 'Key Clauses' },
  { id: 4, title: 'Review' },
]

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const BELOW_TWENTY = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
]

const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
const THOUSANDS = ['', 'thousand', 'million', 'billion', 'trillion']

function numberChunkToWords(num: number): string {
  if (num === 0) return ''
  if (num < 20) return BELOW_TWENTY[num]
  if (num < 100) {
    return `${TENS[Math.floor(num / 10)]}${num % 10 ? ' ' + numberChunkToWords(num % 10) : ''}`
  }
  return `${BELOW_TWENTY[Math.floor(num / 100)]} hundred${num % 100 ? ' ' + numberChunkToWords(num % 100) : ''}`
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero'
  const segments: string[] = []
  let remaining = num
  let chunkIndex = 0
  while (remaining > 0) {
    const chunk = remaining % 1000
    if (chunk) {
      const words = numberChunkToWords(chunk)
      const suffix = THOUSANDS[chunkIndex]
      segments.unshift(`${words}${suffix ? ' ' + suffix : ''}`)
    }
    remaining = Math.floor(remaining / 1000)
    chunkIndex += 1
  }
  const sentence = segments.join(' ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1)
}

function formatCurrency(value: number): string {
  if (!value) return '-'
  return currencyFormatter.format(value)
}

function formatCurrencyInWords(value: number): string {
  if (!value) return ''
  return `${numberToWords(Math.floor(value))} Rupiah`
}

function formatDate(value: string): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return dateFormatter.format(date)
}

export default function DraftContract() {
  const { create } = useCreateContract()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormState>({
    name: '',
    first_party: 'PT Integrasi Logistik Cipta Solusi (ILCS)',
    second_party: '',
    contract_type: '',
    first_address: '',
    second_address: '',
    first_contact: '',
    second_contact: '',
    summary: '',
    value_rp: 0,
    currency: 'Indonesian Rupiah (IDR)',
    duration_months: 12,
    duration_unit: 'Months',
    renewal: 'Yes',
    payment_method: 'Bank Transfer',
    payment_terms: 'Net 30 Days',
    start_date: '',
    end_date: '',
    payment_terms_detail: '',
    delivery_acceptance: '',
    penalty_provisions: '',
    force_majeure: '',
    other_terms: '',
  })

  const currentStep = useMemo(() => STEP_CONFIG.find((cfg) => cfg.id === step)!, [step])

  function next() {
    setStep((s) => (s < 4 ? ((s + 1) as Step) : s))
  }

  function prev() {
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s))
  }

  async function saveDraft() {
    await create({
      name: form.name,
      first_party: form.first_party,
      second_party: form.second_party,
      value_rp: form.value_rp,
      duration_months: form.duration_months,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: 'Draft',
    })
    alert('Draft disimpan sebagai Draft')
  }

  async function generateDraft() {
    await create({
      name: form.name,
      first_party: form.first_party,
      second_party: form.second_party,
      value_rp: form.value_rp,
      duration_months: form.duration_months,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: 'Submitted',
    })
    alert('Draft telah dikirim ke Legal')
    navigate('/procurement')
  }

  return (
    <div className="space-y-6">
      <StepHeader step={step} />
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Draft Contract</h1>
          <p className="text-sm text-slate-500">Create a new contract using our step-by-step wizard.</p>
        </header>

        <div className="mt-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">Step {step}: {currentStep.title}</h2>
            <p className="text-sm text-slate-500">
              {step === 1 && 'Enter the details of the contracting parties.'}
              {step === 2 && 'Please provide the contract financial and timeline information.'}
              {step === 3 && 'Define key clauses and terms for your contract.'}
              {step === 4 && 'Review and confirm.'}
            </p>
          </div>
          {step === 1 && <Step1 form={form} setForm={setForm} />}
          {step === 2 && <Step2 form={form} setForm={setForm} />}
          {step === 3 && <Step3 form={form} setForm={setForm} />}
          {step === 4 && <Step4 form={form} />}
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={saveDraft}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              Save Draft
            </button>
            <span className="text-xs text-slate-400">Auto-saved 2 minutes ago</span>
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={prev}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
                Previous
              </button>
            )}
            {step < 4 && (
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2 font-medium text-white shadow-sm transition hover:bg-orange-600"
              >
                Next
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </button>
            )}
            {step === 4 && (
              <button
                type="button"
                onClick={generateDraft}
                className="rounded-xl bg-emerald-600 px-5 py-2 font-medium text-white shadow-sm transition hover:bg-emerald-700"
              >
                Generate Draft
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}

function StepHeader({ step }: { step: Step }) {
  return (
    <div className="rounded-full bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {STEP_CONFIG.map((item, idx) => {
          const active = item.id <= step
          const isCurrent = item.id === step
          return (
            <div key={item.id} className="flex flex-1 items-center gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition ${
                    active ? 'border-[#357ABD] bg-[#357ABD] text-white' : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {item.id}
                </div>
                <div className="hidden flex-col text-sm text-slate-500 md:flex">
                  <span className={`font-medium ${isCurrent ? 'text-slate-900' : ''}`}>{item.title}</span>
                </div>
              </div>
              {idx < STEP_CONFIG.length - 1 && (
                <div className={`h-px flex-1 ${item.id < step ? 'bg-[#357ABD]' : 'bg-slate-200'}`} aria-hidden />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Field({ label, children, hint, className }: { label: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <label className={`space-y-2 text-sm ${className ?? ''}`}>
      <span className="block font-medium text-slate-600">{label}</span>
      {hint && <span className="block whitespace-pre-line text-xs text-slate-400">{hint}</span>}
      {children}
    </label>
  )
}

function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props
  return (
    <input
      {...rest}
      className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#357ABD] focus:ring-2 focus:ring-[#357ABD]/20 ${
        className ?? ''
      }`}
    />
  )
}

function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props
  return (
    <textarea
      {...rest}
      className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#357ABD] focus:ring-2 focus:ring-[#357ABD]/20 ${
        className ?? ''
      }`}
    />
  )
}

type StepProps = {
  form: FormState
  setForm: Dispatch<SetStateAction<FormState>>
}

function Step1({ form, setForm }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Field label="Name of the First Party">
          <Input
            placeholder="PT ILCS (Indonesia Logistics and Cargo Services)"
            value={form.first_party}
            onChange={(event) => setForm((f) => ({ ...f, first_party: event.target.value }))}
          />
        </Field>
        <Field label="Name of the Second Party">
          <Input
            placeholder="Enter the name of the Second Party"
            value={form.second_party}
            onChange={(event) => setForm((f) => ({ ...f, second_party: event.target.value }))}
          />
        </Field>
        <Field label="Contract Name">
          <Input
            placeholder="Enter contract name"
            value={form.name}
            onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="First Party Address">
            <Textarea
              rows={3}
              placeholder="Enter full address"
              value={form.first_address}
              onChange={(event) => setForm((f) => ({ ...f, first_address: event.target.value }))}
            />
          </Field>
          <Field label="Second Party Address">
            <Textarea
              rows={3}
              placeholder="Enter full address"
              value={form.second_address}
              onChange={(event) => setForm((f) => ({ ...f, second_address: event.target.value }))}
            />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="First Party Contact Person" hint="Name and position">
            <Input
              placeholder="Name and position"
              value={form.first_contact}
              onChange={(event) => setForm((f) => ({ ...f, first_contact: event.target.value }))}
            />
          </Field>
          <Field label="Second Party Contact Person" hint="Name and position">
            <Input
              placeholder="Name and position"
              value={form.second_contact}
              onChange={(event) => setForm((f) => ({ ...f, second_contact: event.target.value }))}
            />
          </Field>
        </div>
      </div>
    </div>
  )
}

const CURRENCY_OPTIONS = ['Indonesian Rupiah (IDR)', 'US Dollar (USD)', 'Euro (EUR)']
const DURATION_UNITS = ['Months', 'Years']
const RENEWAL_OPTIONS = ['Yes', 'No']
const PAYMENT_METHOD_OPTIONS = ['Bank Transfer', 'Cash', 'Credit Card', 'E-Invoice']
const PAYMENT_TERMS_OPTIONS = ['Net 30 Days', 'Net 45 Days', 'Net 60 Days', 'Milestone Based']

function Step2({ form, setForm }: StepProps) {
  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const numericValue = event.target.value.replace(/[^0-9]/g, '')
    setForm((f) => ({ ...f, value_rp: Number(numericValue) }))
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-600">Contract Value</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Contract Value (IDR) *">
            <div className="flex items-center rounded-xl border border-slate-300 bg-white shadow-sm transition focus-within:border-[#357ABD] focus-within:ring-2 focus-within:ring-[#357ABD]/20">
              <span className="border-r border-slate-200 px-3 py-2 text-sm font-medium text-slate-500">IDR</span>
              <input
                className="flex-1 border-0 bg-transparent px-3 py-2 text-sm text-slate-700 outline-none"
                placeholder="1,500,000,000"
                inputMode="numeric"
                value={form.value_rp ? form.value_rp.toLocaleString('id-ID') : ''}
                onChange={handleValueChange}
              />
            </div>
          </Field>
          <Field label="Currency">
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#357ABD] focus:ring-2 focus:ring-[#357ABD]/20"
              value={form.currency}
              onChange={(event) => setForm((f) => ({ ...f, currency: event.target.value }))}
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-600">Contract Duration</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Duration *">
            <Input
              type="number"
              placeholder="12"
              value={form.duration_months}
              onChange={(event) => setForm((f) => ({ ...f, duration_months: Number(event.target.value) }))}
            />
          </Field>
          <Field label="Unit">
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#357ABD] focus:ring-2 focus:ring-[#357ABD]/20"
              value={form.duration_unit}
              onChange={(event) => setForm((f) => ({ ...f, duration_unit: event.target.value }))}
            >
              {DURATION_UNITS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Renewable">
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#357ABD] focus:ring-2 focus:ring-[#357ABD]/20"
              value={form.renewal}
              onChange={(event) => setForm((f) => ({ ...f, renewal: event.target.value }))}
            >
              {RENEWAL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-600">Contract Timeline</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Start Date *">
            <Input
              type="date"
              value={form.start_date}
              onChange={(event) => setForm((f) => ({ ...f, start_date: event.target.value }))}
            />
          </Field>
          <Field label="End Date *">
            <Input
              type="date"
              value={form.end_date}
              onChange={(event) => setForm((f) => ({ ...f, end_date: event.target.value }))}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-600">Payment Terms</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Payment Method *">
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#357ABD] focus:ring-2 focus:ring-[#357ABD]/20"
              value={form.payment_method}
              onChange={(event) => setForm((f) => ({ ...f, payment_method: event.target.value }))}
            >
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Payment Terms *">
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#357ABD] focus:ring-2 focus:ring-[#357ABD]/20"
              value={form.payment_terms}
              onChange={(event) => setForm((f) => ({ ...f, payment_terms: event.target.value }))}
            >
              {PAYMENT_TERMS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>
    </div>
  )
}

function Step3({ form, setForm }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Field
          label="Payment Terms"
          hint={`Example: Payment shall be made in three instalments:\n� 30% upon contract signing\n� 40% upon delivery of goods\n� 30% upon final acceptance`}
        >
          <Textarea
            rows={4}
            placeholder="Describe payment breakdown, milestones, due dates..."
            value={form.payment_terms_detail}
            onChange={(event) => setForm((f) => ({ ...f, payment_terms_detail: event.target.value }))}
          />
        </Field>
        <Field
          label="Delivery & Acceptance"
          hint="Example: The Second Party is required to deliver goods in accordance with the specified requirements within a maximum of 30 working days."
        >
          <Textarea
            rows={3}
            placeholder="Outline delivery schedule, acceptance criteria, SLAs..."
            value={form.delivery_acceptance}
            onChange={(event) => setForm((f) => ({ ...f, delivery_acceptance: event.target.value }))}
          />
        </Field>
        <Field
          label="Penalty Provisions"
          hint="Example: In case of delivery delays, a penalty of 0.1% per day of the contract value shall be imposed."
        >
          <Textarea
            rows={3}
            placeholder="Detail penalty clauses, liquidated damages or escalation steps..."
            value={form.penalty_provisions}
            onChange={(event) => setForm((f) => ({ ...f, penalty_provisions: event.target.value }))}
          />
        </Field>
        <Field
          label="Force Majeure"
          hint="Example: Both parties shall be released from their obligations in the event of force majeure circumstances."
        >
          <Textarea
            rows={3}
            placeholder="State the events considered force majeure and notification obligations..."
            value={form.force_majeure}
            onChange={(event) => setForm((f) => ({ ...f, force_majeure: event.target.value }))}
          />
        </Field>
        <Field
          label="Other Terms"
          hint="Example: Any amendments or additions to this contract must be made in writing and agreed upon by both parties."
        >
          <Textarea
            rows={3}
            placeholder="Add other special conditions, exclusivity, confidentiality, etc..."
            value={form.other_terms}
            onChange={(event) => setForm((f) => ({ ...f, other_terms: event.target.value }))}
          />
        </Field>
      </div>
    </div>
  )
}

function Step4({ form }: { form: FormState }) {
  const formattedValue = formatCurrency(form.value_rp)
  const valueInWords = formatCurrencyInWords(form.value_rp)

  const keyClauseItems: Array<{ title: string; value: string }> = [
    { title: 'Payment Terms', value: form.payment_terms_detail },
    { title: 'Delivery & Acceptance', value: form.delivery_acceptance },
    { title: 'Penalty Provisions', value: form.penalty_provisions },
    { title: 'Force Majeure', value: form.force_majeure },
    { title: 'Other Terms', value: form.other_terms },
  ]

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-600">Contract Parties</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <SummaryField label="First Party" value={form.first_party || '-'} />
          <SummaryField label="Second Party" value={form.second_party || '-'} />
          <SummaryField label="Contract Type" className="md:col-span-2">
            {form.contract_type ? (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {form.contract_type}
              </span>
            ) : (
              <span className="text-slate-500">-</span>
            )}
          </SummaryField>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-600">Contract Details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <SummaryField label="Contract Value">
            <div className="space-y-1">
              <div className="text-lg font-semibold text-emerald-600">{formattedValue}</div>
              {valueInWords && <div className="text-xs text-emerald-700">{valueInWords}</div>}
            </div>
          </SummaryField>
          <SummaryField label="Contract Duration" value={`${form.duration_months || '-'} ${form.duration_unit}`} />
          <SummaryField label="Start Date" value={formatDate(form.start_date)} />
          <SummaryField label="End Date" value={formatDate(form.end_date)} />
          <SummaryField label="Payment Method" value={form.payment_method || '-'} />
          <SummaryField label="Payment Terms" value={form.payment_terms || '-'} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-600">Key Clauses</h3>
        <div className="grid gap-3">
          {keyClauseItems.map((item) => (
            <ClauseCard key={item.title} title={item.title} value={item.value} />
          ))}
          {form.summary && <ClauseCard title="Contract Summary" value={form.summary} />}
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span className="text-base">?</span>
          Menggunakan template standar ILCS
        </div>
      </section>
    </div>
  )
}

function SummaryField({ label, value, className, children }: { label: string; value?: string; className?: string; children?: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 ${className ?? ''}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm text-slate-700">{children ?? value ?? '-'}</div>
    </div>
  )
}

function ClauseCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="text-sm text-slate-700 whitespace-pre-wrap">{value || '-'}</div>
    </div>
  )
}
