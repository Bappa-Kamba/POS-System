import { useState } from 'react';
import { subDays, format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { BarChart3, TrendingUp, Download, DollarSign, Clock } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { SalesReportView } from '../../components/reports/SalesReportView';
import { ProfitLossReportView } from '../../components/reports/ProfitLossReportView';
import { CashbackReportView } from '../../components/reports/CashbackReportView';
import { SessionReportView } from '../../components/reports/SessionReportView';
import { useExportReport } from '../../hooks/useReports';
import type { ExportReportParams } from '../../services/report.service';

type ReportType = 'sales' | 'profit-loss' | 'cashback' | 'sessions';

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
      reportType: activeReport === 'sessions' ? 'sales' : activeReport, // Fallback for sessions if not supported yet
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

  const setFrequencyRange = (frequency: string) => {
    const today = new Date();
    let start, end;

    switch (frequency) {
      case 'daily':
        start = startOfDay(today);
        end = endOfDay(today);
        break;
      case 'weekly':
        start = startOfDay(startOfWeek(today));
        end = endOfDay(endOfWeek(today));
        break;
      case 'monthly':
        start = startOfDay(startOfMonth(today));
        end = endOfDay(endOfMonth(today));
        break;
      case 'quarterly':
        const quarter = Math.floor(today.getMonth() / 3);
        start = startOfDay(new Date(today.getFullYear(), quarter * 3, 1));
        end = endOfDay(new Date(today.getFullYear(), quarter * 3 + 3, 0));
        break;
      case 'semi-annual':
        const half = today.getMonth() < 6 ? 0 : 6;
        start = startOfDay(new Date(today.getFullYear(), half, 1));
        end = endOfDay(new Date(today.getFullYear(), half + 6, 0));
        break;
      case 'yearly':
        start = startOfDay(startOfYear(today));
        end = endOfDay(endOfYear(today));
        break;
      default:
        return;
    }

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
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto">
        <button
          onClick={() => setActiveReport('sales')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeReport === 'sales'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Sales Report
        </button>
        <button
          onClick={() => setActiveReport('sessions')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeReport === 'sessions'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Session Reports
        </button>
        <button
          onClick={() => setActiveReport('cashback')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeReport === 'cashback'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          Cashback Report
        </button>
        <button
          onClick={() => setActiveReport('profit-loss')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
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
        <div className="space-y-4">
          {/* Date inputs and quick day selectors */}
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

          {/* Report frequency quick action buttons */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Report Frequency:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFrequencyRange('daily')}
                className="text-xs"
              >
                Daily
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFrequencyRange('weekly')}
                className="text-xs"
              >
                Weekly
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFrequencyRange('monthly')}
                className="text-xs"
              >
                Monthly
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFrequencyRange('quarterly')}
                className="text-xs"
              >
                Quarterly
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFrequencyRange('semi-annual')}
                className="text-xs"
              >
                Semi-Annual
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFrequencyRange('yearly')}
                className="text-xs"
              >
                Yearly
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div>
        {activeReport === 'sales' && (
          <SalesReportView startDate={startDate} endDate={endDate} />
        )}
        {activeReport === 'sessions' && (
          <SessionReportView startDate={startDate} endDate={endDate} />
        )}
        {activeReport === 'cashback' && (
          <CashbackReportView startDate={startDate} endDate={endDate} />
        )}
        {activeReport === 'profit-loss' && (
          <ProfitLossReportView startDate={startDate} endDate={endDate} />
        )}
      </div>
    </div>
  );
};
