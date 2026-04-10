'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import Image from 'next/image';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "Ảnh sản phẩm" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    
    if (file.size > 5 * 1024 * 1024) {
      alert("Dung lượng ảnh tối đa là 5MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await apiFetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      onChange(result.url);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi khi upload ảnh";
      alert(errorMessage);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</label>
      
      <div className="relative group">
        {value ? (
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
            <Image 
              src={value} 
              alt="Preview" 
              fill
              className="object-contain"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="text-indigo-600 animate-spin" size={32} />
                <span className="text-xs font-bold text-indigo-600">Đang tải lên...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-indigo-500">
                <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:shadow-indigo-100 transition-all">
                  <Upload size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Chọn hoặc kéo thả ảnh</span>
              </div>
            )}
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
