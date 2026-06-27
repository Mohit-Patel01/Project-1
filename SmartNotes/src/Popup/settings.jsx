import React, { useState } from 'react'
import { IoMdSettings } from 'react-icons/io'

const Settings = (setPage) => {
    const [Apikey, setApikey] = useState("")
     async function Apihandler(elem){
      const value = elem.target.value
       setApikey(value)
       await chrome.storage.local.set({
            geminiKey: value
        });
    }
  return (
    <div className=' overflow-y-scroll overflow-x-hidden p-2 bg-linear-to-br from-teal-900 via-cyan-800 to-cyan-700 h-100 w-100' > 
     <div className='Navbar flex justify-between items-center  p-2'>
       <div className='flex h-12 w-11'>
       <img src='icon.png'/>
       <img src='icon1.png'/>
       </div>
         <h1 className='text-2xl font-[acme] font-stretch-150% ml-3'>Smartify Your Notes</h1>
         <div className='h-8 w-8 hover:cursor-pointer' >
         <IoMdSettings onClick={() => setPage.setPage("settings")}  className='h-full w-full' />
       </div>
       </div>
      <div className='h-full w-full flex flex-col items-center p-y-5 gap-4 ' >
        <div className='flex flex-col gap-2 items-center h-fit p-3 ' >
            <div className='flex gap-3 text-xl ' ><h1>Enter Your Api key</h1>
            <input type='text' placeholder='Api Key' value={Apikey} onChange={(elem)=>{Apihandler(elem)}} className='outline-none border-2 border-teal-600 rounded-2xl p-2 ' /></div>
            <a href='https://aistudio.google.com/api-keys' target='_blank' className='text-[10px] ml-12 hover:underline ' >Where to Find My Api Key?</a>
        </div>
        <div  >
            <button onClick={() => setPage.setPage("home")} className='bg-cyan-500 border-2 border-cyan-600 hover:cursor-pointer active:scale-95 h-10 w-25 rounded-xl font-[font1] text-lg'>
                Back
            </button>
        </div>
        
      </div>
    </div>
  )
}

export default Settings