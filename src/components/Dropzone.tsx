import React, { useState, useCallback } from 'react';
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

export const Dropzone: React.FC<DropzoneProps> = ({
    title,
    description,
    onDataSelected,
    extractedText,
    acceptTextOnly
}) => {
    const [isDragging, setIsDragging] = useState(false);

    // 1. Selector Nativo de Tauri
    const handleNativeDialog = async () => {
        try {
            const selectedPath = await open({
                multiple: false,
                filters: [{
                    name: 'Archivos',
                    extensions: acceptTextOnly ? ['pdf', 'txt'] : ['pdf', 'png', 'jpg', 'jpeg', 'txt']
                }]
            });
            if (selectedPath && typeof selectedPath === 'string') {
                onDataSelected({ path: selectedPath });
            }
        } catch (err) {
            console.error("Error abriendo diálogo:", err);
        }
    };

    // Helper para convertir Blob a Base64 en el navegador
    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // Quitar el prefijo "data:image/png;base64," para mandarlo limpio a Rust
                resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // 2. Manejo de Drag & Drop (Archivos web)
    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            const base64 = await blobToBase64(file);
            onDataSelected({ base64, mimeType: file.type });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    // 3. Manejo del Portapapeles (Ctrl+V)
    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1 || items[i].type === 'application/pdf') {
                const file = items[i].getAsFile();
                if (file) {
                    const base64 = await blobToBase64(file);
                    onDataSelected({ base64, mimeType: file.type });
                    break; // Tomamos solo el primer archivo pegado
                }
            }
        }
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onPaste={handlePaste}
            tabIndex={0} // Permite que el div reciba el foco para el Ctrl+V
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all outline-none focus:ring-2 focus:ring-indigo-500/50 group ${isDragging
                    ? 'border-indigo-400 bg-indigo-500/10'
                    : 'border-slate-600 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500'
                }`}
        >
            <h2 className="text-xl font-bold text-slate-200 mb-2">{title}</h2>
            <p className="text-sm text-slate-400 text-center mb-4">
                {description} <br /> <span className="text-xs opacity-75">(Soporta arrastrar y pegar)</span>
            </p>

            {extractedText ? (
                <div className="w-full mt-4 p-3 bg-slate-900 rounded border border-slate-700 text-xs text-slate-300 max-h-32 overflow-y-auto">
                    {extractedText}
                </div>
            ) : (
                <button
                    onClick={handleNativeDialog}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                    Explorar Archivos
                </button>
            )}
        </div>
    );
};