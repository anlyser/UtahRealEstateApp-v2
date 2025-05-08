import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [files, setFiles] = React.useState<File[]>([]);
  const [autoCategories, setAutoCategories] = React.useState(true);
  const [extractExplanations, setExtractExplanations] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/uploads", formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Your files have been uploaded and are being processed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      onClose();
      setFiles([]);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your files.",
        variant: "destructive",
      });
    },
  });

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      formData.append('options', JSON.stringify({
        autoCategories,
        extractExplanations,
      }));
      
      uploadMutation.mutate(formData);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Study Materials</DialogTitle>
          <DialogDescription>
            Upload PDF files or images containing Utah real estate exam questions and answers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            selectedFiles={files}
            onRemoveFile={handleRemoveFile}
            acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
            maxFiles={5}
            maxSizeMB={10}
          />
          
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Processing Options:</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="auto-categorize" 
                  checked={autoCategories}
                  onCheckedChange={(checked) => setAutoCategories(checked as boolean)}
                />
                <Label htmlFor="auto-categorize">Auto-categorize questions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="extract-explanations" 
                  checked={extractExplanations}
                  onCheckedChange={(checked) => setExtractExplanations(checked as boolean)}
                />
                <Label htmlFor="extract-explanations">Extract explanations when available</Label>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload Files"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
