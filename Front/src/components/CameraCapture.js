/* import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTimes } from '@fortawesome/free-solid-svg-icons';

const CameraCapture = ({ onCapture, onClose }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  const startCamera = async (deviceId) => {
    try {
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError("Error accessing camera: " + err.message);
      console.error("Error accessing camera: ", err);
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      onCapture(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request camera access
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceInfos.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);

        const backCamera = videoDevices.find(device =>
          device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear')
        );

        if (backCamera) {
          setCurrentDeviceId(backCamera.deviceId);
        } else if (videoDevices.length > 0) {
          setCurrentDeviceId(videoDevices[0].deviceId);
        }

        setIsCameraActive(true);
      } catch (err) {
        setError("Error fetching video devices: " + err.message);
        console.error("Error fetching video devices: ", err);
      }
    };

    getDevices();
  }, []);

  useEffect(() => {
    if (isCameraActive && currentDeviceId) {
      startCamera(currentDeviceId);
    }

    return () => stopCamera();
  }, [isCameraActive, currentDeviceId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center p-4">
      {error && <div className="text-red-500">{error}</div>}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
      ></video>
      <canvas ref={canvasRef} className="hidden"></canvas>

      <div className="absolute bottom-4 flex space-x-4">
        <button
          onClick={capturePhoto}
          className="bg-blue-500 text-white p-4 rounded-full shadow-lg"
        >
          <FontAwesomeIcon icon={faCamera} size="2x" />
        </button>
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2 rounded-full"
      >
        <FontAwesomeIcon icon={faTimes} size="2x" />
      </button>
    </div>
  );
};

export default CameraCapture;
 
 */

/* import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTimes } from '@fortawesome/free-solid-svg-icons';

const CameraCapture = ({ onCapture, onClose }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  const startCamera = async (deviceId) => {
    try {
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 16 / 9 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // متوقف کردن دوربین قبلی قبل از شروع دوربین جدید
      if (videoRef.current && videoRef.current.srcObject) {
        const oldStream = videoRef.current.srcObject;
        const tracks = oldStream.getTracks();
        tracks.forEach(track => track.stop());
      }

      videoRef.current.srcObject = stream; // به ویدیو منبع جدید اختصاص دهید
      await videoRef.current.play(); // درخواست پخش ویدیو
    } catch (err) {
      setError("Error accessing camera: " + err.message);
      console.error("Error accessing camera: ", err);
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video) {
      // تنظیم ابعاد کادر به کیفیت مورد نظر
      canvas.width = 1920; // تغییر به 1920
      canvas.height = 1080; // تغییر به 1080

      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      onCapture(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceInfos.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);

        const backCamera = videoDevices.find(device =>
          device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear')
        );

        if (backCamera) {
          setCurrentDeviceId(backCamera.deviceId);
        } else if (videoDevices.length > 0) {
          setCurrentDeviceId(videoDevices[0].deviceId);
        }

        setIsCameraActive(true);
      } catch (err) {
        setError("Error fetching video devices: " + err.message);
        console.error("Error fetching video devices: ", err);
      }
    };

    getDevices();
  }, []);

  useEffect(() => {
    if (isCameraActive && currentDeviceId) {
      startCamera(currentDeviceId);
    }

    return () => stopCamera();
  }, [isCameraActive, currentDeviceId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center p-4">
      {error && <div className="text-red-500">{error}</div>}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
      ></video>
      <canvas ref={canvasRef} className="hidden"></canvas>

      <div className="absolute bottom-4 flex space-x-4">
        <button
          onClick={capturePhoto}
          className="bg-blue-500 text-white p-4 rounded-full shadow-lg"
        >
          <FontAwesomeIcon icon={faCamera} size="2x" />
        </button>
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2 rounded-full"
      >
        <FontAwesomeIcon icon={faTimes} size="2x" />
      </button>
    </div>
  );
};

export default CameraCapture;
 */


