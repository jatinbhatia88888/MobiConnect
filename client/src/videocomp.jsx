import React, { useEffect, useRef, useState } from 'react';
import { Device } from 'mediasoup-client';
import { socket } from './socket';

export function VideoRoom({ roomName }) {
  console.log(roomName)
  const localVideoRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [mediaStream, setMediaStream] = useState(null);
  const [device, setDevice] = useState(null);
  const [consumerTransport, setConsumerTransport] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [screenTransport, setScreenTransport] = useState(null);
  const [screenTrack, setScreenTrack] = useState(null);

  useEffect(() => {
    const start = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const newDevice = new Device();
      const { routerRtpCapabilities } = await new Promise(resolve =>
        socket.emit('join-call-room', {roomName:roomName}, resolve)
      );
      await newDevice.load({ routerRtpCapabilities });
      setDevice(newDevice);

      socket.emit('join-room', { roomName });
      console.log(`join room `)
      
      socket.emit('createProducerTransport', {roomName:roomName}, async ({ params }) => {
        const sendTransport = newDevice.createSendTransport(params);
        sendTransport.on('connect', ({ dtlsParameters }, callback) => {
          socket.emit('connectProducerTransport', { dtlsParameters }, callback);
        });
        sendTransport.on('produce', ({ kind, rtpParameters }, callback) => {
          socket.emit('produce', { kind, rtpParameters }, ({ id }) => callback({ id }));
        });
        stream.getTracks().forEach(track => sendTransport.produce({ track }));
      });

     
      socket.emit('createConsumerTransport', {}, async ({ params }) => {
        const recvTransport = newDevice.createRecvTransport(params);
        setConsumerTransport(recvTransport);
        recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
          socket.emit('connectConsumerTransport', { dtlsParameters }, res => {
            if (res?.error) errback(res.error); else callback();
          });
        });

        socket.emit('getProducers', {}, async ({ producers }) => {
          for (const { producerSocketId, kind } of producers) {
            consumeTrack(recvTransport, producerSocketId, kind);
          }
        });
      });
       

      
      socket.on('new-producer', async ({ producerId,producersocketId:socketId, kind }) => {
        consumeTrack(consumerTransport, socketId, kind);
      });
    };

    const consumeTrack = async (transport, producerSocketId, kind) => {
      if (!transport) return;
      socket.emit('consume', { producerSocketId, kind ,roomName}, async ({ id, rtpParameters }) => {
        const consumer = await transport.consume({ id, kind, rtpParameters });
        setRemoteStreams(prev => {
          const current = prev[producerSocketId] || new MediaStream();
          current.addTrack(consumer.track);
          return { ...prev, [producerSocketId]: current };
        });
      });
    };

    start();

    return () => {
      socket.emit('leave-room', { roomName });
      if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
      if (screenTransport) screenTransport.close();
      if (screenTrack) screenTrack.stop();
    };
  }, [roomName]);

  const toggleVideo = () => {
    const track = mediaStream?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoEnabled(track.enabled);
    }
  };

  const toggleAudio = () => {
    const track = mediaStream?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsAudioEnabled(track.enabled);
    }
  };

  const toggleScreenShare = async () => {
    if (screenTrack) {
      screenTrack.stop();
      if (screenTransport) screenTransport.close();
      setScreenTrack(null);
      setScreenTransport(null);
      return;
    }

    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const track = screenStream.getVideoTracks()[0];
    setScreenTrack(track);

    socket.emit('createScreenTransport', {}, async ({ params }) => {
      const transport = device.createSendTransport(params);
      setScreenTransport(transport);

      transport.on('connect', ({ dtlsParameters }, callback) => {
        socket.emit('connectScreenTransport', { dtlsParameters }, callback);
      });

      transport.on('produce', ({ kind, rtpParameters }, callback) => {
        socket.emit('produceScreen', { kind, rtpParameters }, ({ id }) => callback({ id }));
      });

      transport.produce({ track });

      track.onended = () => {
        transport.close();
        setScreenTransport(null);
        setScreenTrack(null);
      };
    });
  };

  return (
    <div className="video-call">
      <div className="local-container">
        <video ref={localVideoRef} autoPlay muted className="local-video" />
        <div className="controls">
          <button onClick={toggleVideo}>{isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}</button>
          <button onClick={toggleAudio}>{isAudioEnabled ? 'Mute' : 'Unmute'}</button>
          <button onClick={toggleScreenShare}>{screenTrack ? 'Stop Screen' : 'Share Screen'}</button>
        </div>
      </div>

      <div className="remote-videos">
        {Object.entries(remoteStreams).map(([id, stream]) => (
          <video key={id} autoPlay playsInline className="remote-video" ref={el => el && (el.srcObject = stream)} />
        ))}
      </div>

      <style>{`
        .video-call {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 100vw;
          overflow: hidden;
        }
        .local-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 10px;
        }
        .controls button {
          margin: 4px;
          padding: 6px 10px;
          border: none;
          background-color: #007bff;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }
        .controls button:hover {
          background-color: #0056b3;
        }
        .local-video {
          width: 300px;
          height: 200px;
          background: black;
        }
        .remote-videos {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          width: 100%;
          padding: 10px;
        }
        .remote-video {
          width: 250px;
          height: 180px;
          background: black;
        }
      `}</style>
    </div>
  );
}
