import { File, FileText, Image, Video, Music, Download } from 'lucide-react';

const FilePreview = ({ file, onRemove, url }) => {
    const isImage = file?.type?.startsWith('image/');
    const isVideo = file?.type?.startsWith('video/');
    const isAudio = file?.type?.startsWith('audio/');
    const isPDF = file?.type === 'application/pdf';

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = () => {
        if (isImage) return <Image size={40} className="text-blue-500" />;
        if (isVideo) return <Video size={40} className="text-purple-500" />;
        if (isAudio) return <Music size={40} className="text-green-500" />;
        if (isPDF) return <FileText size={40} className="text-red-500" />;
        return <File size={40} className="text-gray-500" />;
    };

    // Preview mode (showing uploaded file in message)
    if (url && !onRemove) {
        return (
            <div className="mt-2 max-w-xs">
                {isImage ? (
                    <img
                        src={`https://chat-app-backend-a017.onrender.com${url}`}
                        alt="attachment"
                        className="rounded-lg max-h-64 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(`https://chat-app-backend-a017.onrender.com${url}`, '_blank')}
                    />
                ) : (
                    <a
                        href={`https://chat-app-backend-a017.onrender.com${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        {getFileIcon()}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {url.split('/').pop()}
                            </p>
                        </div>
                        <Download size={20} className="text-gray-400" />
                    </a>
                )}
            </div>
        );
    }

    // Upload preview mode (before sending)
    return (
        <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
            {isImage && file ? (
                <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-16 h-16 rounded object-cover"
                />
            ) : (
                getFileIcon()
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{file?.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(file?.size || 0)}</p>
            </div>
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                >
                    ×
                </button>
            )}
        </div>
    );
};

export default FilePreview;
