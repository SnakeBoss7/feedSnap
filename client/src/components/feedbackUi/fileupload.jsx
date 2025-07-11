import { useDropzone } from "react-dropzone";
import { useCallback, useEffect, useState } from "react";
import { UploadCloud } from "lucide-react";

export const FileUploadBox = ({onFileAccepted})=>
    {
const onDrop = useCallback((acceptedFiles)=>
    {
        if(acceptedFiles.length)
            {
                onFileAccepted(acceptedFiles[0]);
            }
    },[onFileAccepted])

    const { getInputProps, getRootProps, isDragActive } = useDropzone({
      onDrop,
    });
        return (
          <div
            {...getRootProps()}
            className="w-full border-2 h-[100px] flex flex-col  justify-center items-center rounded-lg border-dashed border-gray-500 hover:border-blue-500"
          >
            <UploadCloud />
 
            <input {...getInputProps()}  />
            <div>{isDragActive ? "Upload here" : "Drop the bug image her (if any)"}</div>
          </div>
        );
    }