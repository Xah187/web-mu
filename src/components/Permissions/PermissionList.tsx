'use client';

import React, { useState } from 'react';
import { PermissionType, AVAILABLE_PERMISSIONS } from '@/types/permissions';
import useValidityUser from '@/hooks/useValidityUser';

interface PermissionListProps {
  selectedPermissions: PermissionType[];
  onPermissionChange: (permissions: PermissionType[]) => void;
  readonly?: boolean;
  title?: string;
}

/**
 * Permission List Component
 * Replicates the mobile app's AddValidity.tsx component
 */
export default function PermissionList({
  selectedPermissions = [],
  onPermissionChange,
  readonly = false,
  title = 'الصلاحيات'
}: PermissionListProps) {
  const { isAdmin } = useValidityUser();
  const [availablePermissions] = useState<PermissionType[]>(AVAILABLE_PERMISSIONS);

  /**
   * Handle permission toggle
   * Replicates mobile app's handlSwitch function
   */
  const handlePermissionToggle = (permission: PermissionType) => {
    if (readonly) return;

    const isSelected = selectedPermissions.includes(permission);
    let newPermissions: PermissionType[];

    if (isSelected) {
      // Remove permission
      newPermissions = selectedPermissions.filter(p => p !== permission);
    } else {
      // Add permission
      newPermissions = [...selectedPermissions, permission];
    }

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

      {/* Selected Permissions */}
      {selectedPermissions.length > 0 && (
        <div className="mb-6">
          <div className="p-4 bg-home border border-bordercolor rounded-xl">
            <p className="text-xs font-cairo text-border mb-3 text-right">
              الصلاحيات المحددة ({selectedPermissions.length})
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
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

      {/* Available Permissions */}
      {!readonly && (
        <div>
          <p className="text-xs font-cairo text-border mb-3 text-right">
            الصلاحيات المتاحة
          </p>
          <div className="flex flex-wrap gap-2 justify-end">
            {availablePermissions
              .filter(permission => !selectedPermissions.includes(permission))
              .map((permission, index) => (
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
