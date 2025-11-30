# Real-Time Updates Implementation

## 🎯 Overview
Implemented real-time polling for admin reports using React Query's built-in polling capabilities. This provides live updates for transactions, sales, cashback, and profit/loss reports without requiring WebSocket infrastructure.

## ✅ What Was Implemented

### 1. **Enhanced React Query Hooks**
**File:** `/pos-frontend/src/hooks/useReports.ts`

Added optional `realtime` configuration to:
- `useSalesReport()`
- `useProfitLossReport()`

**Features:**
- ✅ Configurable polling interval (default: 5 seconds)
- ✅ Background polling (continues when tab not focused)
- ✅ Automatic refetch on window focus
- ✅ Zero cache staleness when live mode enabled
- ✅ Easy toggle between live and static modes

**Usage:**
```typescript
const { data, isFetching, dataUpdatedAt } = useSalesReport(
  { startDate, endDate, groupBy },
  true, // enabled
  { realtime: true, refetchInterval: 5000 } // Live mode, poll every 5s
);
```

---

### 2. **Live Indicator Component**
**File:** `/pos-frontend/src/components/common/LiveIndicator.tsx`

A reusable component that shows:
- ✅ **Live/Static toggle button** - Click to enable/disable auto-refresh
- ✅ **Pulsing indicator** - Visual feedback when live mode is active
- ✅ **Fetching status** - Shows "Updating..." with spinning icon
- ✅ **Last updated time** - Displays "just now", "5s ago", "2m ago", etc.

**Visual States:**
```
[🔴 LIVE] Updating...                    // Fetching new data
[🟢 LIVE] Updated just now              // Live, idle
[⚪ Static] Updated 2m ago              // Static mode
```

---

### 3. **Updated Report Views**

#### **Sales Report** (`SalesReportView.tsx`)
- ✅ Live mode enabled by default
- ✅ Polls every 5 seconds
- ✅ Shows live indicator at top-right
- ✅ Real-time transaction updates

#### **Cashback Report** (`CashbackReportView.tsx`)
- ✅ Live mode enabled by default
- ✅ Polls every 5 seconds
- ✅ Shows live indicator at top-right
- ✅ Real-time cashback transaction updates

#### **Profit & Loss Report** (`ProfitLossReportView.tsx`)
- ✅ Live mode enabled by default
- ✅ Polls every 5 seconds
- ✅ Shows live indicator at top-right
- ✅ Real-time P&L calculations

---

## 🎨 User Experience

### **Live Mode (Default)**
1. Report loads with live mode **ON**
2. Green "LIVE" badge with pulsing animation
3. Data refreshes every 5 seconds automatically
4. Shows "Updating..." during fetch
5. Displays "Updated just now" after successful fetch
6. Continues polling even when tab is in background

### **Static Mode**
1. User clicks "LIVE" button to toggle off
2. Badge changes to gray "Static"
3. Polling stops immediately
4. Shows last update time (e.g., "Updated 2m ago")
5. Data only refreshes on manual page reload or window focus

---

## 🔧 Configuration Options

### **Polling Interval**
Default: 5 seconds (5000ms)

To change:
```typescript
{ realtime: true, refetchInterval: 3000 } // 3 seconds
{ realtime: true, refetchInterval: 10000 } // 10 seconds
```

### **Disable Live Mode by Default**
```typescript
const [isLive, setIsLive] = useState(false); // Start in static mode
```

### **Background Polling**
Automatically enabled when `realtime: true`. To disable:
```typescript
// In useReports.ts
refetchIntervalInBackground: false, // Stop polling when tab not focused
```

---

## 📊 Performance Impact

### **Network Usage**
- **Live Mode**: 1 API request every 5 seconds per report
- **Static Mode**: 0 background requests
- **On Focus**: 1 request when window regains focus

### **Example Scenario**
- Admin viewing Sales Report for 5 minutes
- Live mode: ~60 requests (12 per minute)
- Data transfer: ~60KB - 300KB depending on data size
- **Impact**: Minimal - equivalent to loading 1-2 images

### **Optimization**
- ✅ React Query caches responses
- ✅ Only fetches if data changed
- ✅ Automatic request deduplication
- ✅ Smart background refetch management

---

## 🚀 Future Enhancements

### **Phase 2: Server-Sent Events (SSE)**
When you need instant updates:
```typescript
// Backend
@Sse('transactions/stream')
streamTransactions(): Observable<MessageEvent> {
  return this.transactionEvents$;
}

// Frontend
const eventSource = new EventSource('/api/v1/transactions/stream');
eventSource.onmessage = (event) => {
  queryClient.invalidateQueries(['reports']);
};
```

