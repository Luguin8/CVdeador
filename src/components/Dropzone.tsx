import React, { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';

export interface FileData {
    path?: string;
    base64?: string;
    mimeType?: string;
}

interface DropzoneProps {
    title: string;
    description: string;
    onDataSelected: (data: FileData) => void;
    extractedText?: string;
    acceptTextOnly?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ title, description, onDataSelected, extractedText, acceptTextOnly }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleNativeDialog = async () => {
        // Si la pantalla de capabilities no está bien, esto fallará aquí.
        const selected = await open({
            multiple: false,
            filters: [{ name: 'Documentos', extensions: acceptTextOnly ? ['pdf', 'txt'] : ['pdf', 'png', 'jpg', 'jpeg'] }]
        });
        if (selected && typeof selected === 'string') {
            onDataSelected({ path: selected });
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const b64 = (reader.result as string).split(',')[1];
                onDataSelected({ base64: b64, mimeType: file.type });
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
        const item = e.clipboardData.items[0];
        if (item && (item.type.includes('image') || item.type.includes('pdf'))) {
            const file = item.getAsFile();
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const b64 = (reader.result as string).split(',')[1];
                    onDataSelected({ base64: b64, mimeType: file.type });
                };
                reader.readAsDataURL(file);
            }
        }
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onPaste={handlePaste}
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all h-full ${isDragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800/60'
                }`}
        >
            <h2 className="text-lg font-bold text-slate-200">{title}</h2>
            <p className="text-xs text-slate-500 mb-4 text-center">{description}</p>

            {extractedText ? (
                <div className="w-full p-3 bg-slate-900/80 rounded border border-slate-700 text-[10px] text-slate-400 font-mono overflow-y-auto max-h-40">
                    {extractedText}
                </div>
            ) : (
                <button onClick={handleNativeDialog} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all">
                    BUSCAR ARCHIVO
                </button>
            )}
        </div>
    );
};