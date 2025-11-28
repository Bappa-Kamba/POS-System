import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sessionService } from '../../services/session.service';
import { format } from 'date-fns';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { Loader2, ChevronRight, Calendar, User, Clock } from 'lucide-react';
import { Button } from '../common/Button';

interface SessionReportViewProps {
  startDate: string;
  endDate: string;
}

export const SessionReportView: React.FC<SessionReportViewProps> = ({ startDate, endDate }) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions', startDate, endDate],
    queryFn: () => sessionService.getSessions({ startDate, endDate }),
  });

  const { data: sessionDetails } = useQuery({
    queryKey: ['session', selectedSessionId],
    queryFn: () => sessionService.getSessionDetails(selectedSessionId!),
    enabled: !!selectedSessionId,
  });



  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  const sessions = sessionsData?.data || [];

  if (selectedSessionId && sessionDetails) {
    const { data: session } = sessionDetails;
    const summary = (session as any).summary; // Type assertion if needed based on API response structure

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedSessionId(null)} className="mb-4">
          ← Back to Sessions
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Session Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{session.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${session.status === 'OPEN' ? 'text-green-600' : 'text-gray-600'}`}>
                  {session.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Opened By</span>
                <span className="font-medium">{session.openedBy.firstName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Start Time</span>
                <span className="font-medium">{format(new Date(session.startTime), 'PP p')}</span>
              </div>
              {session.endTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500">End Time</span>
                  <span className="font-medium">{format(new Date(session.endTime), 'PP p')}</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Cash Reconciliation</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Opening Balance</span>
                <span className="font-medium">{formatCurrency(session.openingBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">+ Cash Sales</span>
                <span className="font-medium text-green-600">+{formatCurrency(summary?.cashPayments || 0)}</span>
              </div>
              {summary?.totalExpenses > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">- Expenses</span>
                  <span className="font-medium text-red-600">-{formatCurrency(summary?.totalExpenses || 0)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Expected Cash</span>
                <span>{formatCurrency(summary?.expectedCashInDrawer || 0)}</span>
              </div>
              {session.closingBalance !== null && session.closingBalance !== undefined && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Actual Cash (Counted)</span>
                    <span className="font-medium">{formatCurrency(session.closingBalance)}</span>
                  </div>
                  <div className={`flex justify-between font-bold ${(summary?.variance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    <span>Variance</span>
                    <span>{formatCurrency(summary?.variance || 0)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span>{summary?.isBalanced ? '✓ Balanced' : '⚠ Unbalanced'} ({summary?.variancePercentage?.toFixed(2)}%)</span>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Sales Count</span>
                <span className="font-medium">{session._count?.sales || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Revenue</span>
                <span className="font-medium text-lg">{formatCurrency(summary?.totalRevenue || 0)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <p className="text-xs text-gray-500 mb-1">Payment Methods</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span>Card</span>
                    <span>{formatCurrency(summary?.cardPayments || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transfer</span>
                    <span>{formatCurrency(summary?.transferPayments || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No sessions found for this period.</div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelectedSessionId(session.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${session.status === 'OPEN' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{session.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(session.startTime), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {session.openedBy.firstName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Opening Balance</p>
                    <p className="font-medium">{formatCurrency(session.openingBalance)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      session.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