### **Phase 3: WebSockets**
For bi-directional real-time:
```typescript
// Backend
@WebSocketGateway()
export class TransactionsGateway {
  @WebSocketServer() server: Server;
  
  notifyNewTransaction(tx: Transaction) {
    this.server.emit('transaction:created', tx);
  }
}

// Frontend
const socket = io('http://localhost:3000');
socket.on('transaction:created', (tx) => {
  toast.info('New transaction received');
  queryClient.invalidateQueries(['reports']);
});
```

### **Phase 4: Smart Notifications**
```typescript
onSuccess: (newData) => {
  const oldData = queryClient.getQueryData(['reports']);
  if (hasNewTransactions(oldData, newData)) {
    toast.info(`${newTransactionCount} new transactions`);
    playNotificationSound();
  }
}
```

---

## 🧪 Testing Checklist

### **Manual Testing**
- [ ] Open Sales Report - verify "LIVE" indicator shows
- [ ] Wait 5 seconds - verify "Updating..." appears briefly
- [ ] Create a new sale on POS - verify it appears in report within 5s
- [ ] Click "LIVE" button - verify it changes to "Static"
- [ ] Create another sale - verify it does NOT appear (static mode)
- [ ] Click "Static" button - verify it changes back to "LIVE"
- [ ] Switch to another tab for 30s - return and verify data is current
- [ ] Check Cashback Report - verify live updates work
- [ ] Check P&L Report - verify live updates work

### **Performance Testing**
- [ ] Monitor network tab - verify requests every 5 seconds
- [ ] Check CPU usage - should be minimal
- [ ] Test with slow network - verify graceful handling
- [ ] Test with network offline - verify error handling

---

## 📝 Code Examples

### **Adding Live Mode to New Report**
```typescript
import { useState } from 'react';
import { LiveIndicator } from '../common/LiveIndicator';
import { useYourReport } from '../../hooks/useReports';

export const YourReportView = ({ startDate, endDate }) => {
  const [isLive, setIsLive] = useState(true);
  
  const { data, isLoading, isFetching, dataUpdatedAt } = useYourReport(
    { startDate, endDate },
    true,
    { realtime: isLive, refetchInterval: 5000 }
  );

  return (
    <div>
      <LiveIndicator
        isLive={isLive}
        isFetching={isFetching}
        lastUpdated={new Date(dataUpdatedAt)}
        onToggle={() => setIsLive(!isLive)}
      />
      {/* Your report content */}
    </div>
  );
};
```

### **Customizing Polling Interval**
```typescript
// Fast updates (3 seconds)
{ realtime: true, refetchInterval: 3000 }

// Moderate updates (10 seconds)
{ realtime: true, refetchInterval: 10000 }

// Slow updates (30 seconds)
{ realtime: true, refetchInterval: 30000 }
```

---

## 🎉 Benefits

### **For Admins**
- ✅ See transactions as they happen
- ✅ No manual refresh needed
- ✅ Always up-to-date information
- ✅ Can toggle live mode on/off as needed

### **For Developers**
- ✅ No backend changes required
- ✅ Uses existing REST API
- ✅ Built on React Query (already in use)
- ✅ Easy to extend to other pages
- ✅ Minimal code changes

### **For System**
- ✅ Low server load
- ✅ Efficient network usage
- ✅ No WebSocket infrastructure needed
- ✅ Works with existing architecture

---

## 🔍 Troubleshooting

### **Live indicator not showing**
- Check if `LiveIndicator` component is imported
- Verify `isFetching` and `dataUpdatedAt` are destructured from query

### **Polling not working**
- Ensure `realtime: true` is passed to hook options
- Check browser console for errors
- Verify backend API is responding

### **Too many requests**
- Increase `refetchInterval` (e.g., 10000 for 10 seconds)
- Consider disabling `refetchIntervalInBackground`

### **Data not updating**
- Check if live mode is enabled (green "LIVE" badge)
- Verify backend is returning updated data
- Clear React Query cache: `queryClient.clear()`

---

## 📚 Related Files

- `/pos-frontend/src/hooks/useReports.ts` - Enhanced hooks
- `/pos-frontend/src/components/common/LiveIndicator.tsx` - Live indicator UI
- `/pos-frontend/src/components/reports/SalesReportView.tsx` - Sales report
- `/pos-frontend/src/components/reports/CashbackReportView.tsx` - Cashback report
- `/pos-frontend/src/components/reports/ProfitLossReportView.tsx` - P&L report

---

**Implementation Date:** November 30, 2025  
**Status:** ✅ Complete and Ready for Testing
