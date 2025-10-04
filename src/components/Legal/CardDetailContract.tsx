import type { ReactNode } from 'react';

// Tipe data untuk properti yang akan diterima komponen
type ContractDetailsProps = {
  firstParty: string;
  secondParty: string;
  contractValue: string;
  status: 'On Review' | 'Active' | 'Expired';
  duration: string;
  startDate: string;
  penalty: string;
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
};

// Sub-komponen untuk setiap item detail (label + value)
function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-800">{children}</p>
    </div>
  );
}

// Sub-komponen untuk badge Status
function StatusBadge({ status }: { status: ContractDetailsProps['status'] }) {
  const styles = {
    'On Review': 'bg-orange-100 text-orange-700',
    'Active': 'bg-green-100 text-green-700',
    'Expired': 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  );
}

// Sub-komponen untuk badge Risk Level
function RiskBadge({ risk }: { risk: ContractDetailsProps['riskLevel'] }) {
  const styles = {
    'High Risk': 'bg-red-100 text-red-700',
    'Medium Risk': 'bg-yellow-100 text-yellow-700',
    'Low Risk': 'bg-green-100 text-green-700',
  };
  return (
    <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${styles[risk]}`}>
      {risk}
    </span>
  );
}


// Komponen Utama
export default function CardDetailContract({ contract }: { contract: ContractDetailsProps }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-900">
        Contract Information
      </h2>
      <div className="grid grid-cols-4 gap-x-6 gap-y-5">
        {/* Baris 1 */}
        <DetailItem label="First party">{contract.firstParty}</DetailItem>
        <DetailItem label="Second party">{contract.secondParty}</DetailItem>
        <DetailItem label="Contract Value">{contract.contractValue}</DetailItem>
        <DetailItem label="Status">
          <StatusBadge status={contract.status} />
        </DetailItem>

        {/* Baris 2 */}
        <DetailItem label="Duration">{contract.duration}</DetailItem>
        <DetailItem label="Start Date">{contract.startDate}</DetailItem>
        <DetailItem label="Penalty">{contract.penalty}</DetailItem>
        <DetailItem label="Risk Level">
          <RiskBadge risk={contract.riskLevel} />
        </DetailItem>
      </div>
    </div>
  );
}