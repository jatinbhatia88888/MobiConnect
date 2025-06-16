import { useEffect, useRef } from "react";

export function RemoteVideo({ stream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    let isCancelled = false;

    const setupStream = async () => {
      
      if (video.srcObject !== stream) {
        video.srcObject = stream;
         video.onloadedmetadata = () => {
    video.play();
};
        try {
          await video.play();
        } catch (err) {
          if (!isCancelled) {
            console.warn("Remote video play interrupted:", err);
          }
        }
      }
    };

    setupStream();

    return () => {
      isCancelled = true;
    };
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted={true} 
      playsInline
      className="remote-video"
      style={{ width: "100%", height: "auto", backgroundColor: "black" }}
    />
  );
}
