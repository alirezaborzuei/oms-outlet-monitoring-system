"use client";

import { useRef, useState } from 'react';

export default function CameraPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState(null);

  // Function to start the camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // Function to stop the camera
  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    setIsCameraOn(false);
  };

  // Function to take a screenshot
  const takeScreenshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image as a data URL and display it
    const dataUrl = canvas.toDataURL('image/png');
    setImageDataUrl(dataUrl);
  };

  return (
    <div>
      <h1>Camera App</h1>
      
      {/* Video Element */}
      <div>
        <video ref={videoRef} autoPlay width="640" height="480" />
      </div>

      {/* Canvas Element */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Display Screenshot */}
      {imageDataUrl && (
        <div>
          <h2>Screenshot</h2>
          <img src={imageDataUrl} alt="Screenshot" width="640" height="480" />
        </div>
      )}

      {/* Camera Controls */}
      <div>
        {!isCameraOn ? (
          <button onClick={startCamera}>Start Camera</button>
        ) : (
          <button onClick={stopCamera}>Stop Camera</button>
        )}
        {isCameraOn && <button onClick={takeScreenshot}>Take Screenshot</button>}
      </div>
    </div>
  );
}
