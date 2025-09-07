import { differenceInDays } from 'date-fns';
import { store } from '@/store';
import { setUser, setValidity, setBoss, clearUser } from '@/store/slices/userSlice';
import { fetchUserPermissions } from '@/functions/permissions/fetchPermissions';
// import { getFCMToken } from '@/utils/fcm';

/**
 * Verify user token and refresh permissions
 * Replicates the mobile app's Verifyfromtoken function
 */
export const verifyFromToken = async (): Promise<boolean> => {
  try {
    // Get stored user data
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return false;
    }

    const userData = JSON.parse(storedUser);
    
    // Check if login is older than 4 days (like mobile app)
    if (userData.data?.DateOFlogin) {
      const daysDifference = differenceInDays(new Date(), new Date(userData.data.DateOFlogin));
      if (daysDifference > 4) {
        // Remove expired user data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return false;
      }
    }

    // Check if user still exists on server
    const userExists = await checkUserExists(userData.accessToken);
    if (!userExists) {
      // Remove invalid user data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return false;
    }

    // Restore user data to Redux (like mobile app)
    store.dispatch(setUser(userData));

    // Load stored permissions (like mobile app)
    try {
      await fetchUserPermissions(userData.accessToken, userData);
    } catch (error) {
      console.error('Failed to load stored permissions:', error);
      // Use stored permissions as fallback
      if (userData.Validity) {
        store.dispatch(setValidity(userData.Validity));
      }
    }

    return true;
    
  } catch (error) {
    console.error('Token verification error:', error);
    // Clean up on error
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return false;
  }
};

/**
 * Check if user still exists on server
 * Replicates the mobile app's checkWhethertheUserispresentornot function
 */
const checkUserExists = async (accessToken: string): Promise<boolean> => {
  try {
    // This should be an endpoint that verifies if the user/token is still valid
    // You might need to adjust this based on your backend implementation
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  } catch (error) {
    console.error('User existence check failed:', error);
    return false;
  }
};

/**
 * Initialize app authentication state
 * Call this when the app starts
 */
export const initializeAuth = async (): Promise<{ isAuthenticated: boolean; user?: any }> => {
  try {
    const isValid = await verifyFromToken();
    
    if (isValid) {
      const userData = localStorage.getItem('user');
      return {
        isAuthenticated: true,
        user: userData ? JSON.parse(userData) : null
      };
    } else {
      return {
        isAuthenticated: false
      };
    }
  } catch (error) {
    console.error('Auth initialization error:', error);
    return {
      isAuthenticated: false
    };
  }
};

/**
 * Logout user and clean up data
 */
export const logout = async (): Promise<void> => {
  try {
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Clear Redux state
    store.dispatch(clearUser());
    store.dispatch(setValidity([]));
    store.dispatch(setBoss('' as any));

    console.log('User logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
