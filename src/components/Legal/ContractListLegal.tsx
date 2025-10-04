import { useState } from "react"
import ButtonBlue from "../ButtonBlue"
import { useNavigate } from "react-router-dom"

type Contract = {
  id: string
  name: string
  party: string
  value?: string
  risk?: "Low" | "Medium" | "High"
  clause?: string
  section?: string
  status?: "Pending" | "Reviewed" | "Revision Requested"
}

type ContractListLegalProps = {
  contracts: Contract[]
  variant: "dashboard" | "inbox" | "riskCenter"
}

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
        Previous
      </button>
      {pageNumbers.map((number) => (
        <button key={number} onClick={() => onPageChange(number)} className={`rounded border px-3 py-1.5 text-sm font-medium ${currentPage === number ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
          {number}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
        Next
      </button>
    </div>
  )
}

function StatusPill({ status }: { status?: string }) {
  const statusStyles: { [key: string]: string } = {
    Pending: "bg-yellow-100 text-yellow-700",
    Reviewed: "bg-green-100 text-green-700",
    "Revision Requested": "bg-purple-100 text-purple-700",
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status || ''] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

function RiskPill({ risk }: { risk?: "Low" | "Medium" | "High" }) {
  const riskStyles = {
    High: "bg-red-100 text-red-600",
    Medium: "bg-yellow-100 text-yellow-600",
    Low: "bg-green-100 text-green-600",
  }
  const riskKey = risk || "Low"
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${riskStyles[riskKey]}`}>
      {risk}
    </span>
  )
}

export default function ContractListLegal({ contracts, variant }: ContractListLegalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;
  const totalResults = contracts.length;
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentContracts = contracts.slice(startIndex, endIndex);
  const startItem = totalResults > 0 ? startIndex + 1 : 0;
  const endItem = Math.min(endIndex, totalResults);
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full table-auto text-sm">
        {variant === "dashboard" && ( <thead></thead> )}
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-6 py-3 font-medium">Contract</th>
            <th className="px-6 py-3 font-medium">Party</th>
            {variant === "riskCenter" && (
              <>
                <th className="px-6 py-3 font-medium">Clause</th>
                <th className="px-6 py-3 font-medium">Risk Level</th>
                <th className="px-6 py-3 font-medium">Section</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </>
            )}
            {variant !== "riskCenter" && <th className="px-6 py-3 font-medium">Value</th>}
            {variant !== "riskCenter" && <th className="px-6 py-3 font-medium">Risk Level</th>}
            <th className="px-6 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentContracts.map((c) => (
            <tr key={c.id} className="align-middle hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <div className="font-bold text-gray-800">{c.name.split(' with ')[0]}</div>
                  <div className="font-semibold text-gray-700">{c.name.split(' with ')[1]}</div>
                  <div className="text-gray-500">Contract Value: {c.value}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-700">{c.party}</td>
              {variant === "riskCenter" && (
                <>
                  <td className="px-6 py-4 text-gray-700">{c.clause ?? "-"}</td>
                  <td className="px-6 py-4"><RiskPill risk={c.risk} /></td>
                  <td className="px-6 py-4 text-gray-700">{c.section ?? "-"}</td>
                  <td className="px-6 py-4"><StatusPill status={c.status} /></td>
                </>
              )}
              {variant !== "riskCenter" && (
                <>
                  <td className="px-6 py-4">{c.value ?? "-"}</td>
                  <td className="px-6 py-4"><RiskPill risk={c.risk} /></td>
                </>
              )}
              <td className="px-6 py-4">
                <ButtonBlue
                  text="View Details"
                  onClick={() => navigate(`/legal/contracts/${c.id}`)} // arahkan ke detail
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{totalResults}</span> results
        </p>
        {totalPages > 1 && (
          <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>
        )}
      </div>
    </div>
  )
}