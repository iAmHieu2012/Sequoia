import { useEffect, useRef, MutableRefObject, Dispatch, SetStateAction } from 'react';

export function useCamera(
  cameraActive: boolean,
  setLogs: Dispatch<SetStateAction<string[]>>,
  videoRef: MutableRefObject<HTMLVideoElement | null>
) {
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (cameraActive && videoRef.current) {
      setLogs(prev => [...prev, "> ENGAGING OPTICAL SENSOR..."]);
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setLogs(prev => [...prev, "> CAMERA UPLINK STABLE."]);
          }
        })
        .catch(err => {
          console.error("Camera error:", err);
          setLogs(prev => [...prev, "> ERROR: FAILED TO ACCESS OPTICAL SENSOR."]);
        });
    }
    
    // Cleanup: stop all tracks when camera deactivated or component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraActive, setLogs, videoRef]);

  return { streamRef };
}
