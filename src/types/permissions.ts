// User Roles
export type UserRole = 'Admin' | 'مدير عام' | 'مدير الفرع' | 'مالية' | 'موظف';

// Job Descriptions
export type JobDescription =
  | 'Admin'
  | 'مدير عام'
  | 'مدير تنفيذي'
  | 'موارد بشرية'
  | 'مدير الفرع'
  | 'مالية'
  | 'موظف'
  | 'مهندس الموقع'
  | 'مهندس مشروع'
  | 'مشرف الموقع'
  | 'إستشاري موقع'
  | 'استشاري موقع'
  | 'مستشار جودة'
  | 'محاسب'
  | 'مدخل بيانات'
  | 'مسئول طلبيات'
  | 'موظف طلبيات ثقيلة'
  | 'موظف طلبيات خفيفة'
  | 'مالك';

// Permission Types (based on mobile app's Arraypromison and actual usage)
export type PermissionType =
  // Core permissions from mobile app Arraypromison
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
  // Additional permissions from mobile app usage
  | 'تعديل صلاحيات'
  | 'حذف المستخدم'
  | 'اضافة عضو'
  | 'اغلاق المشروع'
  | 'إغلاق وفتح المشروع'
  | 'حذف المشروع'
  | 'إنشاء المشروع'
  | 'تعديل بيانات المشروع'
  | 'تعديل بيانات الفرغ'
  | 'المشاريع المغلقة'
  | 'رفع ملف'
  | 'covenant'
  | 'التحضير'
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

// Extended role permissions for specialized jobs
export const SPECIALIZED_JOB_PERMISSIONS: Record<string, PermissionType[]> = {
  'مهندس الموقع': [
    'تشييك الانجازات الفرعية',
    'إضافة تأخيرات',
    'انشاء مجلد او تعديله'
  ],
  'مهندس مشروع': [
    'إضافة مرحلة رئيسية',
    'تعديل مرحلة رئيسية',
    'ترتيب المراحل',
    'تشييك الانجازات الفرعية'
  ],
  'مشرف الموقع': [
    'اضافة مرحلة فرعية',
    'تشييك الانجازات الفرعية',
    'إضافة تأخيرات'
  ],
  'إستشاري موقع': [
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
  ],
  'استشاري موقع': [
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
  ],
  'مستشار جودة': [
    'اقفال المرحلة',
    'تشييك الانجازات الفرعية'
  ],
  'محاسب': [
    'انشاء عمليات مالية',
    'إشعارات المالية',
    'covenant'
  ],
  'مدخل بيانات': [
    'انشاء مجلد او تعديله',
    'رفع ملف'
  ],
  'مسئول طلبيات': [
    'تشييك الطلبات',
    'إنشاء طلبات',
    'covenant'
  ],
  'موظف طلبيات ثقيلة': [
    'تشييك الطلبات',
    'إنشاء طلبات',
    'covenant'
  ],
  'موظف طلبيات خفيفة': [
    'تشييك الطلبات',
    'إنشاء طلبات',
    'covenant'
  ],
  'مالك': [
    'Admin',
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
  ]
};
