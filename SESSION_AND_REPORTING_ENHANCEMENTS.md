# Session & Reporting Enhancements - Complete Implementation

## Overview

Comprehensive enhancements to session management and reporting systems to ensure complete audit trails, proper cash reconciliation, and flexible report generation across multiple time periods.

---

## Part 1: Enhanced Session Summary & Expected Cash Calculation

### What is Expected Cash?

**Expected Cash = Opening Balance + Cash Payments from Sales**

This represents the amount of cash that should theoretically be in the drawer at shift end, based on:
- Cash amount present when session opened (opening balance)
- Cash received from all PURCHASE transactions during the session
- Excludes: Card payments, transfers, and other payment methods

### Session Detail Summary Structure

When retrieving session details via `GET /sessions/:id`, you now receive comprehensive reconciliation data:

```json
{
  "id": "session-123",
  "name": "Morning",
  "status": "CLOSED",
  "openingBalance": 5000,
  "closingBalance": 5500,
  "summary": {
    // Transaction Totals
    "totalSales": 15,
    "totalRevenue": 3200,
    
    // Payment Breakdown
    "cashPayments": 2000,
    "otherPayments": 1200,
    
    // Cash Reconciliation
    "openingBalance": 5000,
    "expectedCashInDrawer": 7000,      // 5000 + 2000 cash payments
    "actualCashInDrawer": 6950,         // What was actually counted
    
    // Variance Analysis
    "variance": -50,                     // Difference: 6950 - 7000
    "variancePercentage": -0.71,         // As percentage
    "isBalanced": false,                 // Variance > 0.01 (not balanced)
    
    // Session Duration
    "durationMinutes": 480              // 8 hours
  }
}
```

### Setting Expected Cash

Expected cash is **automatically calculated** when session ends. User provides:
1. **Opening Balance** - When starting session
2. **Closing Balance** - When ending session (new prompt on logout)

System calculates:
- Cash payments from sales linked to session
- Expected amount based on formula above
- Variance and percentage difference

### Implementation Details

**File**: `pos-backend/src/modules/sessions/sessions.service.ts`

```typescript
async getSessionDetails(sessionId: string) {
  // ... fetch session with sales and payments ...
  
  // Calculate expected cash
  const expectedCashInDrawer = session.openingBalance + cashPayments;
  
  // Calculate variance
  const actualCash = session.closingBalance || 0;
  const variance = actualCash - expectedCashInDrawer;
  const variancePercentage = expectedCashInDrawer > 0 
    ? (variance / expectedCashInDrawer) * 100 
    : 0;
  
  return {
    ...session,
    summary: {
      // ... all metrics above ...
    }
  };
}
```

---

## Part 2: Closing Balance Prompt on Logout

### Problem Solved

Previously:
- Users could logout with active session still open
- Session would auto-close without closing balance captured
- Audit trail would show auto-closed but actual cash never counted

Now:
- When user attempts to logout with active session
- Modal prompts user to count cash and enter closing balance
- Session properly closed with actual cash amount
- Complete audit trail maintained

### User Experience Flow

```
User clicks "Logout"
    ↓
Check: Is there an active session?
    ↓
├─ YES → Show SessionClosingModal
│       ├─ Display session info (name, opening balance)
│       ├─ Prompt: "Count cash in drawer and enter amount"
│       ├─ User enters closing balance
│       ├─ POST /sessions/:id/end with closingBalance
│       ├─ Session marked CLOSED
│       └─ Complete logout
│
└─ NO → Direct logout (no session to close)
```

### Frontend Implementation

**Hook**: `pos-frontend/src/hooks/useSafeLogout.ts`

```typescript
export const useSafeLogout = (options: LogoutOptions = {}) => {
  // Returns:
  // - handleSafeLogout() - Main logout handler
  // - handleConfirmClosingBalance() - Confirm with balance
  // - handleCancel() - Cancel logout/modal
  // - State: isLoading, closingBalance, showClosingModal, activeSession
}
```

**Modal Component**: `pos-frontend/src/components/session/SessionClosingModal.tsx`

- Shows active session details
- Input field for closing balance
- Two options: "Keep Session Open" or "End Session & Logout"
- Validates closing balance before submission

**Usage in Navbar**:

