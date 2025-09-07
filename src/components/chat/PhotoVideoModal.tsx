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
    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${active ? "bg-blue text-white border-blue" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <TabButton active={tab === "photo"} onClick={() => setTab("photo")}>Photo</TabButton>
            <TabButton active={tab === "video"} onClick={() => setTab("video")}>Video</TabButton>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
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

