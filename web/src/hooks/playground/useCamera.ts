import { useEffect, useRef, MutableRefObject, Dispatch, SetStateAction } from 'react';

export function useCamera(
  cameraActive: boolean,
  setLogs: Dispatch<SetStateAction<string[]>>,
  videoRef: MutableRefObject<HTMLVideoElement | HTMLImageElement | null>
) {
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let active = true;

    if (cameraActive && videoRef.current instanceof HTMLVideoElement) {
      setLogs(prev => [...prev, "> ENGAGING OPTICAL SENSOR..."]);
      
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (!active) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current instanceof HTMLVideoElement) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setLogs(prev => [...prev, "> CAMERA UPLINK STABLE."]);
          }
        })
        .catch(err => {
          console.error("Camera error:", err);
          if (active) {
            setLogs(prev => [...prev, "> ERROR: FAILED TO ACCESS OPTICAL SENSOR."]);
          }
        });
    }
    
    // Cleanup: stop all tracks when camera deactivated or component unmounts
    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraActive, setLogs, videoRef]);

  return { streamRef };
}