```tsx
const {
  handleSafeLogout,
  handleConfirmClosingBalance,
  handleCancel,
  showClosingModal,
  closingBalance,
  setClosingBalance,
  activeSession,
} = useSafeLogout({
  onLogoutComplete: () => navigate('/login'),
});

// In logout button:
const handleLogout = async () => {
  await handleSafeLogout();
};

// In JSX:
<SessionClosingModal
  isOpen={showClosingModal}
  onConfirm={handleConfirmClosingBalance}
  onCancel={handleCancel}
  closingBalance={closingBalance}
  onClosingBalanceChange={setClosingBalance}
/>
```

### What Makes Logs Complete?

| Scenario | Before | After |
|----------|--------|-------|
| Normal End | ✅ closing_balance recorded | ✅ closing_balance recorded |
| Auto-close (old) | ❌ closing_balance = null | ✅ closing_balance prompted & recorded |
| User forgets | ❌ Incomplete | ✅ Can't logout without balance |

---

## Part 3: Report Frequency System

### New Report Frequencies

Added support for 6 report frequency levels:

```typescript
enum ReportFrequency {
  DAILY = 'daily',           // Today's data
  WEEKLY = 'weekly',         // Current week (Mon-Sun)
  MONTHLY = 'monthly',       // Current month
  QUARTERLY = 'quarterly',   // Current Q1/Q2/Q3/Q4
  SEMI_ANNUAL = 'semi-annual', // H1 or H2
  YEARLY = 'yearly',         // Full year
}
```

### Automatic Date Range Calculation

When you specify frequency, system automatically calculates proper date range:

```typescript
// Example: Friday, Nov 28, 2025

DAILY:
├─ Start: Nov 28, 2025 00:00
└─ End: Nov 28, 2025 23:59

WEEKLY:
├─ Start: Nov 24, 2025 00:00 (Monday of this week)
└─ End: Nov 28, 2025 23:59 (Today)

MONTHLY:
├─ Start: Nov 1, 2025 00:00
└─ End: Nov 28, 2025 23:59

QUARTERLY (Q4):
├─ Start: Oct 1, 2025 00:00
└─ End: Nov 28, 2025 23:59

SEMI_ANNUAL (H2):
├─ Start: Jul 1, 2025 00:00
└─ End: Nov 28, 2025 23:59

YEARLY:
├─ Start: Jan 1, 2025 00:00
└─ End: Nov 28, 2025 23:59
```

### API Integration

#### Sales Report with Frequency

```bash
GET /reports/sales?
  frequency=weekly&
  startDate=2025-01-01&
  endDate=2025-11-28
```

Response includes grouping by frequency period:
```json
{
  "frequency": "weekly",
  "period": {
    "label": "Weekly Report - Week of Nov 24, 2025",
    "startDate": "2025-11-24T00:00:00Z",
    "endDate": "2025-11-28T23:59:59Z"
  },
  "totalSales": 45,
  "groupedSessions": {
    "Week of 2025-11-24": [
      { "sessionData": "..." }
    ]
  }
}
```

#### Sessions Report with Frequency

```bash
GET /reports/sessions?
  frequency=monthly&
  startDate=2025-01-01&
  endDate=2025-11-28&
  branchId=branch-1
```

Groups sessions by frequency period for better analysis:
```json
{
  "frequency": "monthly",
  "groupedSessions": {
    "2025-01": [ /* January sessions */ ],
    "2025-02": [ /* February sessions */ ],
    // ... more months
    "2025-11": [ /* November sessions */ ]
  },
  "totalSessions": 156
}
```

### Export Reports with Frequency

```bash
POST /reports/export
{
  "reportType": "sales",
  "format": "pdf",
  "frequency": "quarterly",
  "startDate": "2025-01-01",
  "endDate": "2025-11-28"
}
```

System automatically:
- Calculates date range for Q4 2025
- Groups data by quarter boundaries
- Adds frequency annotations to exported file
- Includes period summary headers

### Implementation: Frequency Helper Methods

**File**: `pos-backend/src/modules/reports/reports.service.ts`

```typescript
private getDateRangeByFrequency(
  frequency: ReportFrequency,
  referenceDate: Date = new Date()
): { startDate: Date; endDate: Date; label: string } {
  // Returns calculated date range and formatted label
}

private groupByFrequency(sessions: any[], frequency: ReportFrequency): any {
  // Groups array by frequency period
  // Returns object with frequency labels as keys
}

async getSessionsReport(
  branchId: string,
  startDate: Date,
  endDate: Date,
  frequency: ReportFrequency
) {
  // Fetches sessions and returns grouped by frequency
}
```

