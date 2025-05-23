import React, { useRef, useState } from 'react';

const VideoFrameGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';

    await new Promise<void>(resolve => {
      video.onloadedmetadata = () => resolve();
    });

    const duration = video.duration;
    const frameTimes = Array.from({ length: 9 }, (_, i) => (i / 8) * duration);

    const frameSize = 200;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = frameSize * 3;
    canvas.height = frameSize * 3;

    for (let i = 0; i < frameTimes.length; i++) {
      await new Promise<void>(resolve => {
        video.currentTime = frameTimes[i];
        video.onseeked = () => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          ctx.drawImage(video, col * frameSize, row * frameSize, frameSize, frameSize);
          resolve();
        };
      });
    }

    const dataUrl = canvas.toDataURL('image/jpeg');
    setImageSrc(dataUrl);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Upload a Video to Create a 3x3 Frame Grid</h2>
      <input type="file" accept="video/*" onChange={handleVideoUpload} className="mb-4" />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {imageSrc && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Generated Frame Grid:</h3>
          <img src={imageSrc} alt="Frame Grid" className="border rounded shadow" />
        </div>
      )}
    </div>
  );
};

export default VideoFrameGrid;
