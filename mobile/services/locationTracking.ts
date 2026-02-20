import * as Location from 'expo-location';
import { locationsAPI } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const TRACKING_INTERVAL = 1 * 60 * 1000; // 1 minute in milliseconds (for testing)
const LOCATION_ACCURACY = Location.Accuracy.High;
const STORAGE_KEY = 'active_location_tracking';

interface TrackingSession {
    takenTaskId: string;
    intervalId: ReturnType<typeof setInterval> | null;
    isTracking: boolean;
    startTime: number;
}

// Store active tracking sessions
let trackingSession: TrackingSession | null = null;

/**
 * Request location permissions from the user
 */
export const requestLocationPermissions = async (): Promise<boolean> => {
    try {
        // Request foreground location permission
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

        if (foregroundStatus !== 'granted') {
            console.log('Foreground location permission denied');
            return false;
        }

        // Request background location permission (for continuous tracking)
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

        if (backgroundStatus !== 'granted') {
            console.log('Background location permission denied, continuing with foreground only');
            // We can still track in foreground
        }

        return true;
    } catch (error) {
        console.error('Error requesting location permissions:', error);
        return false;
    }
};

/**
 * Get current location coordinates
 */
const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
    try {
        const location = await Location.getCurrentPositionAsync({
            accuracy: LOCATION_ACCURACY,
        });
        return location;
    } catch (error) {
        console.error('Error getting current location:', error);
        return null;
    }
};

/**
 * Reverse geocode coordinates to get address
 */
const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
): Promise<string> => {
    try {
        const addresses = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
        });

        if (addresses && addresses.length > 0) {
            const address = addresses[0];
            const parts = [
                address.street,
                address.city,
                address.region,
                address.country,
            ].filter(Boolean);
            return parts.join(', ');
        }
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
};

/**
 * Record location to the API
 */
const recordLocationToAPI = async (takenTaskId: string): Promise<boolean> => {
    try {
        // Get current location
        const location = await getCurrentLocation();
        if (!location) {
            console.log('Failed to get current location');
            return false;
        }

        const { latitude, longitude } = location.coords;
        const accuracy = location.coords.accuracy || 0;

        // Get address from coordinates
        const address = await getAddressFromCoordinates(latitude, longitude);

        // Send to API
        await locationsAPI.recordLocation(
            takenTaskId,
            latitude,
            longitude,
            accuracy,
            address
        );

        console.log('✓ Location recorded:', {
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            address,
            timestamp: new Date().toISOString(),
        });

        return true;
    } catch (error: any) {
        // Check if it's a "not in progress" error (expected during startup)
        if (error.message?.includes('in progress')) {
            console.log('⏳ Task not ready for location recording yet, will retry later');
        } else {
            console.error('Error recording location to API:', error.message);
        }
        return false;
    }
};

/**
 * Start periodic location tracking (every hour)
 */
export const startLocationTracking = async (takenTaskId: string): Promise<boolean> => {
    try {
        // Check if already tracking
        if (trackingSession && trackingSession.isTracking) {
            console.log('Location tracking already active');
            return true;
        }

        // Request permissions
        const hasPermission = await requestLocationPermissions();
        if (!hasPermission) {
            throw new Error('Location permissions not granted');
        }

        // Try to record initial location, but don't fail if it doesn't work
        // (task might not be fully in progress yet on backend)
        console.log('📍 Attempting to record initial location...');
        try {
            const initialSuccess = await recordLocationToAPI(takenTaskId);
            if (initialSuccess) {
                console.log('✓ Initial location recorded successfully');
            } else {
                console.log('⏭️  Skipping initial location, will record at next interval');
            }
        } catch (error) {
            console.log('⏭️  Initial location skipped (task initializing), will record at next interval');
            // Continue anyway - the periodic tracking will try again
        }

        // Set up periodic tracking (every hour)
        const intervalId = setInterval(async () => {
            console.log('⏰ Hourly location update triggered');
            const success = await recordLocationToAPI(takenTaskId);
            if (success) {
                console.log('✓ Hourly location update completed');
            } else {
                console.log('⚠️  Hourly location update failed, will retry next hour');
            }
        }, TRACKING_INTERVAL);

        // Create tracking session
        trackingSession = {
            takenTaskId,
            intervalId,
            isTracking: true,
            startTime: Date.now(),
        };

        // Save tracking session to storage (for recovery after app restart)
        await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                takenTaskId,
                startTime: trackingSession.startTime,
            })
        );

        console.log('✓ Location tracking started successfully');
        console.log(`📍 Location will be recorded every ${TRACKING_INTERVAL / 1000 / 60} minutes`);

        return true;
    } catch (error) {
        console.error('Error starting location tracking:', error);
        return false;
    }
};

/**
 * Stop location tracking
 */
export const stopLocationTracking = async (): Promise<void> => {
    try {
        if (trackingSession && trackingSession.intervalId) {
            clearInterval(trackingSession.intervalId);
            trackingSession = null;

            // Clear storage
            await AsyncStorage.removeItem(STORAGE_KEY);

            console.log('Location tracking stopped');
        }
    } catch (error) {
        console.error('Error stopping location tracking:', error);
    }
};

/**
 * Check if location tracking is active
 */
export const isLocationTrackingActive = (): boolean => {
    return trackingSession !== null && trackingSession.isTracking;
};

/**
 * Get current tracking session info
 */
export const getTrackingSessionInfo = (): TrackingSession | null => {
    return trackingSession;
};

/**
 * Resume tracking from storage (useful after app restart)
 */
export const resumeLocationTracking = async (): Promise<boolean> => {
    try {
        const storedSession = await AsyncStorage.getItem(STORAGE_KEY);

        if (!storedSession) {
            console.log('No stored tracking session found');
            return false;
        }

        const { takenTaskId, startTime } = JSON.parse(storedSession);

        // Check if session is still valid (less than 24 hours old)
        const sessionAge = Date.now() - startTime;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge > maxAge) {
            console.log('Stored tracking session expired');
            await AsyncStorage.removeItem(STORAGE_KEY);
            return false;
        }

        // Resume tracking
        console.log('Resuming location tracking from storage');
        return await startLocationTracking(takenTaskId);
    } catch (error) {
        console.error('Error resuming location tracking:', error);
        return false;
    }
};

/**
 * Record location manually (on-demand)
 */
export const recordLocationNow = async (takenTaskId: string): Promise<boolean> => {
    return await recordLocationToAPI(takenTaskId);
};

/**
 * Get distance between two coordinates (in meters)
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

// Export all functions as a named object for easier imports
export const LocationTrackingService = {
    requestPermissions: requestLocationPermissions,
    startTracking: startLocationTracking,
    stopTracking: stopLocationTracking,
    isActive: isLocationTrackingActive,
    getSessionInfo: getTrackingSessionInfo,
    resumeTracking: resumeLocationTracking,
    recordNow: recordLocationNow,
    calculateDistance,
};

export default LocationTrackingService;
