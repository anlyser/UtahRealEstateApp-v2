import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileIcon, UploadIcon, XIcon } from "lucide-react";

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
  buttonLabel?: string;
  selectedFiles?: File[];
  onRemoveFile?: (index: number) => void;
}

export function FileUpload({
  onFilesSelected,
  acceptedFileTypes = ".pdf,.jpg,.jpeg,.png",
  maxFiles = 10,
  maxSizeMB = 10,
  className,
  buttonLabel = "Upload Files",
  selectedFiles = [],
  onRemoveFile,
  ...props
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropAreaRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const filesArray = Array.from(files);
    const validFiles = filesArray.filter(file => {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        return false;
      }
      
      // Check file type based on extension if acceptedFileTypes is provided
      if (acceptedFileTypes) {
        const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
        return acceptedFileTypes.includes(fileExtension);
      }
      
      return true;
    }).slice(0, maxFiles);
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        ref={dropAreaRef}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadIcon className="h-10 w-10 text-gray-400" />
          <p className="text-sm text-gray-500">
            Drag files here or click to browse
          </p>
          <p className="text-xs text-gray-400">
            Supports {acceptedFileTypes.split(",").join(", ")}
          </p>
          <p className="text-xs text-gray-400">
            Max file size: {maxSizeMB} MB
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={acceptedFileTypes}
        multiple={maxFiles > 1}
        onChange={(e) => handleFileSelect(e.target.files)}
        {...props}
      />

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Selected Files:</p>
          <ul className="space-y-2 max-h-48 overflow-auto rounded-md border p-2">
            {selectedFiles.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                {onRemoveFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(index);
                    }}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button 
        type="button" 
        onClick={triggerFileInput}
        className="w-full md:w-auto"
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
