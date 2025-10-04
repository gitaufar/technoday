interface TimelineContract {
  id: string;
  name: string;
  value: string;
  timeline: {
    start: string;
    end: string;
    duration: number;
    currentMonth: number;
  };
  status: "active" | "expiring-soon" | "critical" | "expired";
}

interface ContractLifecycleTimelineProps {
  contracts: TimelineContract[];
  selectedDivision: string;
  selectedPeriod: string;
  isHighRiskOnly: boolean;
  onDivisionChange: (division: string) => void;
  onPeriodChange: (period: string) => void;
  onHighRiskToggle: (isHighRisk: boolean) => void;
}

export default function ContractLifecycleTimeline({
  contracts,
  selectedDivision,
  selectedPeriod,
  isHighRiskOnly,
  onDivisionChange,
  onPeriodChange,
  onHighRiskToggle,
}: ContractLifecycleTimelineProps) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#3B82F6"; // blue
      case "expiring-soon":
        return "#F59E0B"; // orange
      case "critical":
        return "#EF4444"; // red
      case "expired":
        return "#6B7280"; // gray
      default:
        return "#3B82F6";
    }
  };

  const getTimelineBars = (contract: TimelineContract) => {
    const startIndex = months.indexOf(contract.timeline.start);
    const endIndex = months.indexOf(contract.timeline.end);
    const currentProgress = contract.timeline.currentMonth;

    return months.map((month, index) => {
      const isInRange = index >= startIndex && index <= endIndex;
      const isCompleted = index < startIndex + currentProgress;
      const isCurrent = index === startIndex + currentProgress - 1;

      let bgColor = "transparent";
      if (isInRange) {
        if (isCompleted) {
          bgColor = getStatusColor(contract.status);
        } else if (isCurrent) {
          bgColor = `${getStatusColor(contract.status)}80`; // semi-transparent
        } else {
          bgColor = "#E5E7EB"; // gray background for future months
        }
      }

      return { month, bgColor, isInRange };
    });
  };

  return (
    <div className="bg-white h-full rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Contract Lifecycle Timeline
        </h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedDivision}
            onChange={(e) => onDivisionChange(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option>All Divisions</option>
            <option>IT</option>
            <option>Legal</option>
            <option>Operations</option>
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option>Next 90 Days</option>
            <option>Next 30 Days</option>
            <option>Next 180 Days</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isHighRiskOnly}
              onChange={(e) => onHighRiskToggle(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            High Risk Only
          </label>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="overflow-x-auto">
        {/* Timeline Header */}
        <div className="min-w-full">
          <div className="grid grid-cols-[200px_repeat(12,1fr)] gap-2 mb-4">
            <div className="text-sm font-medium text-gray-500 px-2">
              Contract
            </div>
            {months.map((month) => (
              <div
                key={month}
                className="text-center text-xs font-medium text-gray-500"
              >
                {month}
              </div>
            ))}
          </div>

          {/* Timeline Rows */}
          <div className="space-y-3">
            {contracts.map((contract) => {
              const timelineBars = getTimelineBars(contract);
              return (
                <div
                  key={contract.id}
                  className="grid grid-cols-[200px_repeat(12,1fr)] gap-2 items-center"
                >
                  <div className="px-2">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {contract.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {contract.value}
                    </div>
                  </div>
                  {timelineBars.map((bar, index) => (
                    <div
                      key={index}
                      className="h-6 rounded-sm border border-gray-100"
                      style={{
                        backgroundColor:
                          bar.bgColor === "transparent"
                            ? "#F9FAFB"
                            : bar.bgColor,
                        border: bar.isInRange
                          ? "1px solid #E5E7EB"
                          : "1px solid transparent",
                      }}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <span className="block w-full h-px mt-[20%] bg-gray-200" />
      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-6 text-sm w-full justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span className="text-gray-600">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-orange-500" />
          <span className="text-gray-600">Expiring Soon (≤60 days)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <span className="text-gray-600">Critical (≤30 days)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gray-400" />
          <span className="text-gray-600">Expired</span>
        </div>
      </div>
    </div>
  );
}
