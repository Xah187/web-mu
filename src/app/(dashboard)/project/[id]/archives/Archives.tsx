'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import useArchivesFunction from '@/hooks/useArchivesFunction';
import useValidityUser from '@/hooks/useValidityUser';
import { Tostget } from '@/components/ui/Toast';

// مكونات مطابقة للتطبيق المحمول
import CreateFolderModal from '@/components/archives/CreateFolderModal';
import FilterModal from '@/components/archives/FilterModal';
import OperationFileModal from '@/components/archives/OperationFileModal';
import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';


interface ArchiveFolder {
  ArchivesID: number;
  FolderName: string;
  ActivationHome: string;
  Activationchildren: string;
  children: string | null;
  ProjectID: number;
}

export default function Archives() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const projectId = parseInt(params.id as string);
  const projectName = searchParams.get('projectName') || 'المشروع';

  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation } = useValidityUser();

  const {
    arrafolder,
    moudleBollen,
    setModulsBOOLEN,
    Input,
    setInput,
    refreshing,
    tilte,
    setTitle,
    CreatFoldernew,
    deleteOnpress,
    updateOnpress,
    BringDataHom,
    loading
  } = useArchivesFunction(projectId);

  // States للمودالات
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showOperationModal, setShowOperationModal] = useState(false);

  useEffect(() => {
    if (projectId && user?.accessToken) {
      BringDataHom();
    }
  }, [projectId, user?.accessToken, BringDataHom]);

  // فلترة المجلدات حسب العنوان - مطابق للتطبيق المحمول
  const filteredFolders = arrafolder.filter((folder: ArchiveFolder) =>
    tilte.length > 0 ? folder.FolderName.toLowerCase().includes(tilte.toLowerCase()) : true
  );

  const handleCreateFolder = async () => {
    const hasPermission = await Uservalidation('انشاء مجلد او تعديله', projectId);
    if (hasPermission) {
      setShowCreateModal(true);
    }
  };

  const handleFolderLongPress = (folder: ArchiveFolder) => {
    if (folder.ActivationHome === 'true') {
      setInput(folder.FolderName);
      setModulsBOOLEN({
        name: 'OpreationFileinArchive',
        verify: true,
        id: folder.ArchivesID,
        type: 'folder',
        nameOlde: folder.FolderName,
      });
      setShowOperationModal(true);
    } else {
      Tostget('الملفات الرئيسية لايمكن تعديلها او حذفها');
    }
  };

  const handleFolderClick = (folder: ArchiveFolder) => {
    // مطابق للتطبيق المحمول: idSub و idHome نفس القيمة للمجلد الرئيسي
    router.push(
      `/archives/${folder.ArchivesID}?idHome=${folder.ArchivesID}&idSub=${folder.ArchivesID}&activationChildren=${folder.Activationchildren}&projectId=${projectId}&projectName=${encodeURIComponent(projectName)}&folderName=${encodeURIComponent(folder.FolderName)}`
    );
  };

  const handleRefresh = () => {
    BringDataHom();
  };

  return (
    <ResponsiveLayout>

      <PageHeader
        title="الأرشيف"
        subtitle={projectName}
        backButton={
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="رجوع">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        }
        actions={
          <div className="flex items-center gap-2">
            {tilte.length > 0 && (
              <button
                onClick={() => setTitle('')}
                className="bg-white text-gray-700 px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors font-ibm-arabic-medium"
              >
                إلغاء فلتر
              </button>
            )}
            <button
              onClick={() => setShowFilterModal(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="فلترة"
              aria-label="فلترة"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
              </svg>
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="تحديث"
              aria-label="تحديث"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={refreshing ? 'animate-spin' : ''}
              >
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
            </button>
            <button
              onClick={handleCreateFolder}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-ibm-arabic-medium"
            >
              إنشاء
            </button>
          </div>
        }
      />
      <ContentSection>



      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">


        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Folders Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFolders.map((folder: ArchiveFolder) => (
              <div
                key={`${folder.ArchivesID}-${folder.FolderName}`}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border"
                onClick={() => handleFolderClick(folder)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleFolderLongPress(folder);
                }}
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-ibm-arabic-semibold text-gray-900 truncate">
                      {folder.FolderName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {folder.ActivationHome === 'true' ? 'قابل للتعديل' : 'ملف نظام'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredFolders.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-gray-500 font-ibm-arabic-medium mb-4">
              {tilte.length > 0 ? 'لا توجد مجلدات تطابق البحث' : 'لا توجد مجلدات في الأرشيف'}
            </p>
            {tilte.length === 0 && (
              <button
                onClick={handleCreateFolder}


                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-ibm-arabic-medium"
              >
                إنشاء مجلد جديد
              </button>
            )}
          </div>
        )}
      </div>
      </ContentSection>


      {/* Modals */}
      <CreateFolderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          BringDataHom();
        }}
        projectId={projectId}
      />

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title={tilte}
        setTitle={setTitle}
      />

      <OperationFileModal
        isOpen={showOperationModal}
        onClose={() => {
          setShowOperationModal(false);
          setModulsBOOLEN({});
        }}
        onDelete={deleteOnpress}
        onUpdate={updateOnpress}
        input={Input}
        setInput={setInput}
        type="folder"
      />
    </ResponsiveLayout>
  );
}
