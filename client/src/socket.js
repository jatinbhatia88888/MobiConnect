import { io } from 'socket.io-client';

export const socket =io("http://localhost:8000",{
     withCredentials: true,
});
// socket.on("incoming-video-call", ({ room, from }) => {
//   const accept = window.confirm(` Incoming call from ${from}. Do you want to join?`);
//   if (accept) {
//     window.location.href = `/video?room=${room}`;
//   }
// });
