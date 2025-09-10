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

    // If no Validity in login response, fetch from API (like mobile app)
    try {
      const { default: axiosInstance } = await import('@/lib/api/axios');

      // Get user data with full Validity information
      const response = await axiosInstance.get(`/user/BringUserCompany`, {
        params: {
          IDCompany: userData.data?.IDCompany,
          number: 0,
          kind_request: 'all'
        },
        headers: {
          'Authorization': `Bearer ${_accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 && response.data?.data) {
        // Find current user in the response
        const currentUser = Array.isArray(response.data.data)
          ? response.data.data.find((u: any) => u?.PhoneNumber === userData.data?.PhoneNumber)
          : null;

        if (currentUser?.Validity) {
          let validity = currentUser.Validity;

          // Parse if string (like mobile app)
          if (typeof validity === 'string') {
            try {
              validity = JSON.parse(validity);
            } catch {
              validity = [];
            }
          }

          // Extract permissions from Validity structure
          let finalPermissions = [];
          if (Array.isArray(validity)) {
            // Find the branch entry for current company
            const branchEntry = validity.find(item =>
              parseInt(item.idBrinsh) === parseInt(userData.data?.IDCompany || 0)
            );

            if (branchEntry?.Validity && Array.isArray(branchEntry.Validity)) {
              finalPermissions = branchEntry.Validity;
            } else {
              // Fallback: collect all Validity arrays from all branches
              finalPermissions = validity
                .filter(item => item?.Validity && Array.isArray(item.Validity))
                .flatMap(item => item.Validity);
            }
          }

          // Update Redux state
          store.dispatch(setValidity(finalPermissions || []));

          // Set boss status
          const bossStatus = userData.data?.job === 'مدير الفرع' ? 'مدير الفرع' : '';
          store.dispatch(setBoss(bossStatus as any));

          console.log('✅ Permissions loaded from API:', {
            permissions: finalPermissions,
            boss: bossStatus,
            userRole: userData.data?.job
          });

          return {
            success: true,
            permissions: finalPermissions,
            boss: bossStatus
          };
        }
      }
    } catch (apiError) {
      console.error('❌ API call failed:', apiError);
    }

    // Fallback to default permissions if API call fails or user not found
    const userRole = userData.data?.job;
    const defaultPermissions = getDefaultPermissions(userRole);
    const defaultBoss = userRole === 'مدير الفرع' ? 'مدير الفرع' : '';

    store.dispatch(setValidity(defaultPermissions));
    store.dispatch(setBoss(defaultBoss as any));

    console.log('⚠️ Using default permissions (API failed or user not found):', {
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
        // Core permissions from mobile app Arraypromison
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
        // Additional admin permissions from mobile app usage
        'تعديل صلاحيات',
        'حذف المستخدم',
        'اضافة عضو',
        'اغلاق المشروع',
        'إغلاق وفتح المشروع',
        'حذف المشروع',
        'إنشاء المشروع',
        'تعديل بيانات المشروع',
        'المشاريع المغلقة',
        'رفع ملف',
        'covenant',
        'Admin'
      ] as PermissionType[];

    case 'مدير الفرع':
      return [
        // Core permissions from mobile app Arraypromison
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
        'ترتيب المراحل',
        'إنشاء طلبات',
        'تشييك الطلبات',
        // Branch manager specific permissions
        'تعديل صلاحيات',
        'حذف المستخدم',
        'اضافة عضو',
        'اغلاق المشروع',
        'إغلاق وفتح المشروع',
        'حذف المشروع',
        'إنشاء المشروع',
        'تعديل بيانات المشروع',
        'المشاريع المغلقة',
        'رفع ملف',
        'covenant'
      ] as PermissionType[];

    case 'إستشاري موقع':
    case 'استشاري موقع':
      return [
        // Site consultant permissions - based on mobile app usage
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
        'رفع ملف',
        'covenant'
      ] as PermissionType[];

    case 'موظف':
      return [
        // Employee permissions - limited access
        'تعديل مرحلة فرعية',
        'تشييك الانجازات الفرعية',
        'إضافة تأخيرات',
        'انشاء مجلد او تعديله',
        'رفع ملف',
        'covenant'
      ] as PermissionType[];

    default:
      return [
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
