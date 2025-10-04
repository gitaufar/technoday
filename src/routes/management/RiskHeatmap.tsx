import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RiskDistribution from "../../components/management/RiskDistribution";
import { RiskSummary } from "../../components/management/RiskHeatmap/RiskSummary";
import { managementService, type ManagementKPIData, type ContractSummary } from "../../services/managementService";

export default function RiskHeatmap() {
  const navigate = useNavigate();
  const [selectedDivision, setSelectedDivision] = useState("All Divisions");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [searchContract, setSearchContract] = useState("");
  const [kpiData, setKpiData] = useState<ManagementKPIData | null>(null);
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [kpiResult, contractsResult] = await Promise.all([
          managementService.getManagementKPI(),
          managementService.getContractsSummary(50) // Get more contracts for risk analysis
        ]);
        
        setKpiData(kpiResult);
        setContracts(contractsResult);
      } catch (error) {
        console.error('Error fetching risk heatmap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchContract(query);
    if (query.trim()) {
      try {
        const results = await managementService.searchContracts(query);
        setContracts(results);
      } catch (error) {
        console.error('Error searching contracts:', error);
      }
    } else {
      // If search is cleared, reload all contracts
      try {
        const contractsResult = await managementService.getContractsSummary(50);
        setContracts(contractsResult);
      } catch (error) {
        console.error('Error reloading contracts:', error);
      }
    }
  };

  const handleViewContract = (contractId: string) => {
    navigate(`/management/contracts/${contractId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-500">Loading risk heatmap data...</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Review":
        return "bg-yellow-100 text-yellow-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      case "Active":
        return "bg-green-100 text-green-800";
      case "Under Review":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Risk Heatmap</h1>
      <p className="text-gray-600">
        Monitor contract risks across your portfolio with visual insights
      </p>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Division
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option>All Divisions</option>
              <option>Legal</option>
              <option>Operations</option>
              <option>Finance</option>
              <option>IT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option>2024</option>
              <option>2023</option>
              <option>2022</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Contract
            </label>
            <input
              type="text"
              placeholder="Contract name..."
              value={searchContract}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contract Risk Distribution */}
        <div className="lg:col-span-2">
          <RiskDistribution kpiData={kpiData} />
        </div>

        {/* Risk Summary */}
        <RiskSummary
          total={kpiData?.total_contracts || 0}
          highRisk={kpiData?.high_risk_count || 0}
          mediumRisk={kpiData?.medium_risk_count || 0}
          lowRisk={kpiData?.low_risk_count || 0}
        />
      </div>

      {/* Contracts at High Risk Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Contracts at High Risk
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Counterparty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contract.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rp {contract.value_rp.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.second_party}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        contract.status
                      )}`}
                    >
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(contract.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(
                        contract.risk
                      )}`}
                    >
                      {contract.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleViewContract(contract.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Contract
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
