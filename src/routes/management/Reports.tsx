import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RiskDistribution from "../../components/management/RiskDistribution";
import ReportsKPICard from "../../components/management/Reports/ReportsKPICard";
import ContractStatus from "../../components/management/Reports/ContractStatus";
import ExpiringContracts from "../../components/management/Reports/ExpiringContracts";
import { managementService, type ManagementKPIData, type ContractSummary } from "../../services/managementService";

// Interface definitions



export default function Reports() {
  const navigate = useNavigate();
  const [reportPeriod, setReportPeriod] = useState("Monthly");
  const [department, setDepartment] = useState("All Departments");
  const [includeRiskDetails, setIncludeRiskDetails] = useState(false);
  const [kpiData, setKpiData] = useState<ManagementKPIData | null>(null);
  const [contractsSummary, setContractsSummary] = useState<ContractSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching fresh data for Reports...');
      const [kpiResult, contractsResult] = await Promise.all([
        managementService.getManagementKPI(),
        managementService.getContractsSummary(20)
      ]);
      
      console.log('KPI Data:', kpiResult);
      console.log('Contracts Summary:', contractsResult);
      
      setKpiData(kpiResult);
      setContractsSummary(contractsResult);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Listen for focus event to refresh data when user returns to tab/page
    const handleFocus = () => {
      console.log('Page focused, refreshing data...');
      fetchData();
    };
    
    // Listen for visibility change to refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing data...');
        fetchData();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    if (query.trim()) {
      try {
        const results = await managementService.searchContracts(query);
        setContractsSummary(results);
      } catch (error) {
        console.error('Error searching contracts:', error);
      }
    } else {
      // If search is cleared, reload all data including KPIs
      fetchData();
    }
  };

  const handleViewContract = (contractId: string) => {
    navigate(`/management/contracts/${contractId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-500">Loading reports data...</div>
      </div>
    );
  }







  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Generate Reports
        </h1>

        <div className="flex items-end gap-6">
          {/* Report Period */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Period
            </label>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          {/* Department */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="All Departments">All Departments</option>
              <option value="IT">IT</option>
              <option value="Legal">Legal</option>
              <option value="Procurement">Procurement</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          {/* Include Risk Details Checkbox */}
          <div className="flex-1 flex items-center">
            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={includeRiskDetails}
                onChange={(e) => setIncludeRiskDetails(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Include Risk Details</span>
            </label>
          </div>

          {/* Export Report Button */}
          <div className="flex-shrink-0">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-16 py-3 rounded-lg font-medium text-sm transition-colors">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <ReportsKPICard
          title="Active Contracts"
          value={kpiData?.active_contracts?.toString() || "0"}
          subtitle="Currently running"
          variant="active"
          trend="up"
        />

        <ReportsKPICard
          title="Pending Contracts"
          value={kpiData?.pending_contracts?.toString() || "0"}
          subtitle="Under review"
          variant="pending"
        />

        <ReportsKPICard
          title="Expired Contracts"
          value={kpiData?.expired_contracts?.toString() || "0"}
          subtitle="Needs attention"
          variant="expired"
        />

        <ReportsKPICard
          title="Total Contract Value"
          value={`Rp ${kpiData?.total_contract_value ? (kpiData.total_contract_value / 1000000000).toFixed(1) + 'B' : '0'}`}
          subtitle="+8.2% growth"
          variant="value"
          trend="up"
        />

        <ReportsKPICard
          title="High Risk Contracts"
          value={kpiData?.high_risk_contracts?.toString() || "0"}
          subtitle={`${kpiData?.high_risk_percentage?.toFixed(1) || '0'}% of total`}
          variant="distribution"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contract Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contract Status
          </h3>
          <ContractStatus kpiData={kpiData} />
        </div>

        {/* Expiring Contracts */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Expiring Contracts
          </h3>
          <div className="h-80">
            <ExpiringContracts kpiData={kpiData} />
          </div>
        </div>

        {/* Risk Distribution Chart */}
          <RiskDistribution kpiData={kpiData} />
      </div>

      {/* Contracts Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Contracts Summary
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Contract Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Value
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Expiry Date
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Risk Level
                </th>
              </tr>
            </thead>
            <tbody>
              {contractsSummary.map((contract) => (
                <tr
                  key={contract.id}
                  onClick={() => handleViewContract(contract.id)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-3 px-4 text-gray-900">{contract.name}</td>
                  <td className="py-3 px-4 text-gray-600">
                    Rp {contract.value_rp.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contract.status?.toLowerCase() === "active"
                          ? "bg-green-100 text-green-800"
                          : contract.status?.toLowerCase() === "pending" || contract.status?.toLowerCase() === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : contract.status?.toLowerCase() === "rejected"
                          ? "bg-red-100 text-red-800"
                          : contract.status?.toLowerCase() === "expired"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {contract.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(contract.end_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contract.risk?.toLowerCase() === "low"
                          ? "bg-green-100 text-green-800"
                          : contract.risk?.toLowerCase() === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : contract.risk?.toLowerCase() === "high"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {contract.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Export & Share
        </h3>
        <div className="flex items-center gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export PDF
          </button>

          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export Excel
          </button>

          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Email Report
          </button>
        </div>
      </div>
    </div>
  );
}
