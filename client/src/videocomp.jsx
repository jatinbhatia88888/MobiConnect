import React, { useEffect, useRef, useState } from 'react';
import { Device } from 'mediasoup-client';
import  {VideoSlider} from './remotevideo.jsx'

import { socket } from './socket';

export function VideoRoom({ roomName }) {
  console.log(roomName)
  const localVideoRef = useRef(null);
  const sendTransportRef = useRef(null);
  const recvTransportRef = useRef(null);
  const screenTransportRef = useRef(null);
  const localScreenVideoRef = useRef(null);
 const [showLocalScreen, setShowLocalScreen] = useState(false);
  const [localScreenStream, setLocalScreenStream] = useState(null);

  const [remoteStreams, setRemoteStreams] = useState({});
  const [remoteScreenStreams, setRemoteScreenStreams] = useState({});
  const [mediaStream, setMediaStream] = useState(null);
  const [device, setDevice] = useState(null);
  const [consumerTransport, setConsumerTransport] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenShareEnabled,setIsScreenShareEnabled]=useState(false);
  const [screenTransport, setScreenTransport] = useState(null);
  const [screenTrack, setScreenTrack] = useState(null);
  const [trigger, setTrigger] = useState(false);
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
      sendTransportRef.current=sendTransport;




        sendTransport.on('connect', ({ dtlsParameters }, callback) => {
           console.log('connect');
          socket.emit('connectProducerTransport', { dtlsParameters ,roomName,transportId: sendTransport.id},()=>{ callback()});
        });

        sendTransport.on('produce', ({ kind, rtpParameters }, callback) => {
          socket.emit('produce', { kind, rtpParameters,roomName,transportId: sendTransport.id,type:"camera"}, ({ id }) => callback({ id }));
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
        recvTransportRef.current=recvTransport;
      }
      console.log("receive transport is",recvTransport);
      setConsumerTransport(recvTransport);
      recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
          socket.emit('connectConsumerTransport', { dtlsParameters,roomName,transportId: recvTransport.id }, res => {
            if (res?.error) errback(res.error); else callback();
          });
        });
      socket.emit('getProducers', {roomName}, async ( {producers} ) => {
          for (const { producerSocketId,producerId, kind ,type} of producers) {
            console.log(`username is id is ${producerId}`)
            consumeTrack(recvTransport, producerSocketId, kind,producerId,type);
          }
        });
        
          socket.on('new-producer', async ({  producerSocketId: socketId, producerId, kind ,type }) => {
        console.log("New producer received:", socketId, kind,producerId);
        consumeTrack(recvTransport, socketId, kind,producerId,type);
      });
    
    };

    const consumeTrack = async (recvTransport, producerSocketId, kind,producerId,type) => {
      if (!recvTransport) return;
      socket.emit('consume', { producerSocketId, kind ,roomName,producerId}, async ({ id,producerId, rtpParameters }) => {
        const consumer = await recvTransport.consume({ id, kind,producerId, rtpParameters });
         socket.emit('resumeConsumer', { consumerId: consumer.id ,roomName});
        if(type=="camera"){
        setRemoteStreams(prev => {
          const current = prev[producerSocketId] || new MediaStream();
          current.addTrack(consumer.track);
          console.dir(consumer.track);
          return { ...prev, [producerSocketId]: current };
        });};
        if(type=="screen"){
          setRemoteScreenStreams(prev=>{
             const current = prev[producerSocketId] || new MediaStream();
          current.addTrack(consumer.track);
          console.dir(consumer.track);
          return { ...prev, [producerSocketId]: current };
          })
        }
      });
    };

    start();
      const handlePeerLeft = ({ socketId, type }) => {
      console.log(`Peer left: ${socketId}, type: ${type}`);
     setTrigger(prev => !prev)
    if (!type || type === "camera") {
      setRemoteStreams(prev => {
        const copy = { ...prev };
        delete copy[socketId];
        return copy;
      });
    }

    if (!type || type === "screen") {
      setRemoteScreenStreams(prev => {
        const copy = { ...prev };
        delete copy[socketId];
        return copy;
      });
    }
  };

  socket.on('peer-left', handlePeerLeft);

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

    if (screenTransportRef.current) {
      socket.emit('stop-screen-share', {
        roomName,
        transportId: screenTransportRef.current.id
      });
      
      screenTransportRef.current.close();
      screenTransportRef.current = null;
      setLocalScreenStream(null); // 
      setIsScreenShareEnabled(false);
      setTrigger(prev => !prev)
      
    }

    setScreenTrack(null);
    setScreenTransport(null);
    setShowLocalScreen(false);
    return;
  }


    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    if (localScreenVideoRef.current) {
  localScreenVideoRef.current.srcObject = screenStream;
}
setIsScreenShareEnabled(true);
setLocalScreenStream(screenStream); 
    const track = screenStream.getVideoTracks()[0];
    setScreenTrack(track);
    setShowLocalScreen(true);
     let transport =null;
       
      
       
      
        const sendData = await new Promise(resolve => {
        socket.emit('createProducerTransport', {roomName:roomName}, resolve);
      });
     if (!device) return console.warn("Device not ready yet");

      transport = device.createSendTransport(sendData);
      screenTransportRef.current=transport;

     
    
     transport.on('connect', ({ dtlsParameters }, callback) => {
         
          socket.emit('connectProducerTransport', { dtlsParameters ,roomName,transportId: transport.id},()=>{ callback()});
        });

        transport.on('produce', ({ kind, rtpParameters }, callback) => {
          socket.emit('produce', { kind, rtpParameters,roomName,transportId: transport.id,type:"screen"}, ({ id }) => callback({ id }));
        });

        
  await transport.produce({ track });
      


 track.onended = () => {
  if (screenTransportRef.current) {
    socket.emit('stop-screen-share', {
      roomName,
      transportId: screenTransportRef.current.id
    });
    setTrigger(prev => !prev)
    screenTransportRef.current.close();
    screenTransportRef.current = null;
    setLocalScreenStream(null); 
  }

  setScreenTrack(null);
  setScreenTransport(null);
  setShowLocalScreen(false);
};

  };
  useEffect(() => {
  if (localScreenVideoRef.current && localScreenStream) {
    localScreenVideoRef.current.srcObject = localScreenStream;
    localScreenVideoRef.current.play().catch((e) => {
      console.warn("Autoplay failed:", e);
    });
  }
}, [localScreenStream]);

   

  



  const endCall = () => {
  
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    setMediaStream(null);
  }

  
  if (screenTrack) {
    screenTrack.stop();
    setScreenTrack(null);
  }

  if (screenTransportRef.current) {
    screenTransportRef.current.close();
    screenTransportRef.current = null;
    setScreenTransport(null);
  }

  
  if (sendTransportRef.current) {
    sendTransportRef.current.close();
    sendTransportRef.current = null;
  }

  
  if (recvTransportRef.current) {
    recvTransportRef.current.close();
    recvTransportRef.current = null;
    setConsumerTransport(null);
  }

 
  socket.emit('leave-room', { roomName });

 
  setRemoteStreams({});
  setRemoteScreenStreams({});

  
  window.location.href = '/home';
};
const controlButtons = [
  <button className="control-btn" onClick={toggleAudio}>
    <i className="fas fa-microphone"></i> {isAudioEnabled ? "Audio On" : "Audio Off"}
  </button>,
  <button className="control-btn" onClick={toggleVideo}>
    <i className="fas fa-video"></i> {isVideoEnabled ? "Video On" : "Video Off"}
  </button>,
  <button className="control-btn" onClick={toggleScreenShare}>
    <i className="fas fa-desktop"></i> {isScreenShareEnabled? "Stop Share" : "Share Screen"}
  </button>,
  <button className="control-btn" onClick={endCall}>
    <i className="fas fa-phone-slash"></i> End Call
  </button>
];




  return (
    <div>
   <VideoSlider
  localStream={mediaStream}
  localScreenStream={localScreenStream}
  remoteStreams={remoteStreams}
  remoteScreenStreams={remoteScreenStreams}
  controlButtons={controlButtons}
 trigger={trigger}  
/>

    </div>
  );
} 