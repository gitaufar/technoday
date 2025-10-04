// Tipe data untuk setiap item risiko
type RiskItem = {
  title: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  description: string;
  documentLink: string;
  keywordCount?: number; // Opsional: jumlah keywords ditemukan
  foundKeywords?: string[]; // Opsional: keywords yang ditemukan
};

// Tipe data untuk properti komponen utama
type RiskAnalysisCardProps = {
  risks: RiskItem[];
};

// Sub-komponen untuk menampilkan badge risiko (High, Medium, Low)
function RiskBadge({ level }: { level: RiskItem['riskLevel'] }) {
  const styles = {
    High: 'bg-red-500 text-white',
    Medium: 'bg-orange-400 text-white',
    Low: 'bg-green-500 text-white',
  };
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${styles[level]}`}>
      {level}
    </span>
  );
}

// Sub-komponen untuk setiap kartu item analisis risiko
function RiskAnalysisItem({ item }: { item: RiskItem }) {
  const backgroundStyles = {
    High: 'bg-red-50',
    Medium: 'bg-orange-50',
    Low: 'bg-green-50',
  };

  return (
    <div className={`rounded-lg p-4 ${backgroundStyles[item.riskLevel]}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">{item.title}</h3>
        <RiskBadge level={item.riskLevel} />
      </div>
      <p className="mt-2 text-sm text-gray-600">{item.description}</p>
      
      {/* Tampilkan informasi keywords jika tersedia */}
      {item.keywordCount && item.keywordCount > 0 && (
        <div className="mt-2">
          <span className="text-xs text-gray-500">
            Found {item.keywordCount} keywords: {item.foundKeywords?.join(', ') || 'N/A'}
          </span>
        </div>
      )}
      
      <a href={item.documentLink} className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
        View in Document
      </a>
    </div>
  );
}

// Komponen Utama: RiskAnalysisCard
export default function RiskAnalysisCard({ risks }: RiskAnalysisCardProps) {
  return (
    <div className="w-full h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Risk Analysis</h2>
        <span className="text-sm font-semibold text-gray-500">AI Detected</span>
      </div>

      <div className="mt-4 space-y-3">
        {risks.map((riskItem, index) => (
          <RiskAnalysisItem key={index} item={riskItem} />
        ))}
      </div>
    </div>
  );
}