# Monitoring Integration Update

## Overview
This update restructures the Monitoring system to be assignment-specific instead of a standalone global monitoring page. Monitoring is now integrated directly into the Taken (Task Assignment) page, allowing admins to view location and reports for each specific assignment.

## Major Changes

### 1. Removed Monitoring from Sidebar Navigation
- **Files Modified:**
  - `frontend-web/src/pages/shared/Sidebar.jsx`
  - `frontend-web/src/utils/auth.js`
  
- **Changes:**
  - Removed "Monitoring" menu item from sidebar
  - Removed `MONITORING` permission from `PERMISSIONS` object
  - Monitoring is no longer accessible as a standalone page from navigation

### 2. Updated Routing Architecture
- **File Modified:** `frontend-web/src/App.jsx`

- **Old Route:**
  ```jsx
  <Route path="/monitoring" element={<Monitoring />} />
  ```

- **New Route:**
  ```jsx
  <Route path="/monitoring/:takenTaskId" element={
    <ProtectedRoute permission="TAKEN">
      <Monitoring />
    </ProtectedRoute>
  } />
  ```

- **Changes:**
  - Monitoring now requires `takenTaskId` parameter in URL
  - Uses same permission as Taken page (`TAKEN`)
  - Accessed only via Taken page's monitoring button

### 3. Added Monitoring Column to Taken Page
- **Files Modified:**
  - `frontend-web/src/pages/Taken/Taken.jsx`
  - `frontend-web/src/pages/Taken/Taken.css`

- **Changes:**
  - Added `useNavigate` hook for navigation
  - Added new "Monitor" column in assignment table
  - Added monitoring button with eye icon for each assignment
  - Button navigates to `/monitoring/{taken_task_id}`
  - Added styling for `.monitor-btn` with blue color theme

- **UI Updates:**
  ```jsx
  <td className="monitor-cell">
    <button
      className="action-btn monitor-btn"
      onClick={() => navigate(`/monitoring/${taken.taken_task_id}`)}
      title="View Monitoring"
    >
      {/* Eye icon SVG */}
    </button>
  </td>
  ```

### 4. Added Report API Functions
- **File Modified:** `frontend-web/src/services/api.js`

- **New Functions:**
  - `getReports(filters)` - Get all reports with optional filters
  - `getReportsByTask(taskId)` - Get reports for a specific task
  - `getReportsByTakenTask(takenTaskId)` - Get reports for specific assignment
  - `getMyReports()` - Get employee's own reports

### 5. Created New ReportsPanel Component
- **Files Created:**
  - `frontend-web/src/pages/Monitoring/ReportsPanel.jsx`
  - `frontend-web/src/pages/Monitoring/ReportsPanel.css`

- **Features:**
  - Collapsible panel (420px when expanded, 60px when collapsed)
  - Displays all reports for the specific assignment
  - Shows user avatar, name, email, and timestamp
  - Displays report description/text
  - Image gallery with clickable images (opens full-size modal)
  - Loading state with spinner
  - Empty state with helpful message
  - Report count badge in header
  - Smooth animations and transitions
  - Vertical scroll for long report lists

- **Design:**
  - Modern card-based layout
  - Gradient avatars for user identification
  - Grid layout for images
  - Full-screen image modal on click
  - Responsive design

### 6. Redesigned Monitoring Page
- **Files Modified:**
  - `frontend-web/src/pages/Monitoring/Monitoring.jsx`
  - `frontend-web/src/pages/Monitoring/Monitoring.css`

#### Old Design:
- Global monitoring for all teams
- FilterPanel for team/status/date filtering
- Sample hardcoded member data
- Generic header with total stats

#### New Design:
- Assignment-specific monitoring
- Accepts `takenTaskId` from route params
- Fetches real assignment data and reports
- ReportsPanel instead of FilterPanel
- Compact header with back button
- Assignment-specific information display

#### Key Changes:

**Data Fetching:**
- Uses `useParams()` to get `takenTaskId`
- Fetches assignment details via `getAssignmentDetails()`
- Fetches reports via `getReportsByTakenTask()`
- Real-time stats calculation based on actual data

**Header Design:**
- Compact header (reduced height)
- Back button to return to Taken page
- Displays task title and date
- Three stats: Team Members, Reported, Pending
- Color-coded stats (green for active, red for offline)

**Member Locations:**
- Maps assignment users to location markers
- Uses report coordinates (latitude/longitude) if available
- Falls back to default Jakarta coordinates if no report
- Status determined by report existence (active/offline)

**Layout:**
- MapView on left/top
- ReportsPanel on right/bottom
- Responsive flex layout
- Gap padding between components

