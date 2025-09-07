import { store } from '@/store';
import { setValidity, setBoss } from '@/store/slices/userSlice';
import { PermissionType } from '@/types/permissions';

/**
 * Fetch user permissions from the server
 * Replicates the mobile app's permission fetching logic
 */
export const fetchUserPermissions = async (_accessToken: string, userData: any) => {
  try {
    // In mobile app, Validity comes with user data during login, not from separate API
    // Check if user data already has Validity (like mobile app)
    if (userData?.Validity) {
      let validity = userData.Validity;

      // Parse Validity if it's a string (like mobile app)
      if (typeof validity === 'string') {
        try {
          validity = JSON.parse(validity);
        } catch (e) {
          console.error('Failed to parse stored Validity:', e);
          validity = [];
        }
      }

      // Update Redux state with stored permissions (like mobile app)
      store.dispatch(setValidity(validity || []));

      // Set boss status based on user role
      const bossStatus = userData.data?.job === 'مدير الفرع' ? 'مدير الفرع' : '';
      store.dispatch(setBoss(bossStatus as any));

      console.log('Stored permissions loaded successfully:', {
        permissions: validity,
        boss: bossStatus,
        userRole: userData.data?.job
      });

      return {
        success: true,
        permissions: validity,
        boss: bossStatus
      };
    }

    // Fallback to default permissions if API call fails or user not found
    const userRole = userData.data?.job;
    const defaultPermissions = getDefaultPermissions(userRole);
    const defaultBoss = userRole === 'مدير الفرع' ? 'مدير الفرع' : '';

    store.dispatch(setValidity(defaultPermissions));
    store.dispatch(setBoss(defaultBoss as any));

    console.log('Using default permissions (API failed or user not found):', {
      permissions: defaultPermissions,
      boss: defaultBoss,
      userRole: userRole
    });

    return {
      success: true,
      permissions: defaultPermissions,
      boss: defaultBoss
    };

    // TODO: Uncomment and modify this when you have a real backend API
    /*
    const response = await axiosInstance.get('/user/permissions', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        userId: userData.data?.id || userData.data?.PhoneNumber,
        companyId: userData.data?.CompanyID
      }
    });

    if (response.data.success) {
      const { permissions, boss } = response.data.data;

      // Update Redux state with permissions (like mobile app)
      store.dispatch(setValidity(permissions || []));
      store.dispatch(setBoss(boss || ''));

      return {
        success: true,
        permissions,
        boss
      };
    }
    */
  } catch (error) {
    console.error('Error setting permissions:', error);

    // Fallback: Set default permissions based on user role (like mobile app)
    const userRole = userData.data?.job;
    const defaultPermissions = getDefaultPermissions(userRole);

    store.dispatch(setValidity(defaultPermissions));
    store.dispatch(setBoss('' as any));

    return {
      success: false,
      error: 'Failed to set permissions, using defaults',
      permissions: defaultPermissions,
      boss: ''
    };
  }
};

/**
 * Get default permissions based on user role
 * Fallback when server permissions are not available
 */
const getDefaultPermissions = (userRole: string): PermissionType[] => {
  switch (userRole) {
    case 'Admin':
    case 'مالية': // مالية is treated as Admin in mobile app
      return [
        'اقفال المرحلة',
        'اضافة مرحلة فرعية',
        'تعديل مرحلة فرعية',
        'حذف مرحلة فرعية',
        'إضافة مرحلة رئيسية',
        'تعديل مرحلة رئيسية',
        'حذف مرحلة رئيسية',
        'تشييك الانجازات الفرعية',
        'إضافة تأخيرات',
        'انشاء مجلد او تعديله',
        'انشاء عمليات مالية',
        'ترتيب المراحل',
        'إنشاء طلبات',
        'تشييك الطلبات',
        'إشعارات المالية',
        'تعديل صلاحيات',
        'covenant',
        'Admin'
      ] as PermissionType[];
      
    case 'مدير الفرع':
      return [
        'اقفال المرحلة',
        'اضافة مرحلة فرعية',
        'تعديل مرحلة فرعية',
        'حذف مرحلة فرعية',
        'إضافة مرحلة رئيسية',
        'تعديل مرحلة رئيسية',
        'تشييك الانجازات الفرعية',
        'إضافة تأخيرات',
        'انشاء مجلد او تعديله',
        'ترتيب المراحل',
        'إنشاء طلبات',
        'تشييك الطلبات',
        'covenant'
      ] as PermissionType[];
      
    case 'موظف':
    default:
      return [
        'تعديل مرحلة فرعية',
        'covenant'
      ] as PermissionType[];
  }
};

/**
 * Update user token and refresh permissions
 * Replicates the mobile app's token update logic
 */
export const updateUserToken = async (tokenData: { tokenNew: string; tokenOld: string }, accessToken: string) => {
  try {
    // Use local API route for token update
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tokenData)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Return updated permissions (for now, return empty array)
        return data.data.permissions || [];
      }
    }

    console.error('Failed to update token');
    return [];
  } catch (error) {
    console.error('Error updating token:', error);
    return [];
  }
};
