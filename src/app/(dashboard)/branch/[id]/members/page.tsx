'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import useValidityUser from '@/hooks/useValidityUser';
import AddMemberModal from '@/components/branch/AddMemberModal';
import EditMemberModal from '@/components/branch/EditMemberModal';
import DeleteMemberModal from '@/components/branch/DeleteMemberModal';

import AddProjectsModal from '@/components/branch/AddProjectsModal';

import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

// Types
interface BranchMember {
  id: number;
  userName: string;
  PhoneNumber: string;
  Email: string;
  job: string;
  jobdiscrption: string;
  jobHOM?: string;
  image?: string;
  Date: string;
}

interface BranchMembersResponse {
  success?: string;
  data: BranchMember[];
  boss?: number;
  bosss?: number;
  idAdmin?: number;
  arrayfind?: any[];
  checkGloble?: { [key: number]: any };
}

export default function BranchMembersPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const branchId = parseInt(params.id as string);
  const branchName = searchParams.get('branchName') || 'الفرع';

  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation } = useValidityUser();

  const [members, setMembers] = useState<BranchMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [boss, setBoss] = useState<number>(0);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<BranchMember | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (branchId && user?.accessToken) {
      fetchBranchMembers();
    }
  }, [branchId, user?.accessToken]);

  const fetchBranchMembers = async (lastId = 0) => {
    try {
      setLoading(true);
      // مطابق للتطبيق المحمول - API صحيح مع type=justuser للفرع المحدد
      console.log('🔍 Fetching branch members for branch:', branchId);

      const response = await axiosInstance.get(
        `/user/BringUserCompanyinv2?IDCompany=${user?.data?.IDCompany}&idBrinsh=${branchId}&type=justuser&number=${lastId}&kind_request=all`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      console.log('📊 Branch members API response:', response.data);

      if (response.data?.data) {
        const result: BranchMembersResponse = response.data;
        const allMembers = result.data;

        // فلترة الأعضاء مطابق للتطبيق المحمول - عرض الأعضاء الذين لديهم صلاحية في هذا الفرع
        const filteredMembers = allMembers.filter(member =>
          result.checkGloble && Object.keys(result.checkGloble).includes(String(member.id))
        );

        console.log('👥 All members from API:', allMembers.length);
        console.log('🔍 CheckGloble keys:', result.checkGloble ? Object.keys(result.checkGloble) : 'undefined');
        console.log('✅ Filtered branch members:', filteredMembers.length, 'for branch:', branchId);

        if (lastId === 0) {
          setMembers(filteredMembers);
          // في API يرجع bosss أو idAdmin بدلاً من boss
          setBoss(result.boss || result.bosss || result.idAdmin || 0);
        } else {
          setMembers(prev => [...prev, ...filteredMembers]);
        }
        setHasMore(filteredMembers.length > 0);
      }
    } catch (error) {
      console.error('Error fetching branch members:', error);
      Tostget('خطأ في جلب أعضاء الفرع');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMembers = () => {
    if (hasMore && !loading && members.length > 0) {
      const lastMember = members[members.length - 1];
      fetchBranchMembers(lastMember.id);
    }
  };

  const handleMemberOptions = (member: BranchMember) => {
    setSelectedMember(member);
    setShowOptionsModal(true);
  };

  const handleAddMember = async () => {
    // التحقق من الصلاحيات - مطابق للتطبيق المحمول
    // فقط المدير أو مدير الفرع يمكنه إضافة أعضاء
    if (user?.data?.job === 'Admin' || user?.data?.job === 'مدير الفرع') {
      setShowAddMemberModal(true);
    } else {
      Tostget('ليس لديك صلاحية لإضافة عضو');
    }
  };

  const handleEditMember = async (member: BranchMember) => {
    // التحقق من الصلاحيات - مطابق للتطبيق المحمول
    // يمكن للمستخدم تعديل بياناته الخاصة أو للمدير تعديل أي عضو
    if (member.PhoneNumber === user?.data?.PhoneNumber || user?.data?.job === 'Admin' || user?.data?.job === 'مدير الفرع') {
      setSelectedMember(member);
      setShowEditMemberModal(true);
    } else {
      Tostget('ليس لديك صلاحية لتعديل هذا العضو');
    }
  };

  const handleDeleteMember = async (member: BranchMember) => {
    // التحقق من الصلاحيات - مطابق للتطبيق المحمول
    if (member.job === 'Admin') {
      Tostget('لا يمكن حذف المدير');
      return;
    }

    // فقط المدير أو مدير الفرع يمكنه حذف الأعضاء
    if (user?.data?.job === 'Admin' || user?.data?.job === 'مدير الفرع') {
      setSelectedMember(member);
      setShowDeleteModal(true);
    } else {
      Tostget('ليس لديك صلاحية لحذف الأعضاء');
    }
  };



  const handleAddProjects = async (member: BranchMember) => {
    // إضافة مشاريع للمستخدم - مطابق للتطبيق المحمول
    // مطابق للشرط: Number(idBransh) && !Number(type)
    if (user?.data?.job === 'Admin' && branchId) {
      setSelectedMember(member);
      setShowProjectsModal(true);
    } else {
      Tostget('ليس في نطاق صلاحياتك');
    }
  };

  const getJobDisplay = (member: BranchMember) => {
    // Apply mobile app ChackMangment logic exactly
    const job = member.job || '';
    const jobHOM = member.jobHOM || '';

    // If user is branch manager, show job
    if (job === 'مدير الفرع') {
      return job;
    }

    // Otherwise prefer jobHOM over job (like mobile app)
    return jobHOM || job || 'غير محدد';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getJobColor = (job: string) => {
    switch (job) {
      case 'مدير الفرع':
        return 'bg-blue-100 text-blue-800';
      case 'مدير عام':
        return 'bg-purple-100 text-purple-800';
      case 'مدير تنفيذي':
        return 'bg-green-100 text-green-800';
      case 'مالية':
        return 'bg-yellow-100 text-yellow-800';
      case 'موظف':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title="2739362721 2744413139"
          backButton={
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="312c4839"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          }
        />
      }
    >
      <ContentSection>


      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-ibm-arabic-medium text-gray-600">{branchName}</div>
          {(user?.data?.job === 'Admin' || user?.data?.job === 'مدير الفرع') && (
            <button
              onClick={handleAddMember}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="إضافة عضو للفرع"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </button>
          )}
        </div>
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-ibm-arabic-bold text-blue-600 mb-1">{members.length}</div>
            <div className="text-sm font-ibm-arabic-medium text-gray-600">إجمالي الأعضاء</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading && members.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : members.length > 0 ? (
          <>
            <div className="space-y-3">
              {members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onOptions={() => handleMemberOptions(member)}
                  getJobDisplay={getJobDisplay}
                  getJobColor={getJobColor}
                  formatDate={formatDate}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={loadMoreMembers}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-ibm-arabic-semibold transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري التحميل...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                      تحميل المزيد
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p className="text-gray-500 font-ibm-arabic-medium">لا يوجد أعضاء في الفرع</p>
          </div>
        )}
      </div>

      {/* Member Options Modal - مطابق لـ OpreationUser في التطبيق المحمول */}
      {showOptionsModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-6 text-center">
              خيارات العضو
            </h3>

            {/* Member Info */}
            <div className="mb-6 text-center">
              <p className="font-ibm-arabic-semibold text-gray-900">{selectedMember.userName}</p>
              <p className="text-sm text-gray-600">{getJobDisplay(selectedMember)}</p>
            </div>

            {/* Options List - مطابق للتطبيق المحمول */}
            <div className="space-y-3">
              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                  Debug: Admin={user?.data?.job === 'Admin' ? 'Yes' : 'No'}, BranchId={branchId}, Boss={boss}
                </div>
              )}
              {/* 1. تعديل بيانات المستخدم */}
              {(user?.data?.job === 'Admin' || selectedMember.PhoneNumber === user?.data?.PhoneNumber) && (
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    handleEditMember(selectedMember);
                  }}
                  className="w-full p-4 text-right bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors flex items-center justify-start gap-3"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span className="font-ibm-arabic-semibold text-gray-900">تعديل بيانات المستخدم</span>
                </button>
              )}

              {/* 2. حذف المستخدم */}
              {user?.data?.job === 'Admin' && selectedMember.job !== 'Admin' && (
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    handleDeleteMember(selectedMember);
                  }}
                  className="w-full p-4 text-right bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors flex items-center justify-start gap-3"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                  </svg>
                  <span className="font-ibm-arabic-semibold text-gray-900">حذف المستخدم</span>
                </button>
              )}

              {/* 3. إضافة عدة مشاريع - مطابق للتطبيق المحمول */}
              {user?.data?.job === 'Admin' && branchId && (
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    handleAddProjects(selectedMember);
                  }}
                  className="w-full p-4 text-right bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors flex items-center justify-start gap-3"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  <span className="font-ibm-arabic-semibold text-gray-900">إضافة عدة مشاريع</span>
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setShowOptionsModal(false);
                setSelectedMember(null);
              }}
              className="w-full mt-6 bg-gray-200 text-gray-800 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        branchId={branchId}
        onSuccess={() => {
          fetchBranchMembers();
          setShowAddMemberModal(false);
        }}
      />

      {/* Edit Member Modal */}
      <EditMemberModal
        isOpen={showEditMemberModal}
        onClose={() => {
          setShowEditMemberModal(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onSuccess={() => {
          fetchBranchMembers();
          setShowEditMemberModal(false);
          setSelectedMember(null);
        }}
      />

      {/* Delete Member Modal */}
      <DeleteMemberModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onSuccess={() => {
          fetchBranchMembers();
          setShowDeleteModal(false);
          setSelectedMember(null);
        }}
      />



      {/* Add Projects Modal */}
      <AddProjectsModal
        isOpen={showProjectsModal}
        onClose={() => {
          setShowProjectsModal(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        branchId={branchId}
        onSuccess={() => {
          fetchBranchMembers();
          setShowProjectsModal(false);
          setSelectedMember(null);
        }}
      />
    </ContentSection>
    </ResponsiveLayout>
  );
}

// Member Card Component
interface MemberCardProps {
  member: BranchMember;
  onOptions: () => void;
  getJobDisplay: (member: BranchMember) => string;
  getJobColor: (job: string) => string;
  formatDate: (date: string) => string;
}

function MemberCard({
  member,
  onOptions,
  getJobDisplay,
  getJobColor,
  formatDate
}: MemberCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {member.image ? (
                <img src={member.image} alt="User" className="w-full h-full object-cover" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-ibm-arabic-semibold text-gray-900 text-right">
                {member.userName}
              </h3>
              <div className="flex items-center justify-between mt-1">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-ibm-arabic-medium ${getJobColor(getJobDisplay(member))}`}>
                  {getJobDisplay(member)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(member.Date)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onOptions}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="خيارات العضو"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