---

## Part 4: Data Flow & Complete Audit Trail

### Session Lifecycle with All Enhancements

```
┌─────────────────────────────────────────────────────┐
│ SESSION START                                       │
├─────────────────────────────────────────────────────┤
│ ✓ User selects: Morning/Evening                     │
│ ✓ User enters: Opening Balance (e.g., 5000)        │
│ → Database: Session created with OPEN status       │
│   {                                                  │
│     id: uuid,                                       │
│     status: 'OPEN',                                 │
│     openingBalance: 5000,                           │
│     closingBalance: null,                           │
│     openedBy: alice,                                │
│     closedBy: null                                  │
│   }                                                  │
└─────────────────────────────────────────────────────┘
              ↓ (Sales & Transactions)
┌─────────────────────────────────────────────────────┐
│ DURING SESSION                                      │
├─────────────────────────────────────────────────────┤
│ Sales linked to session:                            │
│ - Sale 1: 200 (CASH)                               │
│ - Sale 2: 150 (CARD)                               │
│ - Sale 3: 250 (CASH)                               │
│                                                     │
│ Accumulated:                                        │
│ - Cash payments: 450                                │
│ - Other payments: 150                               │
│ - Total revenue: 600                                │
└─────────────────────────────────────────────────────┘
              ↓ (End Session - NEW FLOW)
┌─────────────────────────────────────────────────────┐
│ SESSION END (User action or Logout)                 │
├─────────────────────────────────────────────────────┤
│ ✓ NEW: Modal prompts on logout (if active session) │
│ ✓ User counts cash in drawer                        │
│ ✓ User enters: Closing Balance (e.g., 5450)        │
│ → POST /sessions/:id/end                           │
│   {                                                  │
│     closingBalance: 5450                            │
│   }                                                  │
└─────────────────────────────────────────────────────┘
              ↓ (Calculate Reconciliation)
┌─────────────────────────────────────────────────────┐
│ SESSION CLOSED WITH SUMMARY                         │
├─────────────────────────────────────────────────────┤
│ Database: Session marked CLOSED                     │
│ {                                                    │
│   status: 'CLOSED',                                 │
│   closingBalance: 5450,  ← Actual counted cash     │
│   closedBy: alice,                                  │
│   endTime: now()                                    │
│ }                                                    │
│                                                     │
│ Calculated Summary:                                 │
│ {                                                    │
│   openingBalance: 5000,                             │
│   expectedCashInDrawer: 5450, ← 5000 + 450 cash   │
│   actualCashInDrawer: 5450,   ← User entered      │
│   variance: 0,                ← Perfect balance!   │
│   variancePercentage: 0,                            │
│   isBalanced: true,                                 │
│   durationMinutes: 480                              │
│ }                                                    │
│                                                     │
│ Audit Logged:                                       │
│ ✓ Session ID, dates, users                          │
│ ✓ Opening and closing balances                      │
│ ✓ Variance (for review if not balanced)            │
│ ✓ All linked sales                                  │
└─────────────────────────────────────────────────────┘
              ↓ (Reports & Analytics)
┌─────────────────────────────────────────────────────┐
│ REPORTING & ANALYSIS                                │
├─────────────────────────────────────────────────────┤
│ Available Frequencies:                              │
│ • Daily - single day sessions                       │
│ • Weekly - grouped by week                          │
│ • Monthly - grouped by month                        │
│ • Quarterly - Q1/Q2/Q3/Q4                          │
│ • Semi-Annual - H1/H2                              │
│ • Yearly - full year                                │
│                                                     │
│ Each report includes:                               │
│ ✓ Session count per period                          │
│ ✓ Total revenue per period                          │
│ ✓ Cash variance per session                         │
│ ✓ User performance metrics                          │
│ ✓ Trend analysis across periods                     │
└─────────────────────────────────────────────────────┘
```

---

## Complete Features Checklist

### Expected Cash Calculation ✅
- [x] Formula: Opening Balance + Cash Payments
- [x] Automatic calculation on session end
- [x] Variance analysis included
- [x] Percentage variance calculation
- [x] Balance status (isBalanced)

### Closing Balance Prompt ✅
- [x] Modal on logout if active session exists
- [x] Shows session info (name, opening balance)
- [x] User can skip and keep session open
- [x] User can end session and logout
- [x] Prevents incomplete logs
- [x] Toast notifications for success/error

