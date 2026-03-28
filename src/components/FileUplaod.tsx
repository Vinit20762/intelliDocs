"use client";
import { uploadToS3 } from '@/lib/s3';
import { useMutation } from '@tanstack/react-query';
import { Inbox, Loader2, Lock } from 'lucide-react';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import axios from "axios";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import UpgradeModal from './UpgradeModal';

const FREE_PDF_LIMIT = 3;

type Props = {
  chatCount: number
}

const FileUplaod = ({ chatCount }: Props) => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const isAtLimit = chatCount >= FREE_PDF_LIMIT;

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ file_key, file_name }: { file_key: string; file_name: string }) => {
      const response = await axios.post('/api/create-chat', { file_key, file_name });
      return response.data;
    }
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isAtLimit,
    onDrop: async (acceptedFiles) => {
      if (isAtLimit) { setModalOpen(true); return; }
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large, should be under 10 MB");
        return;
      }
      try {
        setUploading(true);
        const data = await uploadToS3(file);
        if (!data?.file_key || !data.file_name) {
          toast.error("Something went wrong!");
          return;
        }
        mutate(data, {
          onSuccess: ({ chat_id }) => {
            toast.success("Chat created");
            router.push(`/chat/${chat_id}`);
          },
          onError: (err: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((err as any)?.response?.status === 403) {
              setModalOpen(true);
            } else {
              toast.error("Error creating chat");
            }
            console.error(err);
          }
        });
      } catch (error) {
        console.log(error);
      } finally {
        setUploading(false);
      }
    }
  });

  return (
    <>
      <UpgradeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} reason="pdf_limit" />

      <div className="p-2 bg-white rounded-xl shadow">

        {/* Usage counter */}
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-xs text-gray-400">PDFs used</span>
          <span className={`text-xs font-semibold ${isAtLimit ? 'text-red-500' : 'text-gray-600'}`}>
            {chatCount} / {FREE_PDF_LIMIT}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-100 rounded-full mb-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isAtLimit ? 'bg-red-400' : 'bg-blue-500'}`}
            style={{ width: `${Math.min((chatCount / FREE_PDF_LIMIT) * 100, 100)}%` }}
          />
        </div>

        {isAtLimit ? (
          <button
            onClick={() => setModalOpen(true)}
            className="w-full flex flex-col justify-center items-center border-dashed border-2 border-red-200 rounded-xl bg-red-50 py-8 gap-2 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <Lock className="w-8 h-8 text-red-400" />
            <p className="text-sm font-medium text-red-500">PDF limit reached</p>
            <p className="text-xs text-red-400">Upgrade to Pro for unlimited uploads</p>
          </button>
        ) : (
          <div {...getRootProps({
            className: 'flex flex-col justify-center items-center border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 hover:bg-gray-100 transition-colors'
          })}>
            <input {...getInputProps()} />
            {(uploading || isPending) ? (
              <>
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="mt-2 text-sm text-slate-400">Spilling Tea to GPT...</p>
              </>
            ) : (
              <>
                <Inbox className="w-10 h-10 text-blue-500" />
                <p className="mt-2 text-sm text-slate-400">Drop your PDF here</p>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default FileUplaod;
