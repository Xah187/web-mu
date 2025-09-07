'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import axiosInstance from '@/lib/api/axios';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { Tostget } from '@/components/ui/Toast';

// This page represents the "دردشاتي" section from mobile app
// It shows all chat rooms the user is part of

interface ChatRoom {
  id: string;
  name: string;
  type: 'project' | 'company' | 'consultation' | 'decision';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  projectId?: string;
  projectName?: string;
}

export default function ChatsPage() {
  const router = useRouter();
  const { user, size } = useAppSelector(state => state.user);

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);

      // Base rooms matching mobile app structure
      const baseRooms: ChatRoom[] = [
        { id: 'consultations', name: 'استشارات', type: 'consultation', lastMessage: 'آخر رسالة في الاستشارات', lastMessageTime: '10:30 ص', unreadCount: 2 },
        { id: 'decisions', name: 'قرارات', type: 'decision', lastMessage: 'آخر قرار تم اتخاذه', lastMessageTime: '09:15 ص', unreadCount: 0 },
        { id: 'company_general', name: 'عام - الشركة', type: 'company', lastMessage: 'رسالة عامة للشركة', lastMessageTime: 'أمس', unreadCount: 5 }
      ];

      let allRooms: ChatRoom[] = [...baseRooms];

      // Try to fetch project and stages for chat, like mobile
      try {
        setError(null);
        const res = await axiosInstance.get('/chate/BringDataprojectAndStages');
        const data = res.data?.data || res.data?.result || [];
        if (Array.isArray(data)) {
          data.forEach((proj: any) => {
            const pid = String(proj.ProjectID || proj.id || proj.idProject);
            const pname = proj.Nameproject || proj.nameProject || '';
            const stages = proj.Stages || proj.stages || [];
            stages.forEach((st: any) => {
              allRooms.push({
                id: `${pid}:${st.StageID}`,
                name: `تواصل — ${st.StageName || st.name || ''}`,
                type: 'project',
                projectId: pid,
                projectName: pname,
                lastMessageTime: '',
              });
            });
          });
        }
      } catch (e: any) {
        setError(e?.message || 'تعذر تحميل الدردشات');
      }

      setChatRooms(allRooms);

    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      Tostget('خطأ في تحميل الدردشات');
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = (room: ChatRoom) => {
    // Navigate to chat based on type
    // This matches the mobile app navigation logic

    if (room.type === 'consultation') {
      router.push(`/chat?ProjectID=${user?.data?.CommercialRegistrationNumber}&typess=${encodeURIComponent('استشارات')}&nameRoom=${encodeURIComponent('استشارات')}&nameProject=`);
    } else if (room.type === 'decision') {
      router.push(`/chat?ProjectID=${user?.data?.CommercialRegistrationNumber}&typess=${encodeURIComponent('قرارات')}&nameRoom=${encodeURIComponent('قرارات')}&nameProject=`);
    } else if (room.type === 'project' && room.projectId) {
      router.push(`/chat?ProjectID=${room.projectId}&typess=${encodeURIComponent('project')}&nameRoom=${encodeURIComponent(room.name)}&nameProject=${encodeURIComponent(room.projectName || '')}`);
    } else {
      router.push(`/chat?ProjectID=${user?.data?.CommercialRegistrationNumber}&typess=${encodeURIComponent('company')}&nameRoom=${encodeURIComponent('عام - الشركة')}&nameProject=`);
    }
  };

  const getChatIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={colors.BLUE} strokeWidth="2" />
            <path d="M8 10h8" stroke={colors.BLUE} strokeWidth="1.5" />
            <path d="M8 14h6" stroke={colors.BLUE} strokeWidth="1.5" />
          </svg>
        );
      case 'decision':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 11H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-4" stroke="#8B5CF6" strokeWidth="2" />
            <polyline points="9,11 12,14 15,11" stroke="#8B5CF6" strokeWidth="2" />
            <line x1="12" y1="2" x2="12" y2="14" stroke="#8B5CF6" strokeWidth="2" />
          </svg>
        );
      case 'project':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" stroke="#10B981" strokeWidth="2" />
            <path d="M8 21v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" stroke="#10B981" strokeWidth="2" />
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={colors.BLUE} strokeWidth="2" />
          </svg>
        );
    }
  };

  const getChatTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return '#3B82F6';
      case 'decision': return '#8B5CF6';
      case 'project': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="bg-white shadow-sm border-b border-gray-200"
        style={{
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
        }}
      >
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </button>

          <h1
            className="text-lg font-bold text-gray-900"
            style={{
              fontFamily: fonts.IBMPlexSansArabicBold,
              fontSize: verticalScale(18 + size)
            }}
          >
            دردشاتي
          </h1>

          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-3">
                {error}
              </div>
            )}


      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد دردشات</h3>
            <p className="text-gray-600">لم تنضم إلى أي دردشة بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chatRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200"
                onClick={() => handleChatPress(room)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${getChatTypeColor(room.type)}15` }}
                    >
                      {getChatIcon(room.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className="font-semibold text-gray-900 truncate"
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicSemiBold,
                            fontSize: scale(15 + size)
                          }}
                        >
                          {room.name}
                        </h3>
                        {room.lastMessageTime && (
                          <span
                            className="text-xs text-gray-500 flex-shrink-0 ml-2"
                            style={{ fontSize: scale(10 + size) }}
                          >
                            {room.lastMessageTime}
                          </span>
                        )}
                      </div>

                      {room.lastMessage && (
                        <p
                          className="text-gray-600 text-sm truncate"
                          style={{
                            fontFamily: fonts.IBMPlexSansArabicRegular,
                            fontSize: scale(12 + size)
                          }}
                        >
                          {room.lastMessage}
                        </p>
                      )}

                      {room.projectName && (
                        <p
                          className="text-xs text-gray-500 mt-1"
                          style={{ fontSize: scale(10 + size) }}
                        >
                          المشروع: {room.projectName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {room.unreadCount && room.unreadCount > 0 && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: getChatTypeColor(room.type) }}
                      >
                        <span
                          className="text-white text-xs font-bold"
                          style={{ fontSize: scale(10 + size) }}
                        >
                          {room.unreadCount > 9 ? '9+' : room.unreadCount}
                        </span>
                      </div>
                    )}

                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <polyline points="9,18 15,12 9,6" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
