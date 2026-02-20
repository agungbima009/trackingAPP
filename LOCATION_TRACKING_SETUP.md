# Location Tracking Setup Guide

## Overview

The mobile app now includes **automatic hourly location tracking** for tasks. When an employee starts a task, the app automatically records their location every hour and sends it to the backend API.

## Features Implemented

### 1. **Automatic Hourly Tracking**
- ✅ Location is recorded immediately when task starts
- ✅ Location is recorded every 60 minutes (1 hour) automatically
- ✅ Tracking continues even when app is in background (with proper permissions)
- ✅ Tracking stops when task is completed

### 2. **Location Tracking Service**
**File:** `/mobile/services/locationTracking.ts`

The service provides:
- Location permission handling (foreground & background)
- Periodic location recording (every hour)
- Reverse geocoding (coordinates → address)
- Session management and recovery
- Manual location recording option

### 3. **Mobile App Integration**
**File:** `/mobile/app/task-detail.tsx`

Updates include:
- Automatic tracking start when task begins
- Visual feedback showing next tracking time
- Tracking status indicators
- Session persistence

## How It Works

### Workflow

```
1. Employee opens task detail page
   ↓
2. Employee swipes to start task
   ↓
3. App requests location permissions
   ↓
4. Initial location is recorded immediately
   ↓
5. App starts periodic tracking (every 1 hour)
   ↓
6. Location updates are sent to API automatically
   ↓
7. Display shows "Next update in X minutes"
   ↓
8. Tracking continues until task is completed
```

### Location Recording Intervals

| Event | Timing |
|-------|--------|
| Initial Location | Immediately when task starts |
| Periodic Updates | Every 60 minutes (1 hour) |
| Manual Record | On-demand via service API |

## API Integration

### Location Recording Endpoint

```
POST /api/locations
```

**Payload:**
```json
{
  "taken_task_id": "uuid-of-task-assignment",
  "latitude": -6.1234,
  "longitude": 106.5678,
  "accuracy": 15.5,
  "address": "123 Main Street, Jakarta",
  "tracking_status": "auto"
}
```

**Response:**
```json
{
  "message": "Location recorded successfully",
  "location": {
    "id": "location-uuid",
    "taken_task_id": "task-uuid",
    "latitude": -6.1234,
    "longitude": 106.5678,
    "accuracy": 15.5,
    "address": "123 Main Street, Jakarta",
    "recorded_at": "2026-02-20T10:30:00Z"
  }
}
```

## Configuration

### Tracking Interval

To change the tracking interval, edit `/mobile/services/locationTracking.ts`:

```typescript
// Current: 1 hour (60 minutes)
const TRACKING_INTERVAL = 60 * 60 * 1000; // milliseconds

// Examples:
// 30 minutes: 30 * 60 * 1000
// 2 hours: 2 * 60 * 60 * 1000
// 15 minutes: 15 * 60 * 1000
```

### Location Accuracy

```typescript
// Current setting: High accuracy
const LOCATION_ACCURACY = Location.Accuracy.High;

// Other options:
// - Location.Accuracy.Lowest
// - Location.Accuracy.Low
// - Location.Accuracy.Balanced
// - Location.Accuracy.High
// - Location.Accuracy.Highest
// - Location.Accuracy.BestForNavigation
```

## Permissions Required

### Android (app.json)

Add to `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION"
      ]
    }
  }
}
```

### iOS (app.json)

Add to `app.json`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "This app needs access to your location to track task progress.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "This app needs access to your location even when in background to track task progress.",
        "NSLocationAlwaysUsageDescription": "This app needs access to your location to track task progress."
      }
    }
  }
}
```

## Testing

### Test Location Tracking

1. **Start a Task:**
   ```bash
   # In mobile app:
   # 1. Login as employee
   # 2. Go to Tasks tab
   # 3. Select a pending task
   # 4. Swipe to start task
   ```

2. **Verify First Location:**
   - Alert should show: "Pelacakan Dimulai"
   - UI should show: "Pembaruan lokasi berikutnya: 60 menit lagi"

3. **Check API:**
   ```bash
   curl -X GET http://your-api-url/api/locations/my \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **Wait for Next Update:**
   - After 1 hour, location should be recorded automatically
   - Check backend logs or API to verify

