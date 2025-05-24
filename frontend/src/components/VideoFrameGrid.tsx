import React, { useRef, useState } from 'react';

interface VideoFrameGridProps {
  onImageReady: (imageDataUrl: string) => void;
  onClose: () => void;
}

const VideoFrameGrid: React.FC<VideoFrameGridProps> = ({ onImageReady, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]); // Use ref instead of state for chunks
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoStarted, setAutoStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const processVideo = async () => {
    setProcessing(true);
    console.log('Starting video processing, chunks:', chunksRef.current.length);
    
    try {
      if (chunksRef.current.length === 0) {
        setError('No video data recorded. Please try again.');
        setProcessing(false);
        return;
      }

      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      console.log('Blob created, size:', blob.size, 'type:', blob.type);
      
      if (blob.size === 0) {
        setError('No video data recorded. Please try again.');
        setProcessing(false);
        return;
      }

      const video = document.createElement('video');
      const videoUrl = URL.createObjectURL(blob);
      video.src = videoUrl;
      video.muted = true;
      video.preload = 'auto';
      video.crossOrigin = 'anonymous';

      // Wait for video to be ready with multiple attempts
      let duration = 0;
      let attempts = 0;
      const maxAttempts = 5;

      // Ensure video metadata is loaded before accessing duration
      while ((duration <= 0 || isNaN(duration)) && attempts < maxAttempts) {
        attempts++;
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            resolve();
          }, 3000);

          const onReady = () => {
            clearTimeout(timeout);
            duration = video.duration;
            resolve();
          };

          if (video.readyState >= 1) {
            onReady();
          } else {
            video.addEventListener('loadedmetadata', onReady, { once: true });
            video.addEventListener('loadeddata', onReady, { once: true });
            video.addEventListener('canplay', onReady, { once: true });
          }

          video.onerror = () => {
            clearTimeout(timeout);
            resolve();
          };

          video.load();
        });
        if ((duration <= 0 || isNaN(duration)) && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log('Final duration after', attempts, 'attempts:', duration);
      
      // If we still don't have a valid duration, try a different approach
      if (!duration || duration <= 0 || isNaN(duration) || !isFinite(duration)) {
        console.log('Duration invalid, trying alternative approach...');
        
        // Try to estimate duration from recording time (we know it should be ~9 seconds)
        duration = 9.0; // Use the expected duration
        console.log('Using estimated duration:', duration);
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        setError('Canvas not available');
        setProcessing(false);
        URL.revokeObjectURL(videoUrl);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Canvas context not available');
        setProcessing(false);
        URL.revokeObjectURL(videoUrl);
        return;
      }

      const frameSize = 200;
      canvas.width = frameSize * 3;
      canvas.height = frameSize * 3;

      // Clear canvas with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create frame times - simple approach
      const frameTimes: number[] = [];
      for (let i = 0; i < 9; i++) {
        const time = (i / 8) * Math.max(duration - 0.5, 8);
        frameTimes.push(Math.max(0, Math.min(time, duration - 0.1)));
      }

      console.log('Frame times:', frameTimes);

      let successfulFrames = 0;

      for (let i = 0; i < frameTimes.length; i++) {
        const frameExtracted = await new Promise<boolean>((resolve) => {
          let resolved = false;
          
          const timeout = setTimeout(() => {
            if (!resolved) {
              console.warn(`Frame ${i} extraction timeout`);
              resolved = true;
              resolve(false);
            }
          }, 5000);

          const onSeeked = () => {
            if (!resolved) {
              clearTimeout(timeout);
              resolved = true;
              
              try {
                const row = Math.floor(i / 3);
                const col = i % 3;
                
                // Check if video has valid dimensions
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                  ctx.drawImage(video, col * frameSize, row * frameSize, frameSize, frameSize);
                  console.log(`Frame ${i} drawn successfully`);
                  resolve(true);
                } else {
                  console.warn(`Frame ${i} has invalid dimensions:`, video.videoWidth, 'x', video.videoHeight);
                  // Draw a placeholder rectangle
                  ctx.fillStyle = '#f0f0f0';
                  ctx.fillRect(col * frameSize, row * frameSize, frameSize, frameSize);
                  ctx.fillStyle = '#666';
                  ctx.font = '16px Arial';
                  ctx.textAlign = 'center';
                  ctx.fillText(`Frame ${i + 1}`, col * frameSize + frameSize/2, row * frameSize + frameSize/2);
                  resolve(true);
                }
              } catch (err) {
                console.error(`Error drawing frame ${i}:`, err);
                resolve(false);
              }
            }
          };

          const onError = () => {
            if (!resolved) {
              console.error(`Error seeking to frame ${i}`);
              clearTimeout(timeout);
              resolved = true;
              resolve(false);
            }
          };

          video.addEventListener('seeked', onSeeked, { once: true });
          video.addEventListener('error', onError, { once: true });
          
          // Set the time
          const timeToSet = frameTimes[i];
          console.log(`Seeking to frame ${i} at time ${timeToSet}`);
          
          try {
            video.currentTime = timeToSet;
          } catch (err) {
            console.error(`Error setting currentTime for frame ${i}:`, err);
            resolved = true;
            clearTimeout(timeout);
            resolve(false);
          }
        });

        if (frameExtracted) {
          successfulFrames++;
        }

        // Small delay between frames
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log(`Successfully extracted ${successfulFrames} out of 9 frames`);

      if (successfulFrames === 0) {
        setError('Failed to extract any video frames. Please try again.');
        setProcessing(false);
        URL.revokeObjectURL(videoUrl);
        return;
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      if (dataUrl === 'data:,') {
        setError('Failed to generate image. Please try again.');
      } else {
        setResultImage(dataUrl);
        console.log('Frame grid generated successfully with', successfulFrames, 'frames');
      }
      
      // Clean up
      URL.revokeObjectURL(videoUrl);
      
    } catch (err) {
      console.error('Error processing video:', err);
      setError(`Failed to process video: ${err instanceof Error ? err.message : String(err)}. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

  const startRecording = async () => {
    setError(null);
    chunksRef.current = []; // Reset chunks
    setResultImage(null);
    setProcessing(false);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Check for MediaRecorder support and try different MIME types
      let mimeType = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        } else {
          throw new Error('No supported video format found');
        }
      }

      console.log('Using MIME type:', mimeType);

      const recorder = new MediaRecorder(stream, { 
        mimeType: mimeType,
        videoBitsPerSecond: 1000000 // 1 Mbps - lower for better compatibility
      });
      
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log('Chunk received:', e.data.size, 'bytes');
        }
      };
      
      recorder.onstop = () => {
        console.log('Recording stopped, total chunks:', chunksRef.current.length);
        stream.getTracks().forEach((track) => track.stop());
        processVideo();
      };

      recorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setError('Recording failed. Please try again.');
      };

      // Start recording with larger chunks for better data integrity
      recorder.start(1000); // Request data every 1 second instead of 100ms
      setRecording(true);
      
      // Countdown logic
      let seconds = 9;
      setCountdown(seconds);
      const interval = setInterval(() => {
        seconds--;
        setCountdown(seconds);
        if (seconds <= 0) {
          clearInterval(interval);
        }
      }, 1000);

      // Stop recording after 9 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
        setRecording(false);
        setCountdown(null);
      }, 9000);

    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera access denied or not available.');
      setCountdown(null);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!autoStarted) {
      setAutoStarted(true);
      startRecording();
    }
    // We intentionally do not add startRecording to deps to avoid repeated calls
    // eslint-disable-next-line
  }, [autoStarted]);

  return (
    <div className="p-4 border rounded bg-white shadow relative max-w-2xl mx-auto">
      {error && <div className="text-red-600 mb-2 p-2 bg-red-50 rounded">{error}</div>}
      
      {resultImage ? (
        <div>
          <h3 className="text-lg font-semibold mb-2">Generated Frame Grid:</h3>
          <img 
            src={resultImage} 
            alt="Frame Grid" 
            className="border rounded shadow mb-4 w-full max-w-md mx-auto block" 
          />
          <div className="flex gap-2 justify-center">
            <button 
              onClick={startRecording} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              disabled={recording || processing}
            >
              Retry
            </button>
            <button 
              onClick={() => { onImageReady(resultImage); onClose(); }} 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Use This Image
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full max-w-md mb-4 rounded border" 
            style={{ display: recording ? 'block' : 'none' }} 
          />
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {recording && (
            <div className="text-blue-700 font-semibold mb-4 text-xl">
              Recording... {countdown !== null ? `${countdown}s` : ''}
            </div>
          )}
          
          {processing && (
            <div className="text-orange-600 font-semibold mb-4">
              Processing video frames...
            </div>
          )}
          
          {!recording && !processing && (
            <button 
              onClick={startRecording} 
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold"
            >
              Start Recording
            </button>
          )}
        </div>
      )}
      
      <button 
        onClick={onClose} 
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl w-8 h-8 flex items-center justify-center"
      >
        &times;
      </button>
    </div>
  );
};

export default VideoFrameGrid;