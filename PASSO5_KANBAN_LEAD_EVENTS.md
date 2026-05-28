# Passo 5: Socket.io Kanban & Lead Events Integration

**Status:** ✅ Complete  
**Date:** 2026-05-27  
**Implementation Time:** ~30 minutes

## Overview

Passo 5 extends the Socket.io infrastructure from Passo 4 by integrating real-time events for Kanban operations and Lead status changes.

## Events Implemented

### Kanban Events

#### 1. KANBAN_CARD_CREATED
**Trigger:** When a new Kanban card is created  
**Endpoint:** `POST /api/kanban`  
**Emitted Data:**
```typescript
{
  cardId: string;
  leadId: string;
  sector: "COMMERCIAL" | "LEGAL" | "ADMINISTRATIVE";
  stage: "todo" | "in_progress" | "done";
  position: number;
  userId: string;
  timestamp: Date;
}
```
**Frontend Notification:** 
- 📋 "Novo card criado: [Lead Name]"
- Appears in top-right toast

#### 2. KANBAN_CARD_MOVED
**Trigger:** When card moves between sectors or stages  
**Endpoint:** `PUT /api/kanban/:id`  
**Emitted Data:**
```typescript
{
  cardId: string;
  oldSector?: string;
  newSector?: string;
  oldStage?: string;
  newStage?: string;
  position: number;
  userId: string;
  timestamp: Date;
}
```
**Frontend Notification:**
- 📊 "Card movido para [New Sector] - [New Stage]"

#### 3. KANBAN_CARD_DELETED
**Trigger:** When card is deleted  
**Endpoint:** `DELETE /api/kanban/:id`  
**Emitted Data:**
```typescript
{
  cardId: string;
  userId: string;
  timestamp: Date;
}
```
**Frontend Notification:**
- ❌ "Card deletado"

### Lead Events

#### 4. LEAD_STATUS_CHANGED
**Trigger:** When lead status is updated  
**Endpoints:** 
- `PUT /api/leads/:id` (if `status` field included)
- `PATCH /api/leads/:id/status` (dedicated endpoint)

**Emitted Data:**
```typescript
{
  leadId: string;
  oldStatus?: string;
  newStatus: string; // "Inicial" | "Consultando" | "Pagamento" | "Perda" | "Convertido"
  userId: string;
  timestamp: Date;
}
```
**Frontend Notification:**
- 🔄 "Status atualizado: [Lead Name] → [New Status]"

#### 5. LEAD_CONVERTED
**Trigger:** When lead status changes to "Convertido"  
**Endpoint:** `PATCH /api/leads/:id/status` (with `status: "Convertido"`)  
**Emitted Data:**
```typescript
{
  leadId: string;
  userId: string;
  timestamp: Date;
}
```
**Frontend Notification:**
- ✨ "Lead convertido: [Lead Name]! 🎉"

## Backend Implementation Changes

### Modified Files

#### `backend/src/controllers/kanban.ts`
- ✅ Import `socketService`
- ✅ `createKanbanCard()` - Emit KANBAN_CARD_CREATED
- ✅ `updateKanbanCard()` - Emit KANBAN_CARD_MOVED
- ✅ `deleteKanbanCard()` - Emit KANBAN_CARD_DELETED

#### `backend/src/controllers/leads.ts`
- ✅ Import `socketService`
- ✅ `updateLead()` - Emit LEAD_STATUS_CHANGED (if status changed)
- ✅ `updateLeadStatus()` - Emit LEAD_STATUS_CHANGED + LEAD_CONVERTED (if applicable)

### Code Pattern

All emissions follow this pattern:
```typescript
// After successful database operation
socketService.emitEventName({
  // Event-specific data
  timestamp: new Date(),
  userId: req.userId || 'system',
});
```

## Frontend Handler Example

The frontend `useSocket` hook already has listeners for all these events:

```typescript
const { 
  onKanbanCardMoved, 
  onKanbanCardCreated, 
  onKanbanCardDeleted,
  onLeadStatusChanged,
  onLeadConverted 
} = useSocket();

useEffect(() => {
  const unsubscribe = onKanbanCardCreated((data) => {
    // Handle card creation - update UI optimistically
  });
  return () => unsubscribe?.();
}, [onKanbanCardCreated]);
```

## Testing Procedures

### Test 1: Create Kanban Card
```bash
curl -X POST http://localhost:3000/api/kanban \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "lead-id-here",
    "sector": "COMMERCIAL",
    "stage": "todo",
    "notes": "Test card"
  }'
```

**Expected Result:**
- ✅ HTTP 201 Created
- ✅ Card created in database
- ✅ Socket.io event emitted to all connected clients
- ✅ Toast notification appears in UI

### Test 2: Move Kanban Card
```bash
curl -X PUT http://localhost:3000/api/kanban/card-id \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sector": "LEGAL",
    "stage": "in_progress",
    "position": 0
  }'
```

