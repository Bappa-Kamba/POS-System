import { useState } from 'react';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { BarChart3, TrendingUp, Download } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { SalesReportView } from '../../components/reports/SalesReportView';
import { ProfitLossReportView } from '../../components/reports/ProfitLossReportView';
import { useExportReport } from '../../hooks/useReports';
import type { ExportReportParams } from '../../services/report.service';

type ReportType = 'sales' | 'profit-loss';

export const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('sales');
  const [startDate, setStartDate] = useState(
    format(startOfDay(subDays(new Date(), 30)), 'yyyy-MM-dd'),
  );
  const [endDate, setEndDate] = useState(
    format(endOfDay(new Date()), 'yyyy-MM-dd'),
  );
  const exportMutation = useExportReport();

  const handleExport = (format: 'pdf' | 'excel') => {
    const params: ExportReportParams = {
      reportType: activeReport,
      format,
      startDate,
      endDate,
    };
    exportMutation.mutate(params);
  };

  const setDateRange = (days: number) => {
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(end, days - 1));
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Reports
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            View and analyze sales, profit, and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => handleExport('excel')}
            disabled={exportMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleExport('pdf')}
            disabled={exportMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={() => setActiveReport('sales')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeReport === 'sales'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Sales Report
        </button>
        <button
          onClick={() => setActiveReport('profit-loss')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeReport === 'profit-loss'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Profit & Loss
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Date Range:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
            <span className="text-neutral-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Quick select:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDateRange(7)}
            >
              Last 7 days
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDateRange(30)}
            >
              Last 30 days
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDateRange(90)}
            >
              Last 90 days
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div>
        {activeReport === 'sales' && (
          <SalesReportView startDate={startDate} endDate={endDate} />
        )}
        {activeReport === 'profit-loss' && (
          <ProfitLossReportView startDate={startDate} endDate={endDate} />
        )}
      </div>
    </div>
  );
};

