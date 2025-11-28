# Session Management - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ App.tsx                                                  │  │
│  │ ├─ BrowserRouter                                        │  │
│  │ ├─ SessionProvider ← [NEW] Wraps entire app             │  │
│  │ │  └─ SessionContext (SessionContext.tsx)              │  │
│  │ │     ├─ useAuth() hook                                │  │
│  │ │     ├─ activeSession state                           │  │
│  │ │     ├─ refreshSession() method                       │  │
│  │ │     └─ Calls GET /sessions/active on mount          │  │
│  │ │                                                       │  │
│  │ ├─ PosPage                                             │  │
│  │ │  └─ useSession() ← Gets activeSession from context  │  │
│  │ │     ├─ SessionControls (START/END UI)              │  │
│  │ │     ├─ ProductSearch (only if PURCHASE mode)       │  │
│  │ │     └─ Cart (shows active session info)            │  │
│  │                                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                ↓ API Calls
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ SessionsController                                       │  │
│  │ ├─ POST /sessions/start → startSession()               │  │
│  │ ├─ POST /sessions/:id/end → endSession()               │  │
│  │ ├─ GET /sessions/active → getActiveSession()           │  │
│  │ ├─ GET /sessions/history → getSessionHistory()         │  │
│  │ └─ GET /sessions/:id → getSessionDetails()             │  │
│  │    All methods: [✓ ADMIN, ✓ CASHIER]                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ SessionsService                                          │  │
│  │ ├─ startSession(branchId, userId, dto)                 │  │
│  │ │  └─ Validates: only one OPEN session per branch     │  │
│  │ ├─ endSession(sessionId, userId, dto)                 │  │
│  │ ├─ getActiveSession(branchId)                         │  │
│  │ └─ getSessionDetails(sessionId)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ AuthService - logout() [NEWLY ENHANCED]                │  │
│  │                                                         │  │
│  │ async logout(userId, ipAddress, userAgent) {          │  │
│  │   1. Get user to find branchId                        │  │
│  │   2. Find OPEN session for that branch                │  │
│  │   3. IF session exists:                               │  │
│  │      └─ Close it: status=CLOSED, endTime=now()       │  │
│  │      └─ Set closedById = userId (audit trail)        │  │
│  │   4. Clear refresh tokens                             │  │
│  │   5. Log audit entry                                  │  │
│  │ }                                                      │  │
│  │                                                         │  │
│  │ ✨ NEW: Sessions now auto-close on logout!            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Prisma ORM                                              │  │
│  │ └─ Database abstraction layer                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    ┌─────────────────┐
                    │ SQLite Database │
                    │ (or PostgreSQL) │
                    └─────────────────┘
                            ↓
                    ┌─────────────────┐
                    │  sessions table  │
                    ├─────────────────┤
                    │ id              │
                    │ branchId        │
                    │ openedById      │
                    │ closedById ✨   │ ← Now filled on logout!
                    │ status          │
                    │ startTime       │
                    │ endTime ✨      │ ← Now filled on logout!
                    │ openingBalance  │
                    │ closingBalance  │
                    │ createdAt       │
                    │ updatedAt       │
                    └─────────────────┘
```

## Session State Machine

```
                    ┌─────────────────────────────────┐
                    │  NO ACTIVE SESSION              │
                    │  (User on PosPage)              │
                    └─────────────────────────────────┘
                              ↑
                              │
                              │ User logs out
                              │
                    ┌─────────┴─────────┐
                    │                   │
        ┌───────────v──────────┐   ┌───v──────────────────┐
        │  START SESSION       │   │  END SESSION (Manual)│
        │  User clicks button  │   │  User clicks button  │
        │  Fills: name,        │   │  Fills: closeBalance │
        │         openBalance  │   │  POST end session    │
        └───────────┬──────────┘   └───┬──────────────────┘
                    │                   │
                    │ POST /start       │
                    │                   │
                    v                   v
         ┌────────────────────┐  ┌──────────────────┐
         │ Session.OPEN       │  │ Session.CLOSED   │
         │ ✓ Sales linked     │  │ ✓ endTime set    │
         │ ✓ Session active   │  │ ✓ closeBalance   │
         └────────┬───────────┘  └──────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
    ┌───v────────┐      ┌────v─────────┐
    │  END       │      │  LOGOUT      │
    │  Manual    │      │  WITHOUT END │
    │            │      │              │
    │ POST end   │      │ Backend      │
    │ session    │      │ auto-closes  │
    │            │      │ session!     │
    └────────────┘      └────┬─────────┘
         │                   │
         │                   │
         └───────┬───────────┘
                 │
                 v
    ┌────────────────────────┐
    │ Session.CLOSED ✅      │
    │ ✓ endTime filled       │
    │ ✓ closedBy filled      │
    │ ✓ Audit trail complete│
    │ ✓ Can logout          │
    └────────────────────────┘
