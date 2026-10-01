import { useEffect, useRef, RefObject, Dispatch, SetStateAction } from 'react';

/**
 * Hook to manage the lifecycle of the user's webcam.
 * Handles requesting permissions, assigning the MediaStream to the video element,
 * and securely stopping the tracks when the camera is toggled off or unmounted.
 * 
 * @param cameraActive Whether the camera feed should be active
 * @param setLogs State setter to push system logs to the playground terminal
 * @param videoRef Reference to the video element to attach the stream to
 */
export function useCamera(
  cameraActive: boolean,
  setLogs: Dispatch<SetStateAction<string[]>>,
  videoRef: RefObject<HTMLVideoElement | HTMLImageElement | null>
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
        .catch(error => {
          console.error("Camera error:", error);
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
