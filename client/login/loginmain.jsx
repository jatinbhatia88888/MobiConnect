import {useState} from 'react'
 export function LogForm(){
  const [name,setName]= useState("");
  const [email,setEmail]=useState("");
   const handleChange=(event)=>{
    setName(event.target.value);
   }
   const handleEChange=(event)=>{
    setEmail(event.target.value);
   }
   
   return (<form >
         <div className="w-96 ...">
        <label htmlFor ="logForm" >Name:</label>
        <input type="text" id="logForm" onChange={handleChange} value={name} ></input>
        <br></br>
        </div>
        <h1 className="text-3xl font-italic underline">
         Hello world!
        </h1>
        <div className="w-96 ...">
        <label htmlFor ="logForm">Email:</label>
        <div className="bg-sky-50">
        <input type="email" id="logemail" onChange={handleEChange} value={email} className="w-96 ..."></input>
        </div>
        <p className="text-gray-700 dark:text-gray-400">{name}</p>
        </div>
   </form>)
}