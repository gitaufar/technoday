// components/Legal/ContractEntitiesCard.tsx
import React from 'react';

// Sub-komponen untuk setiap item entitas
function EntityItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  );
}

// Komponen utama ContractEntitiesCard
export default function ContractEntitiesCard({ entities }: { entities: any }) {
  if (!entities) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-base font-bold text-gray-800">📄 Contract Entities</h3>
        <p className="text-sm text-gray-500">No entities extracted yet.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-base font-bold text-gray-800">📄 Contract Entities</h3>
      <div className="grid grid-cols-1 gap-4 text-sm">
        <EntityItem label="First Party" value={entities.first_party ?? '-'} />
        <EntityItem label="Second Party" value={entities.second_party ?? '-'} />
        <EntityItem label="Contract Value" value={`Rp ${Number(entities.value_rp || 0).toLocaleString('id-ID')}`} />
        <EntityItem label="Duration" value={`${entities.duration_months ?? '-'} Months`} />
        <EntityItem label="Penalty Clause" value={entities.penalty ?? '-'} />
        <EntityItem label="Initial Risk Status" value={
          <span className={`font-bold ${
            entities.initial_risk === 'High' ? 'text-red-600' :
            entities.initial_risk === 'Medium' ? 'text-orange-600' : 'text-green-600'
          }`}>{entities.initial_risk ?? '-'}</span>
        } />
      </div>
    </div>
  );
}