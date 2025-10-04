"use client"

import { useMemo, useState } from 'react'
import type { ChangeEvent, InputHTMLAttributes } from 'react'
import { useContractsList, useStatusFiltering } from '@/hooks/useProcurement'
import type { ContractRow, Risk, Status } from '@/types/procurement'

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'All', label: 'All Status' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Reviewed', label: 'Reviewed' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Revision Requested', label: 'Revision Requested' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Active', label: 'Active' },
  { value: 'Expired', label: 'Expired' },
]

const RISK_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'All', label: 'All Risk Levels' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
]

const STATUS_BADGE: Partial<Record<Status, string>> = {
  Draft: 'bg-blue-100 text-blue-700 border border-blue-200',
  Submitted: 'bg-gray-100 text-gray-600 border border-gray-300',
  Reviewed: 'bg-orange-100 text-orange-700 border border-orange-200',
  Approved: 'bg-green-100 text-green-700 border border-green-200',
  'Revision Requested': 'bg-red-100 text-red-700 border border-red-200',
  Rejected: 'bg-red-100 text-red-700 border border-red-200',
  Active: 'bg-green-100 text-green-700 border border-green-200',
  Expired: 'bg-red-100 text-red-800 border border-red-300',
}

const RISK_BADGE: Partial<Record<Risk, string>> = {
  Low: 'bg-green-100 text-green-700 border border-green-200',
  Medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  High: 'bg-red-100 text-red-700 border border-red-200',
}

const DATE_DISPLAY_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function StatusTracking() {
  const { rows, loading } = useContractsList()
  const { status, setStatus, risk, setRisk, q, setQ, from, setFrom, to, setTo, filtered } = useStatusFiltering(rows)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Reset pagination when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [status, risk, q, from, to])

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRows = filtered.slice(startIndex, endIndex)

  // Filter contracts based on status and active/expired logic
  const displayRows = useMemo(() => {
    if (status === 'Active') {
      return paginatedRows.filter(row => isContractActive(row))
    }
    if (status === 'Expired') {
      return paginatedRows.filter(row => !isContractActive(row))
    }
    return paginatedRows
  }, [paginatedRows, status])

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Status Tracking</h1>
        <p className="text-sm text-slate-500">Monitor and track all contract statuses and progress.</p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="grid gap-3 md:grid-cols-5">
          <FilterSelect
            label="Filter by Status"
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
            options={STATUS_OPTIONS}
          />
          <FilterSelect
            label="Filter by Risk"
            value={risk}
            onChange={(event) => setRisk(event.target.value as typeof risk)}
            options={RISK_OPTIONS}
          />
          <FilterInput
            label="Start Date"
            type="date"
            value={from}
            placeholder="Start date"
            onChange={(event) => setFrom(event.target.value)}
          />
          <FilterInput
            label="End Date"
            type="date"
            value={to}
            placeholder="End date"
            onChange={(event) => setTo(event.target.value)}
          />
          <div className="space-y-2">
            <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">Search</span>
            <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm focus-within:border-[#357ABD] focus-within:ring-2 focus-within:ring-[#357ABD]/20">
              <svg
                aria-hidden
                className="h-4 w-4 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" />
              </svg>
              <input
                className="ml-2 flex-1 border-0 bg-transparent text-sm text-slate-700 outline-none"
                placeholder="Search contract name or party..."
                value={q}
                onChange={(event) => setQ(event.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Contract</th>
                <th className="px-6 py-3">Parties</th>
                <th className="px-6 py-3">Contract Value</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Risk</th>
                <th className="px-6 py-3">Last Update</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading && (
                <tr>
                  <td className="px-6 py-10 text-center text-slate-500" colSpan={8}>
                    Loading contracts...
                  </td>
                </tr>
              )}

              {!loading && displayRows.length === 0 && (
                <tr>
                  <td className="px-6 py-10 text-center text-slate-500" colSpan={8}>
                    No contracts match the selected filters.
                  </td>
                </tr>
              )}

              {!loading &&
                displayRows.map((row) => <StatusRow key={row.id} row={row} />)}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
          <span>
            Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} contracts
          </span>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Real-time updates enabled
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded px-2 py-1 ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </footer>
      </section>
    </div>
  )
}

