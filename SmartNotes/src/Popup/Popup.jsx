import React, {useEffect, useState } from 'react'
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IoMdSettings } from "react-icons/io";
const Popup = (setPage) => {
  
  const [anstextarea, setanstextarea] = useState('')
  const [textArea, settextArea] = useState('')
  const [isscanning, setisscanning] = useState(false)
  const [placeholder, setplaceholder] = useState("You answer will be visible here")
  const [Placeholder, setPlaceholder] = useState("Write something......")
  async function Gemini(image){
     const base64 = image.split(",")[1]; 
     try {
      const { geminiKey } = await chrome.storage.local.get("geminiKey");
    if(!geminiKey){
      return {
        success:false,
        error:"API Key Not Found, Go to Settings"
      };
    }
      const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [

              {
                text: "Read this image and ANSWER the question asked in image. Explain step by step. Don't add any * to make the text bold,Capitalize(first letter capital not the whole word) the whole response, If there is no question or You can't recoganize a ques them simply respond: No question Found...Try again, the format of reply should be: first few lines-Only the question that is asked no random text ONLY QUESTION, and answer should be after that, don't include the thinking abouth how u assumed if given text is question or not. WHOLE RESPONSE SHOULD BE FOCUSED ON ANSWERING THE QUESTION ONLY, use uppercase letters for questions only "
              },
              { 
                inlineData: {
                  mimeType: "image/png",
                  data: base64
                }
              }

            ]
          }
        ]

      })
    }
  );
  const data = await response.json();
  if(!response.ok){
     throw new Error(data.error.message);
  }
  return {
  success:true,
  text:data.candidates[0].content.parts[0].text
  };
 } catch(err) {
   return {
      success:false,
      error: err.message
    };
 }
}
  async function GeminiText(image){
     const base64 = image.split(",")[1]; 
     try {
      const { geminiKey } = await chrome.storage.local.get("geminiKey");
    if(!geminiKey){
      return {
        success:false,
        error:"API Key Not Found, Go to Settings"
      };
    }
      const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [

              {
                text: "Read this image and SEND THE TEXT THAT IS WRITTEN ON THE IMAGE AS RESPONSE,NOTHING ELSE, whole response should foucs on extracting text from image no random things on how u did it etc."
              },
              { 
                inlineData: {
                  mimeType: "image/png",
                  data: base64
                }
              }

            ]
          }
        ]

      })
    }
  );
  const data = await response.json();
  if(!response.ok){
     throw new Error(data.error.message);
  }
  return {
  success:true,
  text:data.candidates[0].content.parts[0].text
  };
 } catch(err) {
   return {
      success:false,
      error: err.message
    };
 }
}
  async function resizeImage(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxWidth = 1200;
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      );
      resolve(canvas.toDataURL("image/png"));

    };


    img.src = imageUrl;

  });

}
  const capturefn = async () => {
    setanstextarea("")
    setisscanning(true)
    setplaceholder("Getting Your answer please wait....., this usually takes upto 10 to 15 seconds")
    const image = await chrome.tabs.captureVisibleTab(
    null,
    {
      format: "png"
    }
  );
   const resizedImg = await resizeImage(image)
   const answer = await Gemini(resizedImg);
     if(!answer.success){
     setanstextarea(answer.error + "\n Try Re-entering You Api Key" )
      setisscanning(false)
      return;
     }

     setanstextarea(answer.text)
     setisscanning(false)
  }
