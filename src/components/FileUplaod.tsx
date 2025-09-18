"use client";
import { uploadToS3 } from '@/lib/s3';
import { Inbox } from 'lucide-react';
import react from 'react';
import { useDropzone } from 'react-dropzone';

const FileUplaod = ( ) => {
    const {getRootProps, getInputProps} = useDropzone({
        accept: {'application/pdf': ['.pdf']},
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            console.log(acceptedFiles);
            const file = acceptedFiles[0]
            if (file.size > 10 * 1024 *1024){
                alert('Please upload a smaller file i.e., >10mb')
                return
            }
            try {
                const data = await uploadToS3(file);
                console.log("data", data);
            } catch (error) {
                console.log(error);
            }
           
        }
        
    })  //object destructuring, google it for more info
  return (
    <div className='p-2 bg-white rounded-xl shadow'>
        <div {...getRootProps({
            className: 'flex flex-col justify-center items-center border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8'
        })}>
            <input {...getInputProps()} />
            <>
            <Inbox className='w-10 h-10 text-blue-500 flex justify-center item-center  '/>
            <p className='mt-2 text-sm text-slate-400'>Drop your PDF here</p>
            </>
        </div>
    </div>
  )
}

export default FileUplaod

// npm install react-dropzone => it provides the file uploading and droping utility 