```

## Data Flow: Session Start

```
User fills form in SessionControls
├─ Session name: "Morning"
├─ Opening balance: 5000
└─ Clicks "Start Session"
        ↓
   e.preventDefault()
   setIsSubmitting(true)
        ↓
   api.post('/sessions/start', {
     name: 'Morning',
     openingBalance: 5000
   })
        ↓
   FRONTEND HTTP POST
   ┌────────────────────────────────────────┐
   │ POST /api/v1/sessions/start            │
   │                                        │
   │ Headers:                               │
   │ - Authorization: Bearer {JWT}         │
   │ - Content-Type: application/json      │
   │                                        │
   │ Body:                                  │
   │ {                                      │
   │   "name": "Morning",                  │
   │   "openingBalance": 5000              │
   │ }                                      │
   └────────────────────────────────────────┘
        ↓
   BACKEND PROCESSING
   ┌────────────────────────────────────────┐
   │ JwtAuthGuard validates token           │
   │ ↓                                       │
   │ RolesGuard checks user role            │
   │ ✓ ADMIN or CASHIER allowed            │
   │ ↓                                       │
   │ ValidationPipe validates DTO           │
   │ ✓ name is string (not empty)          │
   │ ✓ openingBalance is number (optional) │
   │ ↓                                       │
   │ SessionsController.startSession()      │
   │ ├─ Gets branchId from req.user        │
   │ ├─ Gets userId from req.user          │
   │ ├─ Calls sessionsService.startSession()
   │ └─ Returns { success, data, message } │
   │ ↓                                       │
   │ SessionsService.startSession()         │
   │ ├─ Checks for existing OPEN session  │
   │ │  WHERE branchId=X AND status=OPEN  │
   │ ├─ If found: throw BadRequestException│
   │ ├─ If not found: create new session  │
   │ │  data: {                            │
   │ │    branchId: X,                     │
   │ │    openedById: userId,              │
   │ │    name: 'Morning',                 │
   │ │    openingBalance: 5000,            │
   │ │    status: 'OPEN',                  │
   │ │    startTime: now()                 │
   │ │  }                                   │
   │ └─ Returns session object             │
   └────────────────────────────────────────┘
        ↓
   RESPONSE TO FRONTEND
   ┌────────────────────────────────────────┐
   │ HTTP 201 Created                       │
   │ {                                      │
   │   "success": true,                    │
   │   "data": {                           │
   │     "id": "uuid-...",                 │
   │     "branchId": "branch-1",           │
   │     "name": "Morning",                │
   │     "openingBalance": 5000,           │
   │     "status": "OPEN",                 │
   │     "startTime": "2025-11-28T06:00Z", │
   │     "endTime": null,                  │
   │     "openedBy": { user data },        │
   │     ...                                │
   │   },                                   │
   │   "message": "Session started..."     │
   │ }                                      │
   └────────────────────────────────────────┘
        ↓
   FRONTEND HANDLING
   ├─ setIsSubmitting(false)
   ├─ toast.success('Session started')
   ├─ await refreshSession()
   │  └─ Calls GET /sessions/active
   │     └─ Updates SessionContext.activeSession
   └─ SessionControls re-renders
      └─ Shows END SESSION button (not START)