**States:**
- Loading state with spinner
- Error state with message and back button
- Success state showing map + reports

## API Integration

### Endpoints Used:
1. **GET /api/admin/assignments/{id}**
   - Gets assignment details including task info and assigned users
   - Response structure: `{ assignment: {...} }`

2. **GET /api/admin/reports?taken_task_id={id}**
   - Gets all reports for specific assignment
   - Includes user details and images
   - Response structure: `{ data: [...] }`

### Data Flow:
```
Taken Page → Click Monitor → /monitoring/:takenTaskId
  ↓
Monitoring Component
  ↓
Fetch Assignment Details + Reports
  ↓
Display Map (User Locations) + ReportsPanel (Submitted Reports)
```

## User Experience Improvements

### Before:
- Admin opens Monitoring from sidebar
- Sees all teams globally
- Must filter to find specific assignment
- No direct link between assignments and their monitoring
- Generic filtering interface

### After:
- Admin views assignments in Taken page
- Clicks "Monitor" button for specific assignment
- Instantly sees that assignment's team locations
- Views submitted reports with photos
- Clear context with task name and date
- Easy navigation back to assignments list
- More focused and relevant information

## Design Improvements

### Compact Header:
- Reduced padding (16px vs 24px)
- Smaller font sizes (18px title vs 24px)
- Inline stats with icons
- Back button for easy navigation

### Reports Panel:
- Wider panel (420px) for better content display
- Image grid layout for multiple photos
- Full-screen image viewer
- User avatars with gradient backgrounds
- Formatted timestamps in Indonesian locale
- Clean card design with hover effects

### Responsive Design:
- Mobile-friendly layout
- Stacked components on small screens
- Touch-friendly button sizes
- Optimized spacing for mobile

## Technical Details

### React Hooks Used:
- `useParams()` - Get route parameters
- `useNavigate()` - Programmatic navigation
- `useState()` - Component state management
- `useEffect()` - Data fetching on mount

### State Management:
- `assignment` - Assignment details
- `reports` - Array of reports
- `loading` - Initial data loading
- `reportsLoading` - Reports loading state
- `error` - Error message

### Performance Considerations:
- Separate loading states for different data
- Error boundary for API failures
- Efficient re-rendering with proper dependencies
- Lazy image loading in reports panel

## File Structure

```
frontend-web/src/
├── pages/
│   ├── Taken/
│   │   ├── Taken.jsx (added Monitor column)
│   │   └── Taken.css (added .monitor-btn styles)
│   └── Monitoring/
│       ├── Monitoring.jsx (redesigned)
│       ├── Monitoring.css (updated styles)
│       ├── ReportsPanel.jsx (NEW)
│       ├── ReportsPanel.css (NEW)
│       ├── MapView.jsx (existing, unchanged)
│       └── FilterPanel.jsx (still exists, not used)
├── services/
│   └── api.js (added report functions)
├── utils/
│   └── auth.js (removed MONITORING permission)
└── App.jsx (updated routing)
```

## Breaking Changes

⚠️ **Navigation Changes:**
- Direct `/monitoring` route no longer exists
- Must access via `/monitoring/:takenTaskId`
- Sidebar no longer shows Monitoring menu item

⚠️ **Permission Changes:**
- `MONITORING` permission removed from auth.js
- Uses `TAKEN` permission instead
- Only Superadmin and Admin can access (same as Taken page)

## Migration Notes

If you have existing bookmarks or direct links to `/monitoring`:
- They will no longer work
- Update to use assignment-specific routes: `/monitoring/{id}`
- Access monitoring through Taken page instead

## Future Enhancements

Potential improvements for future versions:
- Real-time location updates (WebSocket/polling)
- Export reports to PDF
- Filter reports within assignment
- Sort reports by date/user
- Search functionality in reports
- Print view for monitoring data
- Live tracking mode
- Geofencing alerts
- Report statistics/analytics

## Testing Checklist

- [ ] Navigate to Taken page
- [ ] Click Monitor button on an assignment
- [ ] Verify correct assignment details displayed
- [ ] Check if reports load correctly
- [ ] Verify images display and open in modal
- [ ] Test back button navigation
- [ ] Verify responsive design on mobile
- [ ] Check error handling for invalid assignment ID
- [ ] Test with assignments that have no reports
- [ ] Verify stats calculation (Team Members, Reported, Pending)
- [ ] Check map markers for team members
- [ ] Test collapse/expand of ReportsPanel

## Browser Compatibility

Tested and compatible with:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

No new dependencies added. Uses existing:
- React Router DOM (for routing)
- Axios (for API calls)
- Existing MapView component

---

**Last Updated:** January 2025
**Version:** 2.0.0
**Author:** Development Team
