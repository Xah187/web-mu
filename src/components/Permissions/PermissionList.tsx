'use client';

import React, { useState, useEffect } from 'react';
import { PermissionType, PROJECT_PERMISSIONS, BRANCH_PERMISSIONS } from '@/types/permissions';
import useValidityUser from '@/hooks/useValidityUser';

interface PermissionListProps {
  selectedPermissions: PermissionType[];
  onPermissionChange: (permissions: PermissionType[]) => void;
  readonly?: boolean;
  title?: string;
  type?: 'project' | 'branch'; // Matching mobile app's type parameter (1 = project, 0 = branch)
}

/**
 * Permission List Component
 * Replicates the mobile app's AddValidity.tsx component
 * Supports both project and branch permissions based on type
 */
export default function PermissionList({
  selectedPermissions = [],
  onPermissionChange,
  readonly = false,
  title = 'الصلاحيات',
  type = 'project' // Default to project permissions
}: PermissionListProps) {
  const { isAdmin } = useValidityUser();

  // Get permissions based on type - Matching mobile app AddValidity.tsx lines 26-58
  const getPermissionsByType = (): PermissionType[] => {
    return type === 'project' ? PROJECT_PERMISSIONS : BRANCH_PERMISSIONS;
  };

  const [availablePermissions, setAvailablePermissions] = useState<PermissionType[]>(
    getPermissionsByType().filter(p => !selectedPermissions.includes(p))
  );

  // Update available permissions when selected permissions change
  useEffect(() => {
    const allPermissions = getPermissionsByType();
    const available = allPermissions.filter(p => !selectedPermissions.includes(p));
    setAvailablePermissions(available);
  }, [selectedPermissions, type]);

  /**
   * Handle permission toggle
   * Replicates mobile app's handlSwitch function (AddValidity.tsx lines 84-100)
   */
  const handlePermissionToggle = (permission: PermissionType) => {
    if (readonly) return;

    const isSelected = selectedPermissions.includes(permission);
    let newPermissions: PermissionType[];
    let newAvailable: PermissionType[];

    if (isSelected) {
      // Remove permission from selected and add back to available
      newPermissions = selectedPermissions.filter(p => p !== permission);
      newAvailable = [...availablePermissions, permission];
    } else {
      // Add permission to selected and remove from available
      newPermissions = [...selectedPermissions, permission];
      newAvailable = availablePermissions.filter(p => p !== permission);
    }

    setAvailablePermissions(newAvailable);
    onPermissionChange(newPermissions);
  };

  /**
   * Permission Button Component
   * Replicates mobile app's Viewpermission component
   */
  const PermissionButton = ({ 
    permission, 
    isSelected 
  }: { 
    permission: PermissionType; 
    isSelected: boolean;
  }) => {
    return (
      <button
        type="button"
        onClick={() => handlePermissionToggle(permission)}
        disabled={readonly}
        className={`
          w-full sm:w-[45%] p-3 rounded-lg border-2 transition-all duration-200
          font-cairo text-sm font-semibold text-center
          ${isSelected 
            ? 'bg-white border-blue text-darkslategray shadow-md' 
            : 'bg-home border-bordercolor text-darkslategray hover:bg-white/50'
          }
          ${readonly ? 'cursor-default' : 'cursor-pointer hover:shadow-sm'}
          ${!readonly && 'active:scale-95'}
        `}
      >
        {/* Plus/Minus Icon */}
        <div className="flex items-center justify-center gap-2">
          {!readonly && (
            <svg 
              width="15" 
              height="16" 
              viewBox="0 0 15 16" 
              fill="none"
              className={`transition-transform duration-200 ${isSelected ? 'rotate-45' : ''}`}
            >
              <path
                d="M7.5 3V13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.5 8H12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <span>{permission}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="w-full">
      {/* Title */}
      <h3 className="text-sm font-medium font-cairo text-border mb-4 text-right">
        {title}
      </h3>

      {/* Type Indicator */}
      <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-600 font-cairo text-xs text-center">
          {type === 'project' ? 'صلاحيات المشروع' : 'صلاحيات الفرع'}
        </p>
      </div>

      {/* Selected Permissions - Matching mobile app AddValidity.tsx lines 174-200 */}
      {selectedPermissions.length > 0 && (
        <div className="mb-6">
          <div className="p-4 bg-home border border-bordercolor rounded-xl">
            <p className="text-xs font-cairo text-border mb-3 text-right">
              الصلاحيات المحددة ({selectedPermissions.length})
            </p>
            <div className="flex flex-wrap gap-2 justify-start">
              {selectedPermissions.map((permission, index) => (
                <PermissionButton
                  key={`selected-${index}`}
                  permission={permission}
                  isSelected={true}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Available Permissions - Matching mobile app AddValidity.tsx lines 202-211 */}
      {!readonly && availablePermissions.length > 0 && (
        <div>
          <p className="text-xs font-cairo text-border mb-3 text-right">
            الصلاحيات المتاحة ({availablePermissions.length})
          </p>
          <div className="flex flex-wrap gap-2 justify-start">
            {availablePermissions.map((permission, index) => (
              <PermissionButton
                key={`available-${index}`}
                permission={permission}
                isSelected={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedPermissions.length === 0 && readonly && (
        <div className="p-8 text-center">
          <p className="text-gray-500 font-cairo">
            لا توجد صلاحيات محددة
          </p>
        </div>
      )}

      {/* Admin Notice */}
      {isAdmin() && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-600 font-cairo text-sm text-center">
            كمدير، لديك صلاحية الوصول لجميع الميزات
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Permission Summary Component
 * Shows a compact view of user permissions
 */
export function PermissionSummary() {
  const { getUserPermissions, getUserRole, isAdmin, isBranchManager } = useValidityUser();
  const permissions = getUserPermissions();

  return (
    <div className="p-4 bg-home border border-bordercolor rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-cairo font-semibold text-darkslategray">
          صلاحياتك
        </h4>
        <span className={`
          px-3 py-1 rounded-full text-xs font-cairo font-medium
          ${isAdmin() 
            ? 'bg-red-100 text-red-700' 
            : isBranchManager() 
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }
        `}>
          {getUserRole()}
        </span>
      </div>

      {permissions.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {permissions.slice(0, 5).map((permission, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white border border-bordercolor rounded text-xs font-cairo text-darkslategray"
            >
              {permission}
            </span>
          ))}
          {permissions.length > 5 && (
            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-cairo text-gray-600">
              +{permissions.length - 5} أخرى
            </span>
          )}
        </div>
      ) : (
        <p className="text-gray-500 font-cairo text-sm">
          لا توجد صلاحيات محددة
        </p>
      )}
    </div>
  );
}
