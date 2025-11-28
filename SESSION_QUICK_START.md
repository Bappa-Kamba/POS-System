# Session Management - Quick Start Guide

## What Changed?

### Backend Updates
1. **Auto-close sessions on logout** - Sessions now automatically close when users log out
2. **Consistent API responses** - All session endpoints return `{ success, data, message }` format
3. **Role-based access** - CASHIER users can now access session and branch settings endpoints

### Frontend (No changes needed)
- SessionContext already correctly implements session management
- useSettings hook updated with `retry: false` to prevent repeated failed requests

## How Sessions Work Now

### Starting a Session
1. User logs in → PosPage loads
2. SessionContext checks for active session via `/sessions/active`
3. If no session exists → SessionControls shows "Start New Session" form
4. User selects session name (Morning/Evening) and enters opening balance
5. POST to `/sessions/start` → Session created with OPEN status

### During Session
- All sales are linked to the active session
- SessionContext keeps session data in sync
- User can see active session info in SessionControls

### Ending a Session (Two Ways)

**Way 1: Manual Closure (Recommended)**
1. User clicks "End Session" button
2. Enters closing balance (actual cash in drawer)
3. POST to `/sessions/:id/end`
4. Session marked as CLOSED
5. Can now logout normally

**Way 2: Automatic Closure (On Logout)**
1. User clicks logout without closing session
2. Backend detects active session in auth service
3. Automatically closes it with CLOSED status
4. Session.closedBy = current user
5. User successfully logged out

## Testing

### Test Case 1: Normal Session Flow
```
1. Login as admin/cashier
2. Click "Start New Session" 
3. Fill in name: "Morning", opening balance: "5000"
4. Click "Start"
5. Confirm: ✅ Session started successfully
6. ✅ SessionControls shows active session
7. Add some items to cart and complete a sale
8. Click "End Session"
9. Enter closing balance: "5500"
10. Click "End"
11. ✅ Session ended successfully
12. Logout
13. ✅ Redirected to login
```

### Test Case 2: Auto-close on Logout
```
1. Login as admin/cashier
2. Start a session (Morning, opening balance 5000)
3. ✅ Session active
4. Click Logout without clicking "End Session"
5. ✅ Redirected to login page
6. Login again with admin account
7. Go to Reports → Sessions (if admin)
8. ✅ Previous session should show CLOSED status
```

### Test Case 3: Single Session Per Branch
```
1. Login as user1
2. Start session "Morning"
3. ✅ Session created
4. Login as user2 (same branch)
5. Try to start session "Evening"
6. ❌ Should see error: "There is already an active session"
7. User2 cannot start new session
8. ✅ Correct behavior
```

## Troubleshooting

### Problem: "There is already an active session for this branch"
**Solution**: 
- Another user has an active session
- Admin can logout that session via automatic closure
- Or navigate to Reports to manually close old session

### Problem: Session not appearing after refresh
**Solution**: 
- Normal behavior! SessionContext fetches `/sessions/active` on every mount
- If user is logged in, active session will reload
- Check browser DevTools → Network to verify request is successful

### Problem: 400 Bad Request on /sessions/start
**Solutions**:
1. Check form data in browser DevTools → Network tab
2. Ensure `name` field contains "Morning" or "Evening"
3. Ensure `openingBalance` is a valid number
4. Check browser console for validation errors

## Configuration

No configuration needed! The system uses:
- Default session status values (OPEN/CLOSED)
- Automatic timestamps (startTime, endTime)
- User tracking (openedBy, closedBy)

## Database Notes

Sessions are permanently stored in database:
- Never deleted, only marked as CLOSED
- Used for audit trail and reporting
- Can query `/sessions/history` for branch session list

## Migration Guide (If needed)

No database migration required. Session schema is already in place.

If you need to clean up orphaned sessions:
```sql
-- Find and close orphaned sessions (OPEN sessions from > 24 hours ago)
SELECT * FROM sessions 
WHERE status = 'OPEN' 
AND startTime < NOW() - INTERVAL 1 DAY;

-- Close them (manual fix)
UPDATE sessions 
SET status = 'CLOSED', endTime = NOW() 
WHERE status = 'OPEN' 
AND startTime < NOW() - INTERVAL 1 DAY;
```

## Next Steps

1. Restart backend server
2. Test the flows above
3. Monitor for any session-related errors
4. Review audit logs to verify session tracking
5. Consider enabling session history reports in admin dashboard

## Support

For issues:
1. Check SESSION_MANAGEMENT.md for detailed documentation
2. Check IMPLEMENTATION_SUMMARY.md for technical details
3. Review backend logs for session-related errors
4. Check browser DevTools for frontend errors