```

## Data Flow: Session End on Logout

```
User clicks Logout button
        ↓
   authStore.logout()
        ↓
   Frontend API call:
   POST /api/v1/auth/logout
   Headers: Authorization: Bearer {JWT}
        ↓
   BACKEND: auth.controller.logout()
        ↓
   BACKEND: auth.service.logout(userId, ip, ua)
        ↓
   NEW LOGIC IN SERVICE:
   ┌──────────────────────────────────────────┐
   │ 1. Get user record                       │
   │    SELECT * FROM users WHERE id = userId│
   │    → Retrieves user.branchId             │
   │                                          │
   │ 2. Find active session for branch       │
   │    SELECT * FROM sessions               │
   │    WHERE branchId = user.branchId       │
   │    AND status = 'OPEN'                   │
   │    → Finds active session               │
   │                                          │
   │ 3. Close the session                    │
   │    UPDATE sessions                      │
   │    SET status = 'CLOSED',               │
   │        endTime = NOW(),                 │
   │        closedById = userId              │
   │    WHERE id = session.id                │
   │                                          │
   │    ✨ KEY: Session now has:            │
   │    • endTime = timestamp of logout      │
   │    • closedById = user who logged out   │
   │    • status = CLOSED (permanent record) │
   │                                          │
   │ 4. Continue logout (existing logic)     │
   │    • Clear refresh tokens               │
   │    • Log audit entry                    │
   │                                          │
   └──────────────────────────────────────────┘
        ↓
   Return: { success: true }
        ↓
   FRONTEND:
   ├─ Clear auth store
   ├─ Clear localStorage
   └─ Redirect to /login
        ↓
   DATABASE RECORD EXAMPLE:
   ┌────────────────────────────────┐
   │ Session (AFTER logout)          │
   ├────────────────────────────────┤
   │ id: 'session-123'              │
   │ branchId: 'branch-1'           │
   │ openedById: 'user-abc'         │
   │ closedById: 'user-abc' ← NEW   │
   │ name: 'Morning'                │
   │ status: 'CLOSED' ← UPDATED    │
   │ startTime: 06:00               │
   │ endTime: 14:30 ← NEW          │
   │ openingBalance: 5000           │
   │ closingBalance: null ← No manual
   │ createdAt: ...                 │
   │ updatedAt: ...                 │
   └────────────────────────────────┘
        ↓
   AUDIT LOG ENTRY:
   ┌────────────────────────────────┐
   │ Action: LOGOUT                 │
   │ User: user-abc                 │
   │ Timestamp: 14:30               │
   │ Session Closed: session-123    │
   │ Result: Session closed by auto │
   └────────────────────────────────┘
```

## Comparison: Before vs After

```
BEFORE (Problem)                    AFTER (Fixed)
─────────────────────────────────────────────────

1. User logout
   └─ Session REMAINS OPEN         1. User logout
                                    └─ Backend finds session
2. No endTime set                     └─ Auto-closes it
   └─ Audit incomplete              
                                    2. endTime automatically set
3. Can't tell when shift ended        └─ Audit complete
   └─ Cash reconciliation broken     
                                    3. Know exactly when shift ended
4. Orphaned sessions possible        └─ Cash reconciliation works
   └─ Compliance risk                
                                    4. No orphaned sessions
5. Can't track who closed session    └─ Compliance safe
   └─ Audit trail incomplete        
                                    5. Automatic tracking of who closed
                                    └─ Full audit trail
```

## Timeline Example

```
TIME    | USER        | ACTION               | SESSION STATE
────────┼─────────────┼──────────────────────┼────────────────────────
06:00   | alice       | Login                | ─
06:05   | alice       | Start Session        | status=OPEN, start=06:05
        |             | (Morning, $5000)     | openedBy=alice
        |             |                      |
06:10   | alice       | Sell $100            | (still OPEN, sale linked)
06:20   | alice       | Sell $200            | (still OPEN, sale linked)
        |             |                      |
14:25   | alice       | Sell $50             | (still OPEN, sale linked)
        |             |                      |
14:30   | alice       | Click Logout         | status=CLOSED
        |             |                      | end=14:30
        |             |                      | closedBy=alice
        |             |                      | ✨ AUTO-CLOSED!
        |             |                      |
14:30   | alice       | Redirected to login  | Session locked in DB
        |             |                      |
        |             |                      |
14:35   | bob         | Login                | ─
14:40   | bob         | Start Session        | status=OPEN, start=14:40
        |             | (Evening, $5000)     | openedBy=bob
        |             |                      |
---     | ADMIN       | View Sessions Report | ✓ Morning: 08:25 duration
        |             |                      | ✓ Evening: ongoing
        |             |                      | ✓ Total sales: $350
        |             |                      | ✓ Cash in: $5350 expected
```

## Key Improvements

```
┌─ Auto-Close on Logout ─────────────────────────────────┐
│                                                        │
│ BEFORE: User logs out                                 │
│         └─ Session still OPEN in DB                   │
│            └─ Zombie session forever                  │
│            └─ Can't audit shift end                   │
│            └─ Cash reconciliation impossible          │
│                                                        │
│ AFTER:  User logs out                                 │
│         └─ Backend finds session                      │
│            └─ Closes it automatically                 │
│            └─ Sets endTime = now()                    │
│            └─ Sets closedBy = user                    │
│            └─ Can audit shift end                     │
│            └─ Cash reconciliation works               │
│            └─ Compliance audit trail complete        │
└────────────────────────────────────────────────────────┘
```

This ensures **zero orphaned sessions** and **complete audit trail** ✅