**Expected Result:**
- ✅ HTTP 200 OK
- ✅ Card updated in database
- ✅ KANBAN_CARD_MOVED event emitted
- ✅ UI updates show card in new position

### Test 3: Update Lead Status
```bash
curl -X PATCH http://localhost:3000/api/leads/lead-id/status \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Convertido"
  }'
```

**Expected Result:**
- ✅ HTTP 200 OK
- ✅ Lead status updated to "Convertido"
- ✅ LEAD_STATUS_CHANGED event emitted
- ✅ LEAD_CONVERTED event emitted (bonus)
- ✅ Two toast notifications appear:
  - "Status atualizado..."
  - "Lead convertido...! 🎉"

### Test 4: Multi-User Sync
1. **Browser 1:** Login and go to /kanban
2. **Browser 2:** Login and go to /kanban
3. **Terminal:** Create/move/delete cards via API
4. **Expected:** Both browsers see updates in real-time

## Integration with Frontend UI

### Kanban Board Component
- When KANBAN_CARD_MOVED event received:
  - Update card position optimistically
  - Fetch updated card from API to verify
  - Show toast: "Card atualizado em tempo real"

### Lead List Component
- When LEAD_STATUS_CHANGED event received:
  - Update lead status in table
  - Fetch updated lead to confirm
  - Show toast with new status

### Dashboard Component
- When LEAD_CONVERTED event received:
  - Increment "Clientes Convertidos" counter
  - Show celebratory toast: "Lead convertido! 🎉"
  - Play success sound (optional)

## Architecture Diagram

```
Frontend              Backend                       Database
  │                    │                               │
  │─── Kanban Page ──→ POST /api/kanban       ────→   │
  │                    │ (with auth)                   │ Create Card
  │                    │ emit KANBAN_CARD_CREATED      │
  │ ←─────────────────────────────────────────────────│
  │  Socket.io Event                                   │
  │  (toast appears)                                   │
  │                                                    │
  │─── Move Card ─────→ PUT /api/kanban/:id  ────→   │
  │                    │ (with auth)                   │ Update Card
  │                    │ emit KANBAN_CARD_MOVED        │
  │ ←─────────────────────────────────────────────────│
  │  Socket.io Event                                   │
  │  (UI updates)                                      │
```

## Performance Considerations

1. **Event Emission is Non-Blocking**
   - Database update happens first
   - Socket.io event emitted after
   - If socket fails, database still updated

2. **Broadcast Scope**
   - All connected clients receive event
   - Events are namespaced by type
   - Only relevant users see their notifications

3. **Memory Usage**
   - Socket.io maintains user-to-socket mapping
   - Memory grows with number of concurrent users
   - Automatic cleanup on disconnect

## Error Handling

Events are NOT emitted if:
- Database operation fails
- Request authentication fails
- Request validation fails

Example:
```typescript
try {
  const card = await kanbanService.createCard(...);
  // Only if above succeeds:
  socketService.emitKanbanCardCreated(...);
} catch (error) {
  res.status(400).json({ error: 'Failed' });
  // No Socket.io event emitted
}
```

## Files Modified

```
✅ backend/src/controllers/kanban.ts (3 methods updated)
✅ backend/src/controllers/leads.ts (2 methods updated)
✅ backend/src/socket/events.ts (no changes, types already defined)
✅ backend/src/socket/service.ts (no changes, methods already defined)
```

## Verification Checklist

- ✅ socketService imported in kanban.ts
- ✅ socketService imported in leads.ts
- ✅ KANBAN_CARD_CREATED event emitted in createKanbanCard()
- ✅ KANBAN_CARD_MOVED event emitted in updateKanbanCard()
- ✅ KANBAN_CARD_DELETED event emitted in deleteKanbanCard()
- ✅ LEAD_STATUS_CHANGED event emitted in updateLead()
- ✅ LEAD_STATUS_CHANGED event emitted in updateLeadStatus()
- ✅ LEAD_CONVERTED event emitted when status === "Convertido"
- ✅ Frontend useSocket hook has all listeners
- ✅ NotificationsContainer renders Socket events
- ✅ Layout component passes events to notifications

## Next Steps

1. **Build & Test**
   ```bash
   cd backend && npm run build
   ```

2. **Start Services**
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd frontend && npm run dev
   ```

3. **Test Multi-Client Sync**
   - Open app in 2 browsers
   - Perform Kanban/Lead operations
   - Watch notifications appear in real-time

4. **Passo 6: Email Automation**
   - Send emails on lead conversion
   - Send digest of daily Kanban activity
   - Send status change notifications

---

**Summary:** Passo 5 successfully extends Socket.io with Kanban and Lead events, enabling real-time collaboration across the platform. All 5 major event types are implemented and integrated. Ready for production testing.
