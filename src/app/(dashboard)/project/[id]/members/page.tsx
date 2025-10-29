'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';
import useValidityUser from '@/hooks/useValidityUser';
import EditMemberModal from '@/components/members/EditMemberModal';
import DeleteMemberModal from '@/components/members/DeleteMemberModal';
import AddMultipleProjectsModal from '@/components/branch/AddMultipleProjectsModal';
import ProjectPermissionsModal from '@/components/project/ProjectPermissionsModal';

// مطابق للتطبيق المحمول PageUsers.tsx
interface ProjectMember {
  id: number;
  userName: string;
  PhoneNumber: string;
  job: string;
  jobHOM?: string;
  Email?: string;
  image?: string;
  Date: string;
  is_in_ProjectID?: string; // "true" or "false"
  ValidityProject?: string[]; // صلاحيات المستخدم في المشروع
}

export default function ProjectMembersPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const projectName = searchParams.get('name') || 'المشروع';
  const branchId = searchParams.get('branchId') || '';

  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation } = useValidityUser();

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showMultipleProjectsModal, setShowMultipleProjectsModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // حالة التغييرات - مطابق للتطبيق المحمول
  const [checkGloblenew, setCheckGloblenew] = useState<Record<number, { id: number; Validity: string[] }>>({});
  const [checkGlobledelete, setCheckGlobledelete] = useState<Record<number, number>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProjectMembers();
  }, [projectId]);

  // جلب أعضاء المشروع - مطابق للتطبيق المحمول PageUsers.tsx
  const fetchProjectMembers = async (lastId = 0) => {
    try {
      setLoading(true);

      // مطابق للتطبيق المحمول: استخدام BringUserCompanyinv2 بدلاً من BringUserCompanyBrinsh
      // type = رقم المشروع، selectuser = "project"
      const response = await axiosInstance.get(
        `/user/BringUserCompanyinv2?IDCompany=${user?.data?.IDCompany}&idBrinsh=${branchId}&type=${projectId}&number=${lastId}&kind_request=${filter}&selectuser=project`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      if (response.data?.data) {
        const newMembers = response.data.data;

        if (lastId === 0) {
          setMembers(newMembers);
        } else {
          setMembers(prev => [...prev, ...newMembers]);
        }

        setHasMore(newMembers.length >= 10);
      }
    } catch (error) {
      console.error('Error fetching project members:', error);
      Tostget('خطأ في جلب أعضاء المشروع');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMembers = () => {
    if (hasMore && !loading && members.length > 0) {
      const lastMember = members[members.length - 1];
      fetchProjectMembers(lastMember.id);
    }
  };

  // إضافة/إزالة عضو من المشروع - مطابق للتطبيق المحمول PageUsers.tsx handleGlobalChoice
  const handleToggleMember = (memberId: number, isInProjectValue: string) => {
    const updatedMembers = members.map(m =>
      m.id === memberId ? { ...m, is_in_ProjectID: isInProjectValue } : m
    );
    setMembers(updatedMembers);

    const member = members.find(m => m.id === memberId);
    if (!member) return;

    if (isInProjectValue === 'true') {
      // إضافة للمشروع
      setCheckGloblenew(prev => ({
        ...prev,
        [memberId]: { id: memberId, Validity: member.ValidityProject || [] }
      }));
      // إزالة من قائمة الحذف إذا كان موجوداً
      setCheckGlobledelete(prev => {
        const newState = { ...prev };
        delete newState[memberId];
        return newState;
      });
    } else {
      // إزالة من المشروع
      setCheckGlobledelete(prev => ({ ...prev, [memberId]: memberId }));
      // إزالة من قائمة الإضافة إذا كان موجوداً
      setCheckGloblenew(prev => {
        const newState = { ...prev };
        delete newState[memberId];
        return newState;
      });
    }
  };

  // حفظ التغييرات - مطابق للتطبيق المحمول
  const handleSaveChanges = async () => {
    try {
      setActionLoading({ save: true });

      // إضافة الأعضاء الجدد
      if (Object.keys(checkGloblenew).length > 0) {
        const response = await axiosInstance.put(
          '/user/updat/userBrinshv2',
          {
            IDCompanySub: branchId,
            type: projectId,
            checkGloble: checkGloblenew
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user?.accessToken}`
            }
          }
        );

        if (response.data?.success) {
          Tostget('تم إضافة الأعضاء بنجاح');
        }
      }

      // حذف الأعضاء
      if (Object.keys(checkGlobledelete).length > 0) {
        const response = await axiosInstance.put(
          '/user/updat/userBrinshv2',
          {
            IDCompanySub: branchId,
            type: projectId,
            checkGloble: {},
            checkGlobledelete: checkGlobledelete
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user?.accessToken}`
            }
          }
        );

        if (response.data?.success) {
          Tostget('تم إزالة الأعضاء بنجاح');
        }
      }

      // إعادة تحميل البيانات
      setCheckGloblenew({});
      setCheckGlobledelete({});
      await fetchProjectMembers(0);

    } catch (error) {
      console.error('Error saving changes:', error);
      Tostget('خطأ في حفظ التغييرات');
    } finally {
      setActionLoading({ save: false });
    }
  };

  // إلغاء التغييرات
  const handleCancelChanges = () => {
    setCheckGloblenew({});
    setCheckGlobledelete({});
    fetchProjectMembers(0);
  };

  const handleMemberOptions = (member: ProjectMember) => {
    setSelectedMember(member);
    setShowOptionsModal(true);
  };

  const handleEditMember = async (member: ProjectMember) => {
    if (member.PhoneNumber === user?.data?.PhoneNumber || user?.data?.job === 'Admin') {
      setSelectedMember(member);
      setShowEditModal(true);
    } else {
      Tostget('ليس لديك صلاحية لتعديل هذا العضو');
    }
  };

  const handleDeleteMember = async (member: ProjectMember) => {
    if (member.job === 'Admin') {
      Tostget('لا يمكن حذف المدير');
      return;
    }

    if (user?.data?.job === 'Admin') {
      setSelectedMember(member);
      setShowDeleteModal(true);
    } else {
      Tostget('ليس لديك صلاحية لحذف الأعضاء');
    }
  };

  const handleEditPermissions = async (member: ProjectMember) => {
    const hasPermission = await Uservalidation('تعديل صلاحيات', parseInt(projectId));
    if (hasPermission) {
      setSelectedMember(member);
      setShowPermissionsModal(true);
    } else {
      Tostget('ليس لديك صلاحية لتعديل الصلاحيات');
    }
  };

  const handleAddMultipleProjects = async (member: ProjectMember) => {
    if (user?.data?.job === 'Admin' && branchId) {
      setSelectedMember(member);
      setShowMultipleProjectsModal(true);
    } else {
      Tostget('ليس في نطاق صلاحياتك');
    }
  };

  const getJobDisplay = (member: ProjectMember) => {
    const job = member.job || '';
    const jobHOM = member.jobHOM || '';

    if (job === 'مدير الفرع') {
      return job;
    }

    return jobHOM || job || 'غير محدد';
  };

  const getJobColor = (job: string) => {
    switch (job) {
      case 'Admin':
      case 'مدير عام':
        return 'bg-blue-100 text-blue-800';
      case 'مالية':
        return 'bg-green-100 text-green-800';
      case 'مدير الفرع':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  };

  const hasChanges = Object.keys(checkGloblenew).length > 0 || Object.keys(checkGlobledelete).length > 0;

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title={`أعضاء ${projectName}`}
          subtitle="إدارة أعضاء المشروع"
          backButton={
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          }
        />
      }
    >
      <ContentSection>
        {/* Filter and Actions Bar */}
        <div className="flex items-center justify-between mb-4 px-4">
          <button
            onClick={() => setShowFilterModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
          </button>

          {hasChanges && (
            <div className="flex gap-2">
              <button
                onClick={handleCancelChanges}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-ibm-arabic-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={actionLoading.save}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-ibm-arabic-semibold disabled:opacity-50"
              >
                {actionLoading.save ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          )}
        </div>

        {/* Members List */}
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
                    onToggle={(value) => handleToggleMember(member.id, value)}
                    getJobDisplay={getJobDisplay}
                    getJobColor={getJobColor}
                    formatDate={formatDate}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={loadMoreMembers}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-ibm-arabic-semibold"
                  >
                    {loading ? 'جاري التحميل...' : 'تحميل المزيد'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-lg text-gray-600 mb-4">لا يوجد أعضاء</p>
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

              <div className="space-y-3">
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

                {/* 2. تعديل صلاحية المستخدم في المشروع */}
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    handleEditPermissions(selectedMember);
                  }}
                  className="w-full p-4 text-right bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors flex items-center justify-start gap-3"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                  <span className="font-ibm-arabic-semibold text-gray-900">تعديل صلاحية المستخدم</span>
                </button>

                {/* 3. حذف المستخدم */}
                {selectedMember.job !== 'Admin' && user?.data?.job === 'Admin' && (
                  <button
                    onClick={() => {
                      setShowOptionsModal(false);
                      handleDeleteMember(selectedMember);
                    }}
                    className="w-full p-4 text-right bg-red-50 hover:bg-red-100 rounded-2xl transition-colors flex items-center justify-start gap-3"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span className="font-ibm-arabic-semibold text-red-600">حذف المستخدم</span>
                  </button>
                )}

                {/* 4. إضافة عدة مشاريع - يظهر فقط إذا كان في فرع */}
                {branchId && user?.data?.job === 'Admin' && (
                  <button
                    onClick={() => {
                      setShowOptionsModal(false);
                      handleAddMultipleProjects(selectedMember);
                    }}
                    className="w-full p-4 text-right bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors flex items-center justify-start gap-3"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                      <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                    <span className="font-ibm-arabic-semibold text-gray-900">إضافة عدة مشاريع</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowOptionsModal(false)}
                className="w-full mt-4 p-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-ibm-arabic-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-6 text-center">
                فلترة الأعضاء
              </h3>

              <div className="space-y-2">
                {['all', 'Admin', 'مدير الفرع', 'مالية', 'موظف'].map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => {
                      setFilter(filterOption);
                      setShowFilterModal(false);
                      fetchProjectMembers(0);
                    }}
                    className={`w-full p-3 text-right rounded-xl transition-colors font-ibm-arabic-semibold ${
                      filter === filterOption
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {filterOption === 'all' ? 'الكل' : filterOption}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowFilterModal(false)}
                className="w-full mt-4 p-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-ibm-arabic-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}

        {/* Edit Member Modal */}
        {showEditModal && selectedMember && (
          <EditMemberModal
            user={selectedMember as any}
            onClose={() => {
              setShowEditModal(false);
              setSelectedMember(null);
            }}
            onSuccess={() => {
              fetchProjectMembers(0);
              setShowEditModal(false);
              setSelectedMember(null);
            }}
          />
        )}

        {/* Delete Member Modal */}
        {showDeleteModal && selectedMember && (
          <DeleteMemberModal
            user={selectedMember as any}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedMember(null);
            }}
            onSuccess={() => {
              fetchProjectMembers(0);
              setShowDeleteModal(false);
              setSelectedMember(null);
            }}
          />
        )}

        {/* Permissions Modal */}
        {showPermissionsModal && selectedMember && (
          <ProjectPermissionsModal
            isOpen={showPermissionsModal}
            onClose={() => {
              setShowPermissionsModal(false);
              setSelectedMember(null);
            }}
            member={selectedMember}
            projectId={parseInt(projectId)}
            onSuccess={() => {
              fetchProjectMembers(0);
              setShowPermissionsModal(false);
              setSelectedMember(null);
            }}
          />
        )}

        {/* Add Multiple Projects Modal */}
        {showMultipleProjectsModal && selectedMember && branchId && (
          <AddMultipleProjectsModal
            isOpen={showMultipleProjectsModal}
            onClose={() => {
              setShowMultipleProjectsModal(false);
              setSelectedMember(null);
            }}
            branchId={parseInt(branchId)}
            memberPhoneNumber={selectedMember.PhoneNumber}
            memberName={selectedMember.userName}
            onSuccess={() => {
              fetchProjectMembers(0);
              setShowMultipleProjectsModal(false);
              setSelectedMember(null);
            }}
          />
        )}
      </ContentSection>
    </ResponsiveLayout>
  );
}

// Member Card Component - مطابق للتطبيق المحمول UserComponent.tsx
interface MemberCardProps {
  member: ProjectMember;
  onOptions: () => void;
  onToggle: (value: string) => void;
  getJobDisplay: (member: ProjectMember) => string;
  getJobColor: (job: string) => string;
  formatDate: (date: string) => string;
}

function MemberCard({ member, onOptions, onToggle, getJobDisplay, getJobColor, formatDate }: MemberCardProps) {
  const isInProject = member.is_in_ProjectID === 'true';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(isInProject ? 'false' : 'true')}
            className="flex-shrink-0"
          >
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
              isInProject ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
            }`}>
              {isInProject && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </button>

          {/* User Avatar */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {member.image ? (
              <img
                src={member.image}
                alt={member.userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-lg">
                {member.userName.charAt(0)}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-ibm-arabic-semibold text-gray-900 text-right truncate">
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

          {/* Options Button */}
          <button
            onClick={onOptions}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

