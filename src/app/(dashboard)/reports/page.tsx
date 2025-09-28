'use client';

import React, { useState } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale as _scale, verticalScale } from '@/utils/responsiveSize';
import useReports, { Branch, Project } from '@/hooks/useReports';
import SelectionModal from '@/components/reports/SelectionModal';
import ProgressChart from '@/components/reports/ProgressChart';
import { FinancialBarChart } from '@/components/reports/BarChart';
import PDFPreview from '@/components/reports/PDFPreview';
import { Tostget } from '@/components/ui/Toast';
import Image from 'next/image';
import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';
import { useAppSelector } from '@/store';

export default function ReportsPage() {
  const userState = useAppSelector((state) => state.user);
  const _user = userState?.user; // Extract the actual user object

  const {
    branches,
    projects,
    selectedBranch,
    selectedProject,
    reportData,
    loading,
    branchesLoading,
    projectsLoading,
    selectBranch,
    selectProject,

    fetchBranches
  } = useReports();

  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);





  const handleBranchSelect = async (branch: Branch) => {
    await selectBranch(branch);
    Tostget(`تم اختيار الفرع: ${branch.NameSub}`);
  };

  const handleProjectSelect = async (project: Project) => {
    await selectProject(project);
    Tostget(`تم اختيار المشروع: ${project.Nameproject}`);
  };



  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    return num.toLocaleString('en-US');
  };

  const _calculateProgress = () => {
    if (!reportData?.countStageall || !reportData?.countSTageTrue) return 0;
    return ((reportData.countSTageTrue / reportData.countStageall) * 100);
  };

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title="التقارير"
          actions={
            reportData ? (
              <button
                onClick={() => setShowPDFPreview(true)}
                className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: colors.BLUE }}
              >
                تصدير PDF
              </button>
            ) : null
          }
        />
      }
    >
      <ContentSection>
        {/* Selection Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Branch Selection */}
            <div className="flex-1 flex gap-2">
              <button
                onClick={() => setShowBranchModal(true)}
                disabled={branchesLoading}
                className="flex-1 p-4 border-2 border-dashed rounded-xl text-center hover:bg-gray-50 transition-colors"
                style={{
                  borderColor: 'rgba(27, 78, 209, 0.2)',
                  backgroundColor: colors.WHITE
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    fontSize: verticalScale(16),
                    color: colors.BLACK
                  }}
                  dir="rtl"
                >
                  {branchesLoading ? 'جاري التحميل...' : (selectedBranch?.NameSub || 'اختر الفرع')}
                </span>
              </button>

              {/* Refresh Branches Button */}
              <button
                onClick={() => fetchBranches()}
                disabled={branchesLoading}
                className="px-4 py-2 rounded-xl border-2 hover:bg-gray-50 transition-colors"
                style={{
                  borderColor: 'rgba(27, 78, 209, 0.2)',
                  backgroundColor: colors.WHITE
                }}
                title="تحديث الفروع"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </button>
            </div>

            {/* Project Selection */}
            <div className="flex-1">
              {!selectedBranch ? (
                <div className="p-4 border-2 border-dashed rounded-xl text-center opacity-50"
                  style={{
                    borderColor: 'rgba(27, 78, 209, 0.2)',
                    backgroundColor: colors.WHITE
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      fontSize: verticalScale(16),
                      color: colors.BLACK
                    }}
                    dir="rtl"
                  >
                    اختر الفرع أولاً
                  </span>
                </div>
              ) : projectsLoading ? (
                <div className="p-4 border-2 border-dashed rounded-xl text-center"
                  style={{
                    borderColor: 'rgba(27, 78, 209, 0.2)',
                    backgroundColor: colors.WHITE
                  }}
                >
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2"></div>
                    <span
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        fontSize: verticalScale(16),
                        color: colors.BLACK
                      }}
                      dir="rtl"
                    >
                      جاري تحميل جميع المشاريع...
                    </span>
                  </div>
                </div>
              ) : projects.length > 0 ? (
                <div className="border-2 rounded-xl"
                  style={{
                    borderColor: 'rgba(27, 78, 209, 0.2)',
                    backgroundColor: colors.WHITE
                  }}
                >
                  <div className="p-3 border-b border-gray-200">
                    <span
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: verticalScale(14),
                        color: colors.BLUE
                      }}
                      dir="rtl"
                    >
                      المشاريع ({projects.length})
                    </span>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleProjectSelect(project)}
                        className={`w-full text-right px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          selectedProject?.id === project.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <span
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicRegular,
                            fontSize: verticalScale(14),
                            color: selectedProject?.id === project.id ? colors.BLUE : colors.BLACK
                          }}
                          dir="rtl"
                        >
                          {project.Nameproject}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed rounded-xl text-center"
                  style={{
                    borderColor: 'rgba(27, 78, 209, 0.2)',
                    backgroundColor: colors.WHITE
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      fontSize: verticalScale(16),
                      color: colors.BLACK
                    }}
                    dir="rtl"
                  >
                    لا توجد مشاريع متاحة
                  </span>
                </div>
              )}
            </div>
          </div>



          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center mt-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span
                className="mr-3 text-gray-600"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicRegular,
                  fontSize: verticalScale(14)
                }}
              >
                جاري تحميل التقرير...
              </span>
            </div>
          )}

        
        {!reportData ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-gray-400 mb-4">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <p 
              className="text-gray-500 text-center max-w-md"
              style={{
                fontFamily: fonts.IBMPlexSansArabicRegular,
                fontSize: verticalScale(16)
              }}
              dir="rtl"
            >
              اختر اسم المشروع لإظهار التقرير الخاص به
            </p>
            <div 
              className="w-32 h-px bg-gray-200 mt-4"
              style={{ backgroundColor: colors.BORDER }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Report Header with Logo */}
            <div
              className="bg-white rounded-2xl p-6 shadow-sm text-center"
              style={{ backgroundColor: colors.WHITE }}
            >
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-2xl p-5 shadow-md mb-4">
                  <Image
                    src="/logo-new.png"
                    alt="شعار مُشرِف"
                    width={160}
                    height={80}
                    className="h-20 w-auto"
                    priority
                    style={{ imageRendering: 'crisp-edges' as any }}
                  />
                </div>
                <h1
                  className="text-lg font-bold"
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    fontSize: verticalScale(18),
                    color: colors.BLUE
                  }}
                  dir="rtl"
                >
                  تقرير المشروع
                </h1>
              </div>
            </div>

            {/* Project Info */}
            <div
              className="bg-white rounded-2xl p-6 shadow-sm"
              style={{ backgroundColor: colors.WHITE }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <span 
                      className="text-gray-600 block"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: verticalScale(14)
                      }}
                    >
                      المشترك:
                    </span>
                    <span 
                      className="font-semibold"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: verticalScale(16),
                        color: colors.BLACK
                      }}
                    >
                      {reportData.NameCompany}
                    </span>
                  </div>
                  <div>
                    <span 
                      className="text-gray-600 block"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: verticalScale(14)
                      }}
                    >
                      اسم المشروع:
                    </span>
                    <span 
                      className="font-semibold"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: verticalScale(16),
                        color: colors.BLACK
                      }}
                    >
                      {reportData.Nameproject}
                    </span>
                  </div>
                  <div>
                    <span 
                      className="text-gray-600 block"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: verticalScale(14)
                      }}
                    >
                      النوع:
                    </span>
                    <span
                      className="font-semibold theme-text-primary"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: verticalScale(16)
                      }}
                    >
                      {reportData.TypeOFContract}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span 
                      className="text-gray-600 block"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: verticalScale(14)
                      }}
                    >
                      تاريخ البداية:
                    </span>
                    <span 
                      className="font-semibold"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: verticalScale(16),
                        color: colors.BLACK
                      }}
                    >
                      {formatDate(reportData.startDateProject)}
                    </span>
                  </div>
                  <div>
                    <span 
                      className="text-gray-600 block"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: verticalScale(14)
                      }}
                    >
                      تاريخ النهاية:
                    </span>
                    <span 
                      className="font-semibold"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: verticalScale(16),
                        color: colors.BLACK
                      }}
                    >
                      {formatDate(reportData.EndDateProject)}
                    </span>
                  </div>
                  <div>
                    <span 
                      className="text-gray-600 block"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: verticalScale(14)
                      }}
                    >
                      الزمن المتبقي:
                    </span>
                    <span 
                      className="font-semibold"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: verticalScale(16),
                        color: (reportData.Daysremaining || 0) < 0 ? colors.RED : colors.BLACK
                      }}
                    >
                      {reportData.Daysremaining} يوم
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Chart */}
              <div className="mt-6 flex justify-center">
                <ProgressChart
                  total={reportData.countStageall || 0}
                  completed={reportData.countSTageTrue || 0}
                  pending={reportData.StagesPending || 0}
                  size={280}
                  strokeWidth={24}
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div 
              className="bg-white rounded-2xl p-6 shadow-sm"
              style={{ backgroundColor: colors.WHITE }}
            >
              <h3 
                className="text-lg font-semibold mb-4"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  fontSize: verticalScale(18),
                  color: colors.BLACK
                }}
                dir="rtl"
              >
                الملخص المالي
              </h3>
              
              {/* Financial Bar Chart */}
              <div className="mb-6">
                <FinancialBarChart
                  revenue={reportData.TotalRevenue || 0}
                  expense={reportData.TotalExpense || 0}
                  returns={reportData.TotalReturns || 0}
                  height={200}
                  className="bg-gray-50 rounded-xl p-4"
                />
              </div>

              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div
                    className="text-2xl font-bold text-green-600"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicBold,
                      fontSize: verticalScale(20)
                    }}
                  >
                    {formatNumber(reportData.TotalRevenue)}
                  </div>
                  <div
                    className="text-sm text-green-700 mt-1"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      fontSize: verticalScale(12)
                    }}
                  >
                    العهد
                  </div>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div
                    className="text-2xl font-bold text-red-600"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicBold,
                      fontSize: verticalScale(20)
                    }}
                  >
                    {formatNumber(reportData.TotalExpense)}
                  </div>
                  <div
                    className="text-sm text-red-700 mt-1"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      fontSize: verticalScale(12)
                    }}
                  >
                    المصروفات
                  </div>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                  <div
                    className="text-2xl font-bold text-yellow-600"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicBold,
                      fontSize: verticalScale(20)
                    }}
                  >
                    {formatNumber(reportData.TotalReturns)}
                  </div>
                  <div
                    className="text-sm text-yellow-700 mt-1"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      fontSize: verticalScale(12)
                    }}
                  >
                    المرتجعات
                  </div>
                </div>
              </div>

              {/* Total Cost */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl flex justify-between items-center">
                <span 
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    fontSize: verticalScale(16),
                    color: colors.BLACK
                  }}
                  dir="rtl"
                >
                  إجمالي تكاليف المشروع
                </span>
                <span 
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    fontSize: verticalScale(20),
                    color: colors.BLUE
                  }}
                >
                  {formatNumber(reportData.TotalcosttothCompany)} ر.س
                </span>
              </div>
            </div>

            {/* Delays Table */}
            {reportData.DelayProject && reportData.DelayProject.length > 0 && (
              <div
                className="bg-white rounded-2xl p-6 shadow-sm"
                style={{ backgroundColor: colors.WHITE }}
              >
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicSemiBold,
                    fontSize: verticalScale(18),
                    color: colors.BLACK
                  }}
                  dir="rtl"
                >
                  تأخيرات المشروع
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th
                          className="border border-gray-200 p-3 text-center"
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicMedium,
                            fontSize: verticalScale(14),
                            color: colors.BLUE
                          }}
                        >
                          التاريخ
                        </th>
                        <th
                          className="border border-gray-200 p-3 text-center"
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicMedium,
                            fontSize: verticalScale(14),
                            color: colors.BLUE
                          }}
                        >
                          ملاحظة
                        </th>
                        <th
                          className="border border-gray-200 p-3 text-center"
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicMedium,
                            fontSize: verticalScale(14),
                            color: colors.BLUE
                          }}
                        >
                          المتسبب
                        </th>
                        <th
                          className="border border-gray-200 p-3 text-center"
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicMedium,
                            fontSize: verticalScale(14),
                            color: colors.BLUE
                          }}
                        >
                          عدد التأخيرات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.DelayProject.map((delay, index) => (
                        <tr key={index}>
                          <td
                            className="border border-gray-200 p-3 text-center"
                            style={{
                              fontFamily: fonts.IBMPlexSansArabicRegular,
                              fontSize: verticalScale(13),
                              color: colors.BLACK
                            }}
                          >
                            {formatDate(delay.DateNote)}
                          </td>
                          <td
                            className="border border-gray-200 p-3"
                            style={{
                              fontFamily: fonts.IBMPlexSansArabicRegular,
                              fontSize: verticalScale(13),
                              color: colors.BLACK
                            }}
                          >
                            {delay.Note}
                          </td>
                          <td
                            className="border border-gray-200 p-3 text-center"
                            style={{
                              fontFamily: fonts.IBMPlexSansArabicRegular,
                              fontSize: verticalScale(13),
                              color: colors.BLACK
                            }}
                          >
                            {delay.Type}
                          </td>
                          <td
                            className="border border-gray-200 p-3 text-center"
                            style={{
                              fontFamily: fonts.IBMPlexSansArabicRegular,
                              fontSize: verticalScale(13),
                              color: colors.RED
                            }}
                          >
                            {delay.countdayDelay}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Team Info */}
            {(reportData.boss || reportData.MostAccomplished?.length) && (
              <div 
                className="bg-white rounded-2xl p-6 shadow-sm"
                style={{ backgroundColor: colors.WHITE }}
              >
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicSemiBold,
                    fontSize: verticalScale(18),
                    color: colors.BLACK
                  }}
                  dir="rtl"
                >
                  فريق العمل
                </h3>
                
                {reportData.boss && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span 
                        style={{
                          fontFamily: fonts.IBMPlexSansArabicMedium,
                          fontSize: verticalScale(14),
                          color: colors.BLACK
                        }}
                      >
                        مدير الفرع:
                      </span>
                      <span 
                        style={{
                          fontFamily: fonts.IBMPlexSansArabicSemiBold,
                          fontSize: verticalScale(16),
                          color: colors.BLACK
                        }}
                      >
                        {reportData.boss}
                      </span>
                    </div>
                  </div>
                )}

                {reportData.MostAccomplished?.map((member, index) => (
                  <div key={index} className="mb-2 p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <span 
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicMedium,
                            fontSize: verticalScale(14),
                            color: colors.BLACK
                          }}
                        >
                          مهندس الموقع:
                        </span>
                        <span 
                          className="mr-2"
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicSemiBold,
                            fontSize: verticalScale(16),
                            color: colors.BLACK
                          }}
                        >
                          {member.userName}
                        </span>
                      </div>
                      <div className="text-left">
                        <div 
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicSemiBold,
                            fontSize: verticalScale(14),
                            color: colors.BLUE
                          }}
                        >
                          {member.Count} مهمة
                        </div>
                        <div 
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicRegular,
                            fontSize: verticalScale(12),
                            color: colors.BLACK
                          }}
                        >
                          {member.rate?.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ContentSection>

      {/* Selection Modals */}
      <SelectionModal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        title="اختر الفرع"
        items={branches}
        onSelect={handleBranchSelect}
        loading={branchesLoading}
      />



      {/* PDF Preview Modal */}
      {reportData && (
        <PDFPreview
          reportData={reportData}
          isOpen={showPDFPreview}
          onClose={() => setShowPDFPreview(false)}
        />
      )}
    </ResponsiveLayout>
  );
}