/* import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTimes } from '@fortawesome/free-solid-svg-icons';

const CameraCapture = ({ onCapture, onClose }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  const startCamera = async (deviceId) => {
    try {
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 16 / 9 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current && videoRef.current.srcObject) {
        const oldStream = videoRef.current.srcObject;
        const tracks = oldStream.getTracks();
        tracks.forEach(track => track.stop());
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch (err) {
      setError("Error accessing camera: " + err.message);
      console.error("Error accessing camera: ", err);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (canvas && video) {
      // Set canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      onCapture(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceInfos.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);

        const backCamera = videoDevices.find(device =>
          device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear')
        );

        if (backCamera) {
          setCurrentDeviceId(backCamera.deviceId);
        } else if (videoDevices.length > 0) {
          setCurrentDeviceId(videoDevices[0].deviceId);
        }

        setIsCameraActive(true);
      } catch (err) {
        setError("Error fetching video devices: " + err.message);
        console.error("Error fetching video devices: ", err);
      }
    };

    getDevices();
  }, []);

  useEffect(() => {
    if (isCameraActive && currentDeviceId) {
      startCamera(currentDeviceId);
    }

    return () => stopCamera();
  }, [isCameraActive, currentDeviceId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center p-4">
      {error && <div className="text-red-500">{error}</div>}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
      ></video>
      <canvas ref={canvasRef} className="hidden"></canvas>

      <div className="absolute bottom-4 flex space-x-4">
        <button
          onClick={capturePhoto}
          className="bg-blue-500 text-white p-4 rounded-full shadow-lg"
        >
          <FontAwesomeIcon icon={faCamera} size="2x" />
        </button>
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2 rounded-full"
      >
        <FontAwesomeIcon icon={faTimes} size="2x" />
      </button>
    </div>
  );
};

export default CameraCapture;
 
 */

import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTimes } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';

const CameraCapture = ({ onCapture, onClose }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  const startCamera = async (deviceId) => {
    try {
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: { ideal: 16 / 9 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current && videoRef.current.srcObject) {
        const oldStream = videoRef.current.srcObject;
        const tracks = oldStream.getTracks();
        tracks.forEach(track => track.stop());
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch (err) {
      setError("Error accessing camera: " + err.message);
      console.error("Error accessing camera: ", err);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if ('ImageCapture' in window) {
      // روش ImageCapture برای کیفیت بالاتر در صورت موجود بودن
      try {
        const track = video.srcObject.getVideoTracks()[0];
        const imageCapture = new ImageCapture(track);
        const blob = await imageCapture.takePhoto();
        const url = URL.createObjectURL(blob);
        onCapture(url); // ارسال عکس بدون تغییر
      } catch (error) {
        setError("Error capturing photo: " + error.message);
        console.error("Error capturing photo: ", error);
      }
    } else {
      // روش canvas برای دستگاه‌هایی که ImageCapture پشتیبانی نمی‌کنند
      if (canvas && video) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onCapture(dataUrl); // ارسال تصویر بدون تغییر
      }
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceInfos.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);

        const backCamera = videoDevices.find(device =>
          device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear')
        );

        if (backCamera) {
          setCurrentDeviceId(backCamera.deviceId);
        } else if (videoDevices.length > 0) {
          setCurrentDeviceId(videoDevices[0].deviceId);
        }

        setIsCameraActive(true);
      } catch (err) {
        setError("Error fetching video devices: " + err.message);
        console.error("Error fetching video devices: ", err);
      }
    };

    getDevices();
  }, []);

  useEffect(() => {
    if (isCameraActive && currentDeviceId) {
      startCamera(currentDeviceId);
    }

    return () => stopCamera();
  }, [isCameraActive, currentDeviceId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center p-4">
    {error && <div className="text-red-500">{error}</div>} 

    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      autoPlay
      playsInline
    ></video>
    <canvas ref={canvasRef} className="hidden"></canvas>

    <div className="absolute bottom-4 flex space-x-4 ">
      <button
        onClick={capturePhoto}
        className="bg-blue-500 text-white p-4 rounded-full shadow-lg"
      >
        <FontAwesomeIcon icon={faCamera} size="2x" />
      </button>
    </div>

    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-white p-2 rounded-full"
    >
      <FontAwesomeIcon icon={faTimes} size="2x" />
    </button>
  </div>
  );
};

export default CameraCapture;
