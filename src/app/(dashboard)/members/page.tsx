'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { verticalScale, scale } from '@/utils/responsiveSize';
import ArrowIcon from '@/components/icons/ArrowIcon';
import ButtonCreat from '@/components/design/ButtonCreat';
import FilterIcon from '@/components/icons/FilterIcon';
import { Tostget } from '@/components/ui/Toast';
import useUserPermissions from '@/hooks/useUserPermissions';
import useValidityUser from '@/hooks/useValidityUser';
import PermissionGuard, { AdminGuard, PermissionBasedVisibility } from '@/components/auth/PermissionGuard';
import axiosInstance from '@/lib/api/axios';
import UserCard from '@/components/members/UserCard';
import AddMemberModal from '@/components/members/AddMemberModal';
import EditMemberModal from '@/components/members/EditMemberModal';
import DeleteMemberModal from '@/components/members/DeleteMemberModal';
import FilterModal from '@/components/members/FilterModal';

interface User {
  id: string;
  userName: string;
  IDNumber: string;
  PhoneNumber: string;
  job: string;
  jobdiscrption: string;
  Email?: string;
  image?: string;
  Validity?: string[];
}

export default function MembersPage() {
  const router = useRouter();
  const { user, size } = useAppSelector((state: any) => state.user);
  const { isAdmin, isBranchManager } = useUserPermissions();
  
  // New validity-based permission system
  const { 
    isAdmin: isValidityAdmin,
    Uservalidation,
    hasPermission: hasValidityPermission
  } = useValidityUser();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [hasMore, setHasMore] = useState(true);
  const [lastUserId, setLastUserId] = useState<string | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, users]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 1000 && // تحميل عند الوصول لـ 1000px من النهاية
        hasMore && 
        !loadingMore && 
        !loading && 
        filter === 'all'
      ) {
        loadMoreUsers();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loading, filter]);

  const fetchUsers = async (reset = true) => {
    if (!user?.data?.IDCompany) return;
    
    if (reset) {
      setLoading(true);
      setLastUserId(null);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const number = reset ? 0 : (lastUserId || 0);
      const response = await axiosInstance.get(
        `user/BringUserCompany?IDCompany=${user.data.IDCompany}&number=${number}&kind_request=${filter}`
      );
      
      if (response.data && response.data.success) {
        const newUsers = response.data.data || [];
        
        if (reset) {
          setUsers(newUsers);
        } else {
          // إضافة المستخدمين الجدد فقط (تجنب المكررات)
          setUsers(prev => {
            const existingIds = new Set(prev.map((u: User) => u.id));
            const uniqueNewUsers = newUsers.filter((u: User) => !existingIds.has(u.id));
            return [...prev, ...uniqueNewUsers];
          });
        }
        
        // تحديث معرف آخر مستخدم
        if (newUsers.length > 0) {
          setLastUserId(newUsers[newUsers.length - 1].id);
        }
        
        // التحقق من وجود المزيد من البيانات
        setHasMore(newUsers.length >= 20); // افتراض أن API يرجع 20 عنصر كحد أقصى
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Tostget('خطأ في جلب بيانات الأعضاء');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const loadMoreUsers = async () => {
    if (!hasMore || loadingMore) return;
    await fetchUsers(false);
  };

  const applyFilter = () => {
    if (filter === 'all') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(u => 
        u.job === filter || u.jobdiscrption === filter
      );
      setFilteredUsers(filtered);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers(true);
  };

  const handleAddMember = () => {
    if (!isAdmin && !isBranchManager) {
      Tostget('ليس لديك صلاحية لإضافة عضو');
      return;
    }
    setShowAddModal(true);
  };

  const handleEditMember = (selectedUser: User) => {
    if (!isAdmin && selectedUser.PhoneNumber !== user?.data?.PhoneNumber) {
      Tostget('ليس لديك صلاحية لتعديل هذا العضو');
      return;
    }
    setSelectedUser(selectedUser);
    setShowEditModal(true);
  };

  const handleDeleteMember = (user: User) => {
    if (!isAdmin) {
      Tostget('ليس لديك صلاحية لحذف الأعضاء');
      return;
    }
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleEditPermissions = (member: User) => {
    setSelectedUser(member);
    setShowPermissionsModal(true);
  };

  const handleMemberAdded = () => {
    setShowAddModal(false);
    fetchUsers();
    Tostget('تم إضافة العضو بنجاح');
  };

  const handleMemberUpdated = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    fetchUsers();
    Tostget('تم تحديث بيانات العضو بنجاح');
  };

  const handleMemberDeleted = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
    fetchUsers();
    Tostget('تم حذف العضو بنجاح');
  };

  return (
    <>
      {/* Modals */}
      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleMemberAdded}
        />
      )}
      
      {showEditModal && selectedUser && (
        <EditMemberModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={handleMemberUpdated}
        />
      )}
      
      {showDeleteModal && selectedUser && (
        <DeleteMemberModal
          user={selectedUser}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          onSuccess={handleMemberDeleted}
        />
      )}

      {showPermissionsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-bordercolor">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-cairo font-semibold text-darkslategray">
                  تعديل صلاحيات {selectedUser.userName}
                </h2>
                <button
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedUser(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="text-center py-8">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-blue" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <rect x="8" y="20" width="32" height="20" rx="4" ry="4" strokeWidth="2" />
                    <circle cx="24" cy="30" r="2" />
                    <path d="M16 20V14a8 8 0 0 1 16 0v6" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-lg font-cairo font-semibold text-darkslategray mb-2">
                  تعديل الصلاحيات
                </h3>
                <p className="text-gray-600 font-cairo mb-6">
                  هذه الميزة متاحة لتحديد الصلاحيات المخصصة لكل مستخدم.
                  <br />
                  في التطبيق الأصلي، يتم تحديد الصلاحيات بشكل منفصل بعد إضافة العضو.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 font-cairo text-sm">
                    <strong>معلومات العضو:</strong>
                    <br />
                    الاسم: {selectedUser.userName}
                    <br />
                    الوظيفة: {selectedUser.job}
                    <br />
                    صفة المستخدم: {selectedUser.jobdiscrption}
                    <br />
                    الصلاحيات الحالية: {selectedUser.Validity?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-bordercolor">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-cairo font-medium hover:bg-gray-200 transition-colors"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement permissions editing
                    Tostget('سيتم تطبيق هذه الميزة قريباً');
                    setShowPermissionsModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-3 px-4 bg-blue text-white rounded-lg font-cairo font-medium hover:bg-blue-600 transition-colors"
                >
                  حفظ الصلاحيات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showFilterModal && (
        <FilterModal
          currentFilter={filter}
          onApply={(newFilter) => {
            setFilter(newFilter);
            setShowFilterModal(false);
          }}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {/* Main Content */}
      <div className="min-h-screen bg-home">
        {/* Header */}
        <div className="bg-white rounded-b-3xl shadow-sm">
          <div className="pt-12 pb-6 px-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowIcon size={24} color={colors.BLACK} />
              </button>
              
              <h1 
                className="font-bold text-xl"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  fontSize: verticalScale(16 + size),
                  color: colors.BLACK
                }}
              >
                الأعضاء
              </h1>
              
              <div className="w-10" />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center px-4 py-4">
          {/* Add Member Button - Admin only like mobile app */}
          <AdminGuard>
            <ButtonCreat
              text="إضافة عضو"
              onpress={handleAddMember}
            />
          </AdminGuard>
          
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              style={{
                fontFamily: fonts.CAIROBOLD,
                fontSize: 14 + size,
                color: colors.BLACK
              }}
            >
              إلغاء الفلتر
            </button>
          )}
          
          <button
            onClick={() => setShowFilterModal(true)}
            className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <FilterIcon size={20} color={colors.BLUE} />
          </button>
        </div>

        {/* Members List */}
        <div className="px-4 pb-20">
          <div className="bg-white rounded-xl shadow-sm">
            {loading && users.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-blue border-t-transparent rounded-full"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg 
                    width="40" 
                    height="40" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-gray-500"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <p className="text-lg text-gray-600 mb-4">لا يوجد أعضاء</p>
                {/* Add First Member Button - Admin only like mobile app */}
                <AdminGuard>
                  <ButtonCreat
                    text="إضافة أول عضو"
                    onpress={handleAddMember}
                  />
                </AdminGuard>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {filteredUsers.map((member, index) => (
                    <UserCard
                      key={`${member.id}-${index}`}
                      user={member}
                      onEdit={() => handleEditMember(member)}
                      onDelete={() => handleDeleteMember(member)}
                      onEditPermissions={isAdmin ? () => handleEditPermissions(member) : undefined}
                      showActions={isAdmin || member.PhoneNumber === user?.data?.PhoneNumber}
                    />
                  ))}
                </div>
                
                {/* Loading More Indicator */}
                {loadingMore && (
                  <div className="p-6 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-blue border-t-transparent rounded-full animate-spin"></div>
                      <span 
                        className="text-gray-600"
                        style={{
                          fontFamily: fonts.CAIROBOLD,
                          fontSize: 14 + size
                        }}
                      >
                        جاري تحميل المزيد من الأعضاء...
                      </span>
                    </div>
                  </div>
                )}

                {/* Load More Button - shown only when not auto-loading */}
                {hasMore && filter === 'all' && !loadingMore && (
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={loadMoreUsers}
                      className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      style={{
                        fontFamily: fonts.CAIROBOLD,
                        fontSize: 14 + size,
                        color: colors.BLUE
                      }}
                    >
                      تحميل المزيد من الأعضاء
                    </button>
                  </div>
                )}

                {/* End of list indicator */}
                {!hasMore && users.length > 0 && filter === 'all' && (
                  <div className="p-4 border-t border-gray-100">
                    <div className="text-center">
                      <span 
                        className="text-gray-500"
                        style={{
                          fontFamily: fonts.CAIROBOLD,
                          fontSize: 12 + size
                        }}
                      >
                        تم عرض جميع الأعضاء ({users.length} عضو)
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        {!loading && (
          <button
            onClick={handleRefresh}
            className="fixed bottom-20 left-4 bg-blue text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            style={{ zIndex: 10 }}
          >
            {refreshing ? (
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            )}
          </button>
        )}
      </div>
    </>
  );
}