### Manual Testing in Development

For faster testing during development, temporarily change interval:

```typescript
// In locationTracking.ts - FOR TESTING ONLY
const TRACKING_INTERVAL = 2 * 60 * 1000; // 2 minutes instead of 1 hour
```

**⚠️ Remember to change back to 1 hour before production!**

## Usage Examples

### Check if Tracking is Active

```typescript
import LocationTrackingService from '@/services/locationTracking';

if (LocationTrackingService.isActive()) {
  console.log('Location tracking is running');
}
```

### Get Current Session Info

```typescript
const session = LocationTrackingService.getSessionInfo();
if (session) {
  console.log('Tracking task:', session.takenTaskId);
  console.log('Started at:', new Date(session.startTime));
}
```

### Manually Record Location

```typescript
// Record location immediately (outside normal interval)
const success = await LocationTrackingService.recordNow(takenTaskId);
if (success) {
  console.log('Location recorded');
}
```

### Stop Tracking

```typescript
// Stop tracking (called automatically when task completes)
await LocationTrackingService.stopTracking();
```

## Troubleshooting

### Issue: Location Not Recording

**Possible Causes:**
1. Location permissions not granted
2. Device location services disabled
3. Poor GPS signal

**Solutions:**
```typescript
// Check permissions
const hasPermission = await LocationTrackingService.requestPermissions();
console.log('Has permission:', hasPermission);

// Check if device location is enabled
const enabled = await Location.hasServicesEnabledAsync();
console.log('Location services enabled:', enabled);
```

### Issue: Tracking Stops After App Close

**Solution:** Ensure background location permissions are granted:
- Android: Need `ACCESS_BACKGROUND_LOCATION`
- iOS: Need "Always" location permission

### Issue: Inaccurate Locations

**Solution:** Increase accuracy setting:
```typescript
const LOCATION_ACCURACY = Location.Accuracy.BestForNavigation;
```

### Issue: Battery Drain

**Solution:** Reduce accuracy or increase interval:
```typescript
const TRACKING_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours
const LOCATION_ACCURACY = Location.Accuracy.Balanced;
```

## Backend API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/locations` | POST | Record location |
| `/api/locations/my` | GET | Get employee's locations |
| `/api/locations/tasks/{id}` | GET | Get locations for specific task |
| `/api/locations/tasks/{id}/route` | GET | Get route/path for task |

## Best Practices

### 1. Battery Optimization
- Use `Location.Accuracy.Balanced` for normal tracking
- Only use `High` or `BestForNavigation` when needed
- Consider increasing interval to 2-3 hours for long tasks

### 2. Data Management
- Backend should clean up old location data periodically
- Consider batching location updates for offline scenarios

### 3. Privacy
- Always inform users about location tracking
- Allow users to see what locations are being recorded
- Provide clear opt-out options if required

### 4. Error Handling
- Handle permission denials gracefully
- Provide fallback for manual location entry
- Log errors for debugging

## Next Steps

### Recommended Enhancements

1. **Offline Queue:**
   - Store locations locally when offline
   - Sync when connection restored

2. **Geofencing:**
   - Alert when employee enters/leaves task location
   - Verify employee is at correct location

3. **Battery Monitoring:**
   - Adjust tracking frequency based on battery level
   - Notify user if tracking is consuming too much power

4. **Location Visualization:**
   - Show route on map in task detail page
   - Display live location of team members (admin view)

5. **Analytics:**
   - Track time spent at each location
   - Calculate distance traveled
   - Generate location-based reports

## Files Modified

```
mobile/
├── services/
│   ├── locationTracking.ts          [NEW] Location tracking service
│   └── api.ts                         [EXISTS] Used for API calls
├── app/
│   └── task-detail.tsx                [MODIFIED] Added tracking integration
└── package.json                       [MODIFIED] Added expo-location
```

## Dependencies Added

- `expo-location@~18.0.9` - Location services for React Native/Expo

## Resources

- [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)
- [API Documentation](./backend-laravel/API_DOCUMENTATION.md)
- [Task Workflow](./NEW_TASK_STATUS_WORKFLOW.md)

---

**Implementation Date:** February 20, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
