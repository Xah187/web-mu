// User Roles
export type UserRole = 'Admin' | 'مدير عام' | 'مدير الفرع' | 'مالية' | 'موظف';

// Job Descriptions
export type JobDescription = 'Admin' | 'مدير عام' | 'مدير تنفيذي' | 'موارد بشرية' | 'مدير الفرع' | 'مالية' | 'موظف';

// Permission Types (based on mobile app's Arraypromison)
export type PermissionType =
  | 'اقفال المرحلة'
  | 'اضافة مرحلة فرعية'
  | 'تعديل مرحلة فرعية'
  | 'حذف مرحلة فرعية'
  | 'إضافة مرحلة رئيسية'
  | 'تعديل مرحلة رئيسية'
  | 'حذف مرحلة رئيسية'
  | 'تشييك الانجازات الفرعية'
  | 'إضافة تأخيرات'
  | 'انشاء مجلد او تعديله'
  | 'انشاء عمليات مالية'
  | 'ترتيب المراحل'
  | 'إنشاء طلبات'
  | 'تشييك الطلبات'
  | 'إشعارات المالية'
  | 'تعديل صلاحيات'
  | 'اغلاق المشروع'
  | 'إغلاق وفتح المشروع'
  | 'حذف المشروع'
  | 'إنشاء المشروع'
  | 'تعديل بيانات المشروع'
  | 'تعديل بيانات الفرغ'
  | 'المشاريع المغلقة'
  | 'رفع ملف'
  | 'covenant'
  | 'Admin'; // Special permission type

// Boss Types
export type BossType = 'مدير الفرع' | '';

// Permission State Interface
export interface PermissionState {
  Validity: PermissionType[];
  boss: BossType;
}

// User Permission Check Result
export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
}

// Permission Context Interface
export interface PermissionContextType {
  checkPermission: (permission: PermissionType, userId?: string | number) => Promise<PermissionCheckResult>;
  hasPermission: (permission: PermissionType) => boolean;
  isAdmin: boolean;
  isBranchManager: boolean;
  isFinance: boolean;
  isEmployee: boolean;
  userRole: UserRole | null;
  validity: PermissionType[];
  boss: BossType;
}

// Available Permissions List (from mobile app)
export const AVAILABLE_PERMISSIONS: PermissionType[] = [
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
];

// Role Hierarchy (for permission inheritance)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'Admin': 5,
  'مدير عام': 4,
  'مدير الفرع': 3,
  'مالية': 2,
  'موظف': 1
};

// Default permissions for each role
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionType[]> = {
  'Admin': [...AVAILABLE_PERMISSIONS, 'Admin'],
  'مدير عام': [...AVAILABLE_PERMISSIONS],
  'مدير الفرع': [
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
    'رفع ملف'
  ],
  'مالية': [
    'انشاء عمليات مالية',
    'إشعارات المالية'
  ],
  'موظف': [
    'تعديل مرحلة فرعية',
    'رفع ملف'
  ]
};
