import React, { useRef, useState } from 'react';

const VideoFrameGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: false 
      });
      streamRef.current = stream;
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      setCameraStarted(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraStarted(false);
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) return;

    const chunks: BlobPart[] = [];
    
    // Try different codec options for better compatibility
    let mediaRecorder;
    const options = [
      { mimeType: 'video/mp4' },
      { mimeType: 'video/webm;codecs=vp9' },
      { mimeType: 'video/webm;codecs=vp8' },
      { mimeType: 'video/webm' }
    ];

    for (const option of options) {
      if (MediaRecorder.isTypeSupported(option.mimeType)) {
        mediaRecorder = new MediaRecorder(streamRef.current, option);
        console.log('Using codec:', option.mimeType);
        break;
      }
    }

    if (!mediaRecorder) {
      mediaRecorder = new MediaRecorder(streamRef.current);
      console.log('Using default codec');
    }

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'video/webm' });
      console.log('Recording finished, blob:', { type: blob.type, size: blob.size });
      setRecordedBlob(blob);
      setIsRecording(false);
      stopCamera();
      
      // Automatically process the recorded video
      await processVideoFrames(blob);
    };

    // Start countdown
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          // Start actual recording
          console.log('Starting recording...');
          mediaRecorder.start(1000); // Record in 1-second chunks
          setIsRecording(true);
          
          // Stop recording after 10 seconds
          setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              console.log('Stopping recording...');
              mediaRecorderRef.current.stop();
            }
          }, 10000);
          
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const processVideoFrames = async (videoBlob: Blob) => {
    try {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoBlob);
      video.muted = true;
      video.preload = 'metadata';
      video.crossOrigin = 'anonymous';
      
      console.log('Video blob type:', videoBlob.type);
      console.log('Video blob size:', videoBlob.size);

      // Wait for metadata to load with timeout and multiple attempts
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video metadata loading timeout'));
        }, 15000);

        let attempts = 0;
        const checkMetadata = () => {
          attempts++;
          console.log(`Metadata check attempt ${attempts}, duration: ${video.duration}, readyState: ${video.readyState}`);
          
          if (video.duration && isFinite(video.duration) && video.duration > 0) {
            clearTimeout(timeout);
            resolve();
          } else if (attempts < 10) {
            setTimeout(checkMetadata, 100);
          }
        };

        video.onloadedmetadata = () => {
          console.log('Metadata loaded event fired');
          checkMetadata();
        };

        video.onloadeddata = () => {
          console.log('Data loaded event fired');
          checkMetadata();
        };

        video.oncanplay = () => {
          console.log('Can play event fired');
          checkMetadata();
        };

        video.onerror = (e) => {
          clearTimeout(timeout);
          console.error('Video error:', e);
          reject(new Error('Failed to load video'));
        };

        // Start initial check
        setTimeout(checkMetadata, 100);
      });

      const duration = video.duration;
      
      // Final validation
      if (!duration || !isFinite(duration) || duration <= 0) {
        throw new Error(`Invalid video duration: ${duration}. Video may be corrupted or in unsupported format.`);
      }

      console.log('Video duration:', duration);
      
      // Generate frame times, ensuring they're valid
      const frameTimes = Array.from({ length: 9 }, (_, i) => {
        const time = (i / 8) * duration;
        return Math.min(time, duration - 0.1); // Ensure we don't exceed duration
      });

      console.log('Frame times:', frameTimes);

      const frameSize = 600;
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not available');
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');
      
      canvas.width = frameSize * 3;
      canvas.height = frameSize * 3;

      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < frameTimes.length; i++) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Seek timeout for frame ${i}`));
          }, 5000);

          const seekTime = frameTimes[i];
          
          video.onseeked = () => {
            clearTimeout(timeout);
            try {
              const row = Math.floor(i / 3);
              const col = i % 3;
              ctx.drawImage(video, col * frameSize, row * frameSize, frameSize, frameSize);
              resolve();
            } catch (error) {
              reject(error);
            }
          };

          video.onerror = () => {
            clearTimeout(timeout);
            reject(new Error(`Video error during seek for frame ${i}`));
          };

          // Validate seek time before setting
          if (isFinite(seekTime) && seekTime >= 0 && seekTime < duration) {
            video.currentTime = seekTime;
          } else {
            clearTimeout(timeout);
            reject(new Error(`Invalid seek time: ${seekTime}`));
          }
        });
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setImageSrc(dataUrl);
      URL.revokeObjectURL(video.src);
      
    } catch (error) {
      console.error('Error processing video frames:', error);
      alert(`Error processing video: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processVideoFrames(file);
  };

  // Removing unused function
  const resetRecording = () => {
    setRecordedBlob(null);
    setImageSrc(null);
    setCountdown(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Video Frame Grid</h2>
      
      {/* Upload Section */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Upload Video File</h3>
        <input 
          type="file" 
          accept="video/*" 
          onChange={handleVideoUpload} 
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Recording Section */}
      <div className="mb-8 p-4 border rounded-lg bg-blue-50">
        <h3 className="text-lg font-semibold mb-3">Record 10-Second Video</h3>
        
        {!cameraStarted && !recordedBlob && (
          <button
            onClick={startCamera}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
          >
            Start Camera
          </button>
        )}

        {cameraStarted && (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoPreviewRef}
                className="w-full max-w-md mx-auto rounded border"
                autoPlay
                muted
                playsInline
              />
              {countdown && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                  <span className="text-6xl font-bold text-white">{countdown}</span>
                </div>
              )}
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium bg-red-500 px-2 py-1 rounded text-sm">REC</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-center space-x-3">
              {!isRecording && !countdown && (
                <button
                  onClick={startRecording}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded font-medium"
                >
                  Record 10s Video
                </button>
              )}
              
              <button
                onClick={stopCamera}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
              >
                Stop Camera
              </button>
            </div>
          </div>
        )}

        {recordedBlob && !imageSrc && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-100 border border-blue-300 rounded">
              <p className="text-blue-700 font-medium">🎬 Processing video frames...</p>
            </div>
          </div>
        )}

        {recordedBlob && imageSrc && (
          <div className="space-y-4">
            <div className="p-3 bg-green-100 border border-green-300 rounded">
              <p className="text-green-700 font-medium">✓ Video processed successfully!</p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={resetRecording}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
              >
                Record Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Results */}
      {imageSrc && (
        <div className="mt-8 text-center">
          <h3 className="text-xl font-semibold mb-4">Generated 3x3 Frame Grid</h3>
          <img 
            src={imageSrc} 
            alt="Frame Grid" 
            className="border rounded shadow-lg mx-auto max-w-full"
          />
          <div className="mt-4">
            <a
              href={imageSrc}
              download="video-frame-grid.jpg"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium inline-block"
            >
              Download Frame Grid
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFrameGrid;