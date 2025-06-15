import React, { useEffect, useRef, useState } from 'react';
import { Device } from 'mediasoup-client';
import { socket } from './socket';
import { RemoteVideo } from './remotevideo';
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
      const { routerRtpCapabilities } = await new Promise((resolve )=>{
        console.log("emitted-call-room",roomName);
        socket.emit('join-call-room', {roomName:roomName}, resolve)}
      );
      
      await newDevice.load({ routerRtpCapabilities });
      setDevice(newDevice);

      socket.emit('join-room', { roomName });
      console.log(`joined room `)
      let sendTransport;
      // socket.emit('createProducerTransport', {roomName:roomName}, async ( params ) => {
      //    sendTransport = newDevice.createSendTransport(params);
           
      // });

       const sendData = await new Promise(resolve => {
        socket.emit('createProducerTransport', {roomName:roomName}, resolve);
      });

      sendTransport = newDevice.createSendTransport(sendData);





        sendTransport.on('connect', ({ dtlsParameters }, callback) => {
           console.log('connect');
          socket.emit('connectProducerTransport', { dtlsParameters ,roomName,transportId: sendTransport.id},()=>{ callback()});
        });

        sendTransport.on('produce', ({ kind, rtpParameters }, callback) => {
          socket.emit('produce', { kind, rtpParameters,roomName,transportId: sendTransport.id}, ({ id }) => callback({ id }));
        });

         for (const track of stream.getTracks()) {
  await sendTransport.produce({ track });
}
         
       let recvTransport=null;
      // socket.emit('createConsumerTransport', {roomName:roomName}, async ( params ) => {
      //    recvTransport = newDevice.createRecvTransport(params);
      //    console.log("recvTransport")
      //    console.dir(recvTransport);
        
        
      // });
       if(recvTransport===null){
        const recvData = await new Promise(resolve => {
          socket.emit('createConsumerTransport', {roomName:roomName}, resolve);
        });
        recvTransport = newDevice.createRecvTransport(recvData);
      }
      console.log("receive transport is",recvTransport);
      setConsumerTransport(recvTransport);
      recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
          socket.emit('connectConsumerTransport', { dtlsParameters,roomName,transportId: recvTransport.id }, res => {
            if (res?.error) errback(res.error); else callback();
          });
        });
      socket.emit('getProducers', {roomName}, async ( {producers} ) => {
          for (const { producerSocketId,producerId, kind } of producers) {
            console.log(`username is id is ${producerId}`)
            consumeTrack(recvTransport, producerSocketId, kind,producerId);
          }
        });
        
          socket.on('new-producer', async ({  producerSocketId: socketId, producerId, kind  }) => {
        console.log("New producer received:", socketId, kind,producerId);
        consumeTrack(recvTransport, socketId, kind,producerId);
      });
    
    };

    const consumeTrack = async (recvTransport, producerSocketId, kind,producerId) => {
      if (!recvTransport) return;
      socket.emit('consume', { producerSocketId, kind ,roomName,producerId}, async ({ id,producerId, rtpParameters }) => {
        const consumer = await recvTransport.consume({ id, kind,producerId, rtpParameters });
         socket.emit('resumeConsumer', { consumerId: consumer.id ,roomName});
        setRemoteStreams(prev => {
          const current = prev[producerSocketId] || new MediaStream();
          current.addTrack(consumer.track);
          console.dir(consumer.track);
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

    socket.emit('createScreenTransport', {}, async ( params ) => {
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
        <video ref={localVideoRef} autoPlay  className="local-video" />
        <div className="controls">
          <button onClick={toggleVideo}>{isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}</button>
          <button onClick={toggleAudio}>{isAudioEnabled ? 'Mute' : 'Unmute'}</button>
          <button onClick={toggleScreenShare}>{screenTrack ? 'Stop Screen' : 'Share Screen'}</button>
        </div>
      </div>

      {Object.entries(remoteStreams).map(([producerSocketId, stream]) => (
  <video                    
    key={producerSocketId}
    autoPlay
    style={{ backgroundColor: 'lightblue' }}
    playsInline
    ref={(el) => {
      if (el) el.srcObject = stream;
    }}
    width={400}
  />
))}


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
