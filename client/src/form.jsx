import {useEffect} from 'react';
import { io } from 'socket.io-client';
const socket =io("http://localhost:8000");
export function Formele(){
    useEffect(()=>{
        socket.on("message",(msg)=>{
            console.log(msg);
        })

    })
    return (<>
    <form >
        <input type="text"></input>
    </form>
    </>)
}