### Report Frequency System ✅
- [x] 6 frequency levels defined
- [x] Automatic date range calculation
- [x] Grouping logic by frequency
- [x] Label generation for each frequency
- [x] Sessions report with frequency
- [x] Sales report with frequency grouping
- [x] Export reports with frequency annotations

### Audit Trail Enhancements ✅
- [x] Closing balance always recorded
- [x] Session end timestamp captured
- [x] User who closed session tracked
- [x] Variance documented in logs
- [x] All sales linked to session preserved

---

## Database Queries for Analysis

### Find Sessions with Cash Discrepancies

```sql
-- Sessions where cash didn't balance
SELECT 
  id,
  name,
  openedBy,
  closedBy,
  openingBalance,
  closingBalance,
  (closingBalance - (openingBalance + cashPayments)) as variance
FROM sessions
WHERE (closingBalance - (openingBalance + cashPayments)) != 0
ORDER BY createdAt DESC;
```

### Session Statistics by Frequency

```sql
-- Monthly session summary
SELECT 
  DATE_TRUNC('month', startTime) as month,
  COUNT(*) as sessionCount,
  AVG(EXTRACT(EPOCH FROM (endTime - startTime))/60) as avgDurationMinutes,
  SUM(closingBalance - openingBalance) as totalCashMovement
FROM sessions
WHERE status = 'CLOSED'
GROUP BY month
ORDER BY month DESC;
```

### User Performance

```sql
-- Top performing cashiers by revenue
SELECT 
  openedBy,
  COUNT(*) as sessionCount,
  SUM(totalRevenue) as totalRevenue,
  AVG(CASE WHEN isBalanced THEN 0 ELSE 1 END) as discrepancyRate
FROM sessions
WHERE status = 'CLOSED' AND MONTH(startTime) = MONTH(NOW())
GROUP BY openedBy
ORDER BY totalRevenue DESC;
```

---

## Testing Scenarios

### Scenario 1: Perfect Cash Balance
```
1. Open Morning session (opening balance: 1000)
2. Process sales:
   - Sale A: 200 cash
   - Sale B: 150 cash
   - Sale C: 100 card
3. Count cash: 1350 (1000 + 200 + 150)
4. End session with closing balance: 1350
5. ✅ Result: isBalanced = true, variance = 0
```

### Scenario 2: Cash Discrepancy
```
1. Open Evening session (opening balance: 5000)
2. Process sales: 1000 cash payments
3. Count cash: 5950 (only 950 from sales, 50 missing!)
4. End session with closing balance: 5950
5. ✅ Result: isBalanced = false, variance = -50
```

### Scenario 3: Safe Logout
```
1. Morning session active (opening: 1000)
2. User clicks logout
3. ✅ Modal appears: "Count cash and enter amount"
4. User enters: 1500
5. POST /sessions/:id/end with 1500
6. Session closes with complete audit trail
7. User logged out
```

### Scenario 4: Report Generation
```
1. Generate weekly sales report
2. System automatically:
   - Sets startDate: Monday of current week
   - Sets endDate: Today
3. Groups sessions by week
4. Returns:
   - Total sessions: 10
   - Total revenue: 50,000
   - Cash variance: -500
5. ✅ All annotated with week label
```

---

## Deployment Checklist

- [x] Backend session service updated
- [x] Reports service enhanced with frequency
- [x] Frontend safe logout hook created
- [x] SessionClosingModal component created
- [x] Navbar integrated with safe logout
- [ ] Restart backend server (DO THIS)
- [ ] Test closing balance prompt
- [ ] Test report frequency endpoints
- [ ] Monitor audit logs

## What's Next?

1. **Mobile Support** - Persist session through app backgrounding
2. **Reconciliation Dashboard** - Real-time cash variance alerts
3. **Auto-escalation** - Alert admin if variance > threshold
4. **Session Handoff** - Cashier A → Cashier B with single session
5. **Scheduled Reports** - Auto-generate and email reports at frequencies

---

## Summary

You now have:
✅ Complete expected cash calculation with variance analysis
✅ User prompted to provide closing balance on logout (no incomplete logs)
✅ 6 report frequency levels for flexible analysis
✅ Complete audit trail with all required data
✅ Professional session reconciliation system

This ensures your POS system maintains perfect audit trails, prevents orphaned sessions, and provides comprehensive reporting across all time periods! 🚀
