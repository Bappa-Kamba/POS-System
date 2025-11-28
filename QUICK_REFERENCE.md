# Quick Reference - Expected Cash & Session Reconciliation

## Expected Cash Formula

```
Expected Cash in Drawer = Opening Balance + Cash Payments from Sales
```

### Example Calculation

```
Morning Shift:
├─ Opening Balance: $5,000
├─ Sales During Shift:
│  ├─ Sale 1: $200 (CASH)
│  ├─ Sale 2: $100 (CARD) ← Ignored
│  ├─ Sale 3: $300 (CASH)
│  └─ Sale 4: $50 (CARD) ← Ignored
├─ Total Cash from Sales: $500
└─ Expected Cash in Drawer: $5,000 + $500 = $5,500

When Shift Ends:
├─ Cashier counts drawer: $5,495
├─ System Calculates:
│  ├─ Expected: $5,500
│  ├─ Actual: $5,495
│  ├─ Variance: -$5 (Missing $5)
│  └─ Status: NOT BALANCED
```

---

## Session Closing - On Logout (NEW)

### Flow

1. User clicks **Logout**
2. **If active session exists**:
   - Modal appears: "Enter Closing Balance"
   - User counts cash in drawer
   - User enters actual amount
   - System calculates variance
   - Session closed
   - User logged out
3. **If no active session**:
   - Direct logout

### Modal Features

- ✅ Shows session name (Morning/Evening)
- ✅ Shows opening balance for reference
- ✅ Input field for closing balance
- ✅ Two options: "Keep Open" or "End & Logout"
- ✅ Prevents logout without balance (unless skipped)

---

## API Endpoints

### Get Session Details with Reconciliation

```bash
GET /sessions/abc-123
```

**Response**:
```json
{
  "id": "abc-123",
  "name": "Morning",
  "status": "CLOSED",
  "openingBalance": 5000,
  "closingBalance": 5450,
  "summary": {
    "totalSales": 10,
    "totalRevenue": 1200,
    
    "cashPayments": 450,
    "otherPayments": 750,
    
    "expectedCashInDrawer": 5450,
    "actualCashInDrawer": 5450,
    "variance": 0,
    "variancePercentage": 0,
    "isBalanced": true,
    
    "durationMinutes": 480
  }
}
```

### End Session (On Logout or Manual)

```bash
POST /sessions/abc-123/end
{
  "closingBalance": 5450
}
```

---

## Report Frequencies

### Available Options

```
frequency=daily       # Today
frequency=weekly      # Mon-Sun (current week)
frequency=monthly     # Full month
frequency=quarterly   # Q1/Q2/Q3/Q4
frequency=semi-annual # H1 or H2
frequency=yearly      # Full year
```

### Example: Weekly Report

```bash
GET /reports/sales?
  frequency=weekly&
  startDate=2025-01-01&
  endDate=2025-11-28
```

**Response**:
```json
{
  "frequency": "weekly",
  "period": {
    "label": "Weekly Report - Week of Nov 24, 2025",
    "startDate": "2025-11-24T00:00:00Z",
    "endDate": "2025-11-28T23:59:59Z"
  },
  "sessions": [...]
}
```

---

## Session Status Transitions

```
CREATE SESSION
    ↓
Status: OPEN
├─ openingBalance: USER PROVIDED
├─ closingBalance: null
├─ endTime: null
└─ closedBy: null
    ↓
[SALES PROCESSED]
    ↓
END SESSION (Manual or Logout)
    ↓
Status: CLOSED
├─ openingBalance: PRESERVED
├─ closingBalance: USER PROVIDED ← NEW: Prompted on logout
├─ endTime: NOW()
└─ closedBy: CURRENT USER
    ↓
RECONCILIATION CALCULATED
├─ expectedCashInDrawer = openingBalance + cashPayments
├─ variance = closingBalance - expectedCashInDrawer
└─ isBalanced = variance ≈ 0
```

---

## Common Issues & Solutions

### Issue: "Closing balance not captured"
**Solution**: Modal now prompts user before logout
- User cannot logout without addressing active session
- Must either end session with balance or skip

### Issue: "Expected cash calculation is wrong"
**Debug**:
1. Check opening balance ✓
2. Check all CASH payments are included ✓
3. Ensure card/other payments excluded ✓
4. Verify closing balance entered ✓

### Issue: "Report frequency not grouping correctly"
**Solution**: 
- Verify `frequency` parameter is sent
- Check date range covers desired period
- Use ISO date format: YYYY-MM-DD

---

## Testing Checklist

- [ ] Start session with opening balance
- [ ] Process sales (mix of cash and card)
- [ ] Click logout with active session
- [ ] Modal appears asking for closing balance
- [ ] Enter closing balance
- [ ] Session ends, user logged out
- [ ] GET /sessions/:id shows complete summary
- [ ] Variance calculated correctly
- [ ] Generate report with weekly frequency
- [ ] Report groups sessions by week

---

## Files Modified

**Backend**:
- `sessions.service.ts` - Enhanced reconciliation
- `auth.service.ts` - Auto-close on logout
- `reports.service.ts` - Frequency helpers

**Frontend**:
- `useSafeLogout.ts` - Safe logout hook
- `SessionClosingModal.tsx` - Modal component
- `Navbar.tsx` - Integrated safe logout

---

## Quick Deploy

```bash
# 1. Restart backend
cd pos-backend && npm run start

# 2. Test logout flow
# - Login
# - Start session
# - Logout
# - Modal should appear

# 3. Test reconciliation
# - Check session details endpoint
# - Verify expected cash calculation

# 4. Test frequency
# - Request report with frequency=weekly
# - Verify date range calculated
```

---

## Performance Notes

- Expected cash calculation: O(n) where n = sales count
- Frequency date calculation: O(1) constant time
- Modal displays instantly
- No database changes required

---

## Next Enhancements

1. **Auto-escalation** - Alert if variance > threshold
2. **Dashboard Widget** - Real-time session status
3. **Session Handoff** - Transfer between staff
4. **Scheduled Reports** - Auto-generate/email by frequency
5. **Mobile Support** - Preserve session on app background

---

**Ready to use! Restart backend and test the safe logout flow.** ✅