const capturefn1 = async () => {
    settextArea("")
    setisscanning(true)
    setPlaceholder("Getting Your Text please wait....., this usually takes upto 10 to 15 seconds")
    const image = await chrome.tabs.captureVisibleTab(
    null,
    {
      format: "png"
    }
  );
   const resizedImg = await resizeImage(image)
   const answer =
     await GeminiText(resizedImg);
     if(!answer.success){
      settextArea(answer.error + "\n Try Re-entering You Api Key" )
      setisscanning(false)
      return;
     }
     settextArea(answer.text)
     setisscanning(false)
  }
  chrome.storage.local.set({
  notes: [
    {
     note: textArea,
    }
  ]
});
  chrome.storage.local.set({
  Ainotes: [
    {
     note: anstextarea,
    }
  ]
});
async function editExistingAiNote() {

  const [fileHandle] = await window.showOpenFilePicker({
    types: [
      {
        description: "Text files",
        accept: {
          "text/plain": [".txt"]
        }
      }
    ]
  });

  const file = await fileHandle.getFile();
  const oldText = await file.text();
 
  const newText =
    oldText +
    "\n--- New Question ---\n" +
    anstextarea;

  const writable = await fileHandle.createWritable();
  await writable.write(newText);
  await writable.close();
  setplaceholder("You answer will be visible here")
  setanstextarea("")
}
  async function exportAiNotes() {
  const data = await chrome.storage.local.get("Ainotes");
  const notes = data.Ainotes || [];
  let text = "";
  notes.forEach((notes, index) => {
    text += `Question:\n${notes.note}\n\n`;
    text += "-------------------\n\n";
  });
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: "ImportanQues.txt",
    types: [
      {
        description: "Text File",

        accept: {
          "text/plain": [".txt"]
        }
      }
    ]

  });
  const writable = await fileHandle.createWritable();
  await writable.write(text);
  await writable.close();
  setplaceholder("You answer will be visible here")
 setanstextarea("")
}
  async function exportNotes() {
  const data = await chrome.storage.local.get("notes");
  const notes = data.notes || [];
  let text = "";
  notes.forEach((notes, index) => {
    text += `NOTE ${index + 1}\n\n`;
    text += `Note:\n${notes.note}\n\n`;
    text += "-------------------\n\n";
  });
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: "SmartNotes.txt",
    types: [
      {
        description: "Text File",

        accept: {
          "text/plain": [".txt"]
        }
      }
    ]

  });

  const writable = await fileHandle.createWritable();
  await writable.write(text);
  await writable.close();
  setPlaceholder("Write something......")
 settextArea("")
}
async function editExistingNote() {
  const [fileHandle] = await window.showOpenFilePicker({
    types: [
      {
        description: "Text files",
        accept: {
          "text/plain": [".txt"]
        }
      }
    ]
  });

  const file = await fileHandle.getFile();
  const oldText = await file.text();
 
  const newText =
    oldText +
    "\n--- New Note ---\n" +
    textArea;

  const writable = await fileHandle.createWritable();
  await writable.write(newText);
  await writable.close();
  setPlaceholder("Write something......")
  settextArea("")
}
  const submitHandler = (elem) => {
    if(elem.target.id === "btn1"){
    editExistingNote();
    }
    else if(elem.target.id === "btn2"){
     exportNotes()
    }
  }
  return (
       <div className=' overflow-y-scroll overflow-x-hidden p-2 bg-linear-to-br from-teal-900 via-cyan-800 to-cyan-700 h-150 w-100'>
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
       <h1 className='text-2xl mt-1.25 ml-1 font-[font1] '>Hi, How are You Today?</h1>
       <div className='flex flex-col justify-center items-center mt-5 w-100 p-3' >
        <button className='bg-cyan-500 border-2 border-cyan-600 hover:cursor-pointer active:scale-95 h-10 w-2/3 rounded-xl font-[font1] text-lg' disabled = {isscanning} onClick={()=>{capturefn()}} >Scan Page</button>
         <textarea value={anstextarea} placeholder= {placeholder} className=' caret-transparent text-xl mt-3 outline-none h-70 w-full'></textarea>
        <h1 className='text-gray-400 capitalize mt-2' >Tip: you can add scanned questions to your important questions folder with its answer  by pressing the buttons below.</h1>
       </div>
       <div className='flex justify-around items-center mt-3 p-2'>
        <button className='bg-cyan-500 border-2 border-cyan-600 hover:cursor-pointer active:scale-95 h-10 w-40 rounded-xl font-[font1] text-lg' onClick={()=>{exportAiNotes()}}  >Add To New File</button>
        <button className='bg-cyan-500 border-2 border-cyan-600 hover:cursor-pointer active:scale-95 h-10 w-40 rounded-xl font-[font1] text-lg' onClick={()=>{editExistingAiNote()}} >Add To Existing File </button>
       </div>
       <div className='flex flex-col items-center justify-between h-60 w-full p-5'>
        <textarea value={textArea} onChange={(elem)=>{
           settextArea(elem.target.value)
        }} placeholder={Placeholder} className=' text-xl outline-none h-full w-full'>
             
        </textarea>
        <div className=' w-full mt-5 flex justify-around items-center'>
            <button id='btn1' className=' text-center bg-cyan-500 border-2 border-cyan-600 hover:cursor-pointer active:scale-95 h-13 w-40 rounded-xl font-[font1] text-[16px]' onClick={(elem)=>{submitHandler(elem)}} >Add To Existing Note</button>
            <button id= 'btn2' className=' text-center bg-cyan-500 border-2 border-cyan-600 hover:cursor-pointer active:scale-95 h-13 w-40 rounded-xl font-[font1] text-[15px]' onClick={(elem)=>{submitHandler(elem)}} >Add To New Note</button>
        </div>
           <button className='bg-cyan-500 border-2 border-cyan-600 hover:cursor-pointer active:scale-95 h-12 mt-3 w-2/3 rounded-xl font-[font1] text-lg' disabled = {isscanning} onClick={()=>{capturefn1()}} >Scan Page</button>
       </div>
    </div>
  )
}
export default Popup