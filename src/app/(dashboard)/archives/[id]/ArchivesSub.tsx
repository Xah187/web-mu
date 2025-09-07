'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import useArchivesFunction from '@/hooks/useArchivesFunction';
import useValidityUser from '@/hooks/useValidityUser';
import { Tostget } from '@/components/ui/Toast';

// مكونات مطابقة للتطبيق المحمول
import CreateFolderChildrenModal from '@/components/archives/CreateFolderChildrenModal';
import OperationFileModal from '@/components/archives/OperationFileModal';
import FileViewerModal from '@/components/archives/FileViewerModal';

interface ArchiveFile {
  id: number;
  name: string;
  type: string;
  size: number;
  Date?: string;
  namefile?: string;
  Data?: any;
  kindPage?: string;
}

export default function ArchivesSub() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const archiveId = parseInt(params.id as string);
  const idHome = parseInt(searchParams.get('idHome') || '0');
  const idSub = parseInt(searchParams.get('idSub') || archiveId.toString());
  const activationChildren = searchParams.get('activationChildren') || 'false';
  const projectId = parseInt(searchParams.get('projectId') || '0');
  const projectName = searchParams.get('projectName') || 'المشروع';
  const folderName = searchParams.get('folderName') || 'المجلد';
  
  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation } = useValidityUser();

  const {
    moudleBollen,
    setModulsBOOLEN,
    Input,
    setInput,
    Id,
    setId,
    ViewDelays,
    setViewDelays,
    children,
    viewImage,
    setViewImage,
    viewVedio,
    setViewVedio,
    BringData,
    handlerOpreation,
    deleteOnpressSub,
    updateOnpressSub,
    loading
  } = useArchivesFunction(projectId);

  // States للمودالات
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ArchiveFile | null>(null);

  useEffect(() => {
    if (archiveId && projectId) {
      setId(idSub);
      // مطابق للتطبيق المحمول: BringData(idHome, idSub)
      BringData(idHome, idSub);
    }
  }, [archiveId, idSub, idHome, projectId, setId, BringData]);

  // فلترة الملفات (استبعاد ملفات البيانات) - مطابق للتطبيق المحمول
  const filteredChildren = children.filter((item: ArchiveFile) => item.type !== 'Data');

  const handleCreateFile = async () => {
    if (activationChildren === 'true') {
      const hasPermission = await Uservalidation('انشاء مجلد او تعديله', projectId);
      if (hasPermission) {
        if (loading) {
          setViewDelays(true);
        } else {
          setShowCreateModal(true);
        }
      }
    } else {
      Tostget('هذا المجلد خاص بالنظام لايمكنك إضافة ملفات فيه');
    }
  };

  const handleFileLongPress = (file: ArchiveFile) => {
    if (activationChildren === 'true') {
      setInput(file.name);
      setModulsBOOLEN({
        name: 'OpreationFileinArchive',
        verify: true,
        id: file.id,
        type: file.type === 'folder' ? 'folder' : 'file',
        nameOlde: file.name,
      });
      setShowOperationModal(true);
    } else {
      Tostget('هذا الملف خاص بالنظام لايمكنك تعديل او حذف اي من هذه الملفات');
    }
  };

  const handleFileClick = (file: ArchiveFile) => {
    // منع تكرار الاستدعاء أثناء التحميل
    if (loading) return;

    if (file.type === 'folder') {
      // مطابق للتطبيق المحمول: لا ننتقل بالراوتر، نعيد الجلب بمستوى 'Sub'
      setId(file.id);
      BringData(idHome, file.id, 'Sub');
    } else {
      // فتح الملف
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setViewImage({ view: true, uri: file.name });
      } else if (file.type.startsWith('video/')) {
        setViewVedio({ view: true, uri: file.name });
      } else {
        setShowFileViewer(true);
      }
    }
  };

  const handleGoBack = () => {
    // مطابق للتطبيق: إذا كنا في الجذر (Id === idHome) نعود للخلف، وإلا نجلب مستوى أعلى
    if (parseInt(idHome.toString()) === parseInt(Id.toString())) {
      router.back();
    } else {
      // جلب قائمة الجذر دون تنقل
      setId(idHome);
      BringData(idHome, idHome, 'Home');
    }
  };

  const getFileIcon = (type: string) => {
    if (type === 'folder') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      );
    } else if (type.startsWith('image/')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
      );
    } else if (type.startsWith('video/')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      );
    } else if (type.includes('pdf')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - مطابق للتطبيق المحمول */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <h1 className="text-xl font-ibm-arabic-bold text-gray-900">الأرشيف</h1>
                <span className="text-gray-400">/</span>
                <span className="text-lg font-ibm-arabic-medium text-gray-700">{folderName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoBack}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors font-ibm-arabic-medium flex items-center space-x-2 rtl:space-x-reverse"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>رجوع</span>
            </button>

            <button
              onClick={handleCreateFile}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-ibm-arabic-medium"
            >
              إنشاء
            </button>
          </div>
        </div>
      </div>

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

        {/* Files Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChildren.map((item: ArchiveFile, index: number) => {
              // إنشاء مفتاح فريد يجمع بين عدة خصائص لتجنب التكرار
              const uniqueKey = `${item.type}-${item.id}-${item.name || item.namefile || 'unnamed'}-${item.size || 0}-${index}`;
              return (
                <div
                  key={uniqueKey}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border"
                onClick={() => handleFileClick(item)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleFileLongPress(item);
                }}
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
                    {getFileIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-ibm-arabic-semibold text-gray-900 truncate">
                      {item.namefile || item.name}
                    </h3>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                      <p className="text-xs text-gray-500">
                        {item.type === 'folder' ? 'مجلد' : item.type}
                      </p>
                      {item.size > 0 && (
                        <>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(item.size)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredChildren.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <p className="text-gray-500 font-ibm-arabic-medium mb-4">لا توجد ملفات في هذا المجلد</p>
            {activationChildren === 'true' && (
              <button
                onClick={handleCreateFile}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-ibm-arabic-medium"
              >
                إضافة ملف أو مجلد
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateFolderChildrenModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(idHome: number, kind: string, data: string | File) => {
          setShowCreateModal(false);
          handlerOpreation(idHome, kind, data);
        }}
        archiveId={idHome}
        currentId={idSub}
      />

      <OperationFileModal
        isOpen={showOperationModal}
        onClose={() => {
          setShowOperationModal(false);
          setModulsBOOLEN({});
        }}
        onDelete={() => deleteOnpressSub(idHome)}
        onUpdate={() => updateOnpressSub(idHome)}
        input={Input}
        setInput={setInput}
        type={moudleBollen?.type === 'folder' ? 'folder' : 'file'}
      />

      {/* File Viewers */}
      {viewImage.view && (
        <FileViewerModal
          isOpen={viewImage.view}
          onClose={() => setViewImage({ view: false, uri: '' })}
          fileUrl={viewImage.uri}
          fileType="image"
        />
      )}

      {viewVedio.view && (
        <FileViewerModal
          isOpen={viewVedio.view}
          onClose={() => setViewVedio({ view: false, uri: '' })}
          fileUrl={viewVedio.uri}
          fileType="video"
        />
      )}

      {showFileViewer && selectedFile && (
        <FileViewerModal
          isOpen={showFileViewer}
          onClose={() => {
            setShowFileViewer(false);
            setSelectedFile(null);
          }}
          fileUrl={selectedFile.name}
          fileType="document"
        />
      )}

      {/* Loading Overlay */}
      {ViewDelays && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-ibm-arabic-medium text-gray-700">جاري الرفع...</span>
          </div>
        </div>
      )}
    </div>
  );
}