function isContractActive(row: ContractRow): boolean {
  if (!row.start_date || !row.end_date) return false
  
  const now = new Date()
  const startDate = new Date(row.start_date)
  const endDate = new Date(row.end_date)
  
  // Normalize dates to just the date part (remove time)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const contractStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const contractEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  
  // Debug logging
  console.log(`Contract ${row.id}:`, {
    start_date: row.start_date,
    end_date: row.end_date,
    today: today.toISOString().split('T')[0],
    contractStart: contractStart.toISOString().split('T')[0],
    contractEnd: contractEnd.toISOString().split('T')[0],
    isActive: today >= contractStart && today <= contractEnd
  })
  
  return today >= contractStart && today <= contractEnd
}

function StatusRow({ row }: { row: ContractRow }) {
  const statusClass = STATUS_BADGE[row.status] ?? 'bg-slate-100 text-slate-600 border border-slate-200'
  const riskClass = row.risk ? RISK_BADGE[row.risk] ?? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-slate-100 text-slate-400 border border-slate-200'

  return (
    <tr className="align-top">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${
            isContractActive(row) ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <div>
            <div className="font-semibold text-slate-900">{row.name || 'Unnamed Contract'}</div>
            <div className="text-xs text-slate-500">#{row.id.slice(0, 8).toUpperCase()}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-slate-800">{row.first_party || 'N/A'}</div>
        <div className="text-xs text-slate-500">{row.second_party || 'N/A'}</div>
      </td>
      <td className="px-6 py-4">
        <div className="font-semibold text-slate-800">{formatValueShort(row.value_rp)}</div>
      </td>
      <td className="px-6 py-4 text-slate-600">
        {formatDuration(row)}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
          {getStatusIcon()}
          {formatStatusLabel(row.status)}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${riskClass}`}>
          {row.risk || 'N/A'}
        </span>
      </td>
      <td className="px-6 py-4 text-slate-500">{formatRelativeTime(row.updated_at ?? row.created_at)}</td>
      <td className="px-6 py-4 text-right">
        <a
          href={`/procurement/contracts/${row.id}`}
          className="inline-flex items-center rounded-full bg-blue-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-600 whitespace-nowrap"
        >
          <span className="text-white">View Details</span>
        </a>
      </td>
    </tr>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <div className="space-y-2">
      <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <select
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#357ABD] focus:ring-2 focus:ring-[#357ABD]/20"
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function FilterInput({ label, ...inputProps }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <input
        {...inputProps}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#357ABD] focus:ring-2 focus:ring-[#357ABD]/20"
      />
    </div>
  )
}

function getStatusIcon(): React.ReactNode {
  return null
}

function formatStatusLabel(status: Status): string {
  switch (status) {
    case 'Submitted':
      return 'Submitted'
    case 'Reviewed':
      return 'Reviewed'
    case 'Approved':
      return 'Approved'
    case 'Revision Requested':
      return 'Revision Requested'
    case 'Draft':
      return 'Draft'
    case 'Rejected':
      return 'Rejected'
    case 'Active':
      return 'Active'
    case 'Expired':
      return 'Expired'
  }
}

function formatDate(value: string): string {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return DATE_DISPLAY_FORMATTER.format(date)
}

function formatValueShort(value: number | null): string {
  if (!value) return 'N/A'
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)}M`
  }
  return `Rp ${value.toLocaleString('id-ID')}`
}

function formatDuration(row: ContractRow): string {
  if (row.start_date && row.end_date) {
    return `${formatDate(row.start_date)} - ${formatDate(row.end_date)}`
  }
  if (row.duration_months) {
    return `${row.duration_months} months`
  }
  return 'N/A'
}

function formatRelativeTime(isoDate: string): string {
  if (!isoDate) return 'N/A'
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return 'N/A'
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
  const diffYears = Math.floor(diffDays / 365)
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`
}



