"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";
import { ReactMediaRecorder } from "react-media-recorder";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void | Promise<void>;
  // e.g. { width: 640, height: 360 }
  resolution?: { width: number; height: number };
  videoMaxDurationSec?: number;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className="rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
    style={{
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: '600',
      backgroundColor: active
        ? 'var(--theme-primary)'
        : 'var(--theme-surface-secondary)',
      color: active
        ? '#ffffff'
        : 'var(--theme-text-primary)',
      border: active
        ? '2px solid var(--theme-primary)'
        : '1px solid var(--theme-border)',
      boxShadow: active
        ? '0 2px 8px rgba(99, 102, 241, 0.2)'
        : '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}
  >
    {children}
  </button>
);

export default function PhotoVideoModal({ isOpen, onClose, onCapture, resolution = { width: 640, height: 360 }, videoMaxDurationSec = 30 }: Props) {
  const [tab, setTab] = useState<"photo" | "video">("photo");
  const webcamRef = useRef<Webcam | null>(null);

  const videoConstraints = useMemo(() => ({
    width: resolution.width,
    height: resolution.height,
    facingMode: { ideal: "environment" },
  }), [resolution.width, resolution.height]);

  const handleCapturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    const res = await fetch(imageSrc);
    const blob = await res.blob();
    const file = new File([blob], `photo_${Date.now()}.jpg`, { type: blob.type || "image/jpeg" });
    await onCapture(file);
    onClose();
  }, [onCapture, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div
        className="w-full max-w-2xl shadow-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--theme-card-background)',
          border: '1px solid var(--theme-border)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-4"
          style={{
            borderBottom: '1px solid var(--theme-border)',
            background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.1))' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="var(--theme-primary)" strokeWidth="2"/>
                <circle cx="9" cy="9" r="2" stroke="var(--theme-primary)" strokeWidth="2"/>
                <path d="M21 15L16 10L5 21" stroke="var(--theme-primary)" strokeWidth="2"/>
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <TabButton active={tab === "photo"} onClick={() => setTab("photo")}>📷 صورة</TabButton>
              <TabButton active={tab === "video"} onClick={() => setTab("video")}>🎥 فيديو</TabButton>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
            style={{
              padding: '10px',
              backgroundColor: 'var(--theme-surface-secondary)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-text-secondary)'
            }}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {tab === "photo" ? (
          <div className="p-4">
            <div className="aspect-video w-full bg-black/90 rounded-xl overflow-hidden">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCapturePhoto} className="px-4 py-2 rounded-lg bg-blue text-white hover:bg-blue-600">Capture</button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <ReactMediaRecorder
              video
              audio
              blobPropertyBag={{ type: "video/webm" }}
              render={({ status, startRecording, stopRecording, mediaBlobUrl, previewStream }) => (
                <div>
                  <div className="aspect-video w-full bg-black/90 rounded-xl overflow-hidden">
                    {previewStream ? (
                      <video className="w-full h-full object-cover" ref={(node) => {
                        if (!node) return;
                        node.srcObject = previewStream as any;
                      }} autoPlay muted />
                    ) : mediaBlobUrl ? (
                      <video src={mediaBlobUrl} className="w-full h-full object-contain" controls />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/80">Ready</div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-gray-600">{status}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={onClose} className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Close</button>
                      <button onClick={() => { startRecording(); setTimeout(() => stopRecording(), (videoMaxDurationSec||30)*1000); }} className="px-3 py-2 rounded-lg bg-blue text-white hover:bg-blue-600">Record</button>
                      <button onClick={async () => {
                        stopRecording();
                        if (!mediaBlobUrl) return;
                        const blob = await (await fetch(mediaBlobUrl)).blob();
                        const file = new File([blob], `video_${Date.now()}.webm`, { type: blob.type || "video/webm" });
                        await onCapture(file);
                        onClose();
                      }} className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Save</button>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}

