# Session Management System

## Overview

The POS System implements a comprehensive session management strategy that ensures proper tracking of shift operations, audit trails, and prevents data integrity issues.

## Session Lifecycle

### 1. Session Creation
- **When**: User clicks "Start New Session" button on POS page
- **Requirements**:
  - Only one active session per branch at a time
  - User provides session name (Morning/Evening) and opening balance
  - Opening balance represents cash in drawer at shift start
- **Response**: Session created with OPEN status

### 2. Session Active Period
- **During**: Cashier performs POS transactions
- **Features**:
  - All sales are linked to the active session
  - Session can be ended anytime by user
  - User can view active session details in SessionControls component
  - Session ID is tracked for audit and reporting

### 3. Session Closure

Sessions are closed in TWO scenarios:

#### A. Manual Closure (Recommended)
- User clicks "End Session" button
- User enters closing balance (actual cash in drawer)
- System calculates difference between expected and actual cash
- Session marked as CLOSED

#### B. Automatic Closure (on User Logout)
- When user logs out, the backend automatically:
  1. Finds any active session for the user's branch
  2. Closes it with CLOSED status
  3. Sets `endTime` to current timestamp
  4. Records who closed it (the logging-out user)

**This ensures no orphaned sessions remain open.**

## Key Rules

### ✅ DO:
- Always manually end sessions before logging out
- End sessions at shift boundaries (Morning → Evening)
- Record closing balance accurately for cash reconciliation
- Monitor active sessions in admin reports

### ❌ DON'T:
- Leave sessions open when switching users
- Force close the browser without ending the session first
- Start multiple sessions for same branch (system prevents this)

## Database Schema

```prisma
model Session {
  id String @id @default(uuid())
  branchId String
  openedById String
  closedById String?
  
  name String // "Morning", "Evening"
  status SessionStatus // OPEN, CLOSED
  
  startTime DateTime @default(now())
  endTime DateTime?
  
  openingBalance Decimal // Cash at start
  closingBalance Decimal? // Cash at end
  
  sales Sale[]
  
  openedBy User @relation("SessionOpenedBy", fields: [openedById], references: [id])
  closedBy User? @relation("SessionClosedBy", fields: [closedById], references: [id])
}
```

## Frontend Implementation

### SessionContext (contexts/SessionContext.tsx)
Manages:
- `activeSession` - Current session details
- `isLoading` - Loading state during fetch
- `refreshSession()` - Manual refresh of session data

Usage:
```tsx
const { activeSession, isLoading, refreshSession } = useSession();
```

### SessionControls (components/session/SessionControls.tsx)
UI for:
- Starting new session (form with name + opening balance)
- Ending active session (confirmation + closing balance)
- Displays current session info and countdown timer (future)

### Session Flow on Login
1. User logs in
2. SessionContext mounts and calls `refreshSession()`
3. Fetches `/sessions/active` to get current branch session
4. If no active session exists, user is presented with start session form
5. SessionControls component handles all session operations

## Backend Implementation

### SessionsService
- `startSession()` - Creates new session, validates no other open session exists
- `endSession()` - Closes session, validates session exists and is open
- `getActiveSession()` - Gets current open session for branch
- `getSessionDetails()` - Gets session + summary (totals, cash reconciliation)

### AuthService (Logout Flow)
```typescript
async logout(userId: string, ipAddress?: string, userAgent?: string) {
  // Get user branch
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  
  // End active session if exists
  if (user?.branchId) {
    const activeSession = await this.prisma.session.findFirst({
      where: { branchId: user.branchId, status: 'OPEN' }
    });
    
    if (activeSession) {
      await this.prisma.session.update({
        where: { id: activeSession.id },
        data: {
          status: 'CLOSED',
          endTime: new Date(),
          closedById: userId
        }
      });
    }
  }
  
  // ... rest of logout logic
}
```

## API Endpoints

### POST /sessions/start
Start new session
```json
{
  "name": "Morning",
  "openingBalance": 5000
}
```

Response:
```json
{
  "success": true,
  "data": { session object },
  "message": "Session started successfully"
}
```

### POST /sessions/:id/end
End active session
```json
{
  "closingBalance": 5500
}
```

### GET /sessions/active
Get current active session
Response includes `openedBy` user details

### GET /sessions/history
Get all sessions for branch (last 20)

### GET /sessions/:id
Get detailed session info with sales summary

## Troubleshooting

### Issue: 400 Bad Request on /sessions/start
- **Cause**: Invalid DTO data (name not a string, balance not a number)
- **Fix**: Ensure form sends `name` as string and `openingBalance` as number
- **Check**: Browser DevTools → Network tab to see request payload

### Issue: "There is already an active session for this branch"
- **Cause**: Previous session wasn't closed properly
- **Fix**: Admin manually closes the orphaned session or contact support
- **Prevention**: Always use "End Session" button before logout

### Issue: Session not persisting across page refresh
- **Cause**: SessionContext re-fetches from API, normal behavior
- **Fix**: This is expected - app calls `/sessions/active` on mount
- **Note**: Active session data is stored in database, not localStorage

## Future Enhancements

1. **Time-based Auto-closure**: Sessions auto-close after X hours or at specific time
2. **Session Timeout Warning**: Alert user before auto-closing
3. **Multi-shift Management**: Support concurrent sessions from different users
4. **Session Handoff**: Allow cashier A to hand off to cashier B mid-shift
5. **Mobile Notifications**: Notify on session end/issues

## Audit Trail

All session operations are logged in `AuditLog`:
- Session start (user, time, opening balance)
- Session end (user, time, closing balance, difference)
- Cash discrepancies flagged for review

Sessions provide complete audit trail for compliance and reconciliation.
