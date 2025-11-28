import { api } from './api';

export interface Session {
  id: string;
  branchId: string;
  openedByUserId: string;
  closedByUserId?: string | null;
  startTime: string;
  endTime?: string | null;
  openingBalance: number;
  closingBalance?: number | null;
  status: 'OPEN' | 'CLOSED';
  name: string;
  openedBy: {
    firstName: string | null;
    lastName: string | null;
    username: string;
  };
  closedBy?: {
    firstName: string | null;
    lastName: string | null;
    username: string;
  } | null;
  _count?: {
    sales: number;
  };
}

export interface SessionSummary {
  totalSales: number;
  totalRevenue: number;
  cashPayments: number;
  cardPayments: number;
  transferPayments: number;
  otherPayments: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
}

export const sessionService = {
  getSessions: async (params: { startDate: string; endDate: string }) => {
    const response = await api.get<{ data: Session[] }>('/sessions/history', { params });
    return response.data;
  },

  getSessionDetails: async (sessionId: string) => {
    const response = await api.get<{ data: Session & { summary: SessionSummary } }>(`/sessions/${sessionId}`);
    return response.data;
  },
};
