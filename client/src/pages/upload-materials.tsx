import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/ui/file-upload";
import { PdfViewer } from "@/components/ui/pdf-viewer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";

export default function UploadMaterials() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [autoCategories, setAutoCategories] = React.useState(true);
  const [extractExplanations, setExtractExplanations] = React.useState(true);
  const [previewFile, setPreviewFile] = React.useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get previous uploads
  const { data: uploads, isLoading, refetch } = useQuery<Upload[]>({
    queryKey: ['/api/uploads'],
  });

  // Upload mutation
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
      queryClient.invalidateQueries({ queryKey: ['/api/uploads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
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
  
  // Google Drive download mutation
  const driveDownloadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/drive-download");
    },
    onSuccess: () => {
      toast({
        title: "Download initiated",
        description: "Files are being downloaded from the shared folder. This may take a few minutes.",
      });
      
      // Set a timeout to refresh the uploads list after a delay
      setTimeout(() => {
        refetch();
        queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      }, 5000);
    },
    onError: (error) => {
      toast({
        title: "Download failed",
        description: error.message || "Failed to download files from Google Drive. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);

    // If it's a PDF and we have only one file, set it as preview
    if (selectedFiles.length === 1 && selectedFiles[0].type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewFile(e.target.result as string);
        }
      };
      reader.readAsArrayBuffer(selectedFiles[0]);
    } else {
      setPreviewFile(null);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    if (newFiles.length === 0) {
      setPreviewFile(null);
    }
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
    } catch (error) {
      toast({
        title: "Upload error",
        description: "There was an error preparing your files for upload.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopBar 
          title="Upload Study Materials" 
          onMenuClick={() => setSidebarOpen(true)}
          showCategoryFilter={false}
        />
        
        <main className="flex-1 px-4 sm:px-6 py-8 overflow-auto bg-gray-50 mb-16 md:mb-0">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Files</TabsTrigger>
                <TabsTrigger value="history">Upload History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload">
                {/* Notice about automatic Drive materials */}
                <Card className="mb-6 border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-green-800">Study Materials Auto-Loaded</CardTitle>
                    <CardDescription className="text-green-700">
                      Utah real estate exam study materials from the shared Google Drive folder are automatically downloaded and processed.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-700">
                      Questions and flash cards are ready to use. Check the Flashcards or Practice Test sections to start studying!
                    </p>
                  </CardContent>
                </Card>
                
                {/* Manual Upload Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Study Materials</CardTitle>
                    <CardDescription>
                      Upload PDF files or images containing Utah real estate exam questions and answers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <FileUpload
                          onFilesSelected={handleFilesSelected}
                          selectedFiles={files}
                          onRemoveFile={handleRemoveFile}
                          acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
                          maxFiles={5}
                          maxSizeMB={10}
                          buttonLabel="Select Files"
                        />
                        
                        <div className="mt-6 space-y-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Processing Options:</p>
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
                          
                          <Button 
                            onClick={handleUpload}
                            disabled={files.length === 0 || uploadMutation.isPending}
                            className="w-full"
                          >
                            {uploadMutation.isPending ? "Uploading..." : "Upload Files"}
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        {previewFile ? (
                          <div className="h-full">
                            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                            <PdfViewer file={previewFile} className="h-[400px]" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg border border-dashed border-gray-300 p-6">
                            <div className="text-center">
                              <p className="text-gray-500">
                                {files.length > 0 
                                  ? "PDF preview is available for single PDF files only" 
                                  : "Select files to upload"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-4 bg-yellow-50 text-yellow-800">
                      <h4 className="text-sm font-medium mb-2">Processing Information</h4>
                      <ul className="text-xs space-y-1 list-disc pl-4">
                        <li>PDF files will be analyzed to extract questions and answers</li>
                        <li>Image files should contain clear text for accurate extraction</li>
                        <li>Processing may take a few minutes depending on file size</li>
                        <li>Questions will be automatically categorized based on content</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload History</CardTitle>
                    <CardDescription>
                      View your previously uploaded study materials.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p className="text-center py-4 text-gray-500">Loading uploads...</p>
                    ) : !uploads || uploads.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No uploads found</p>
                        <Button variant="outline" onClick={() => document.querySelector('[data-value="upload"]')?.click()}>
                          Upload New Files
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {uploads.map((upload) => (
                          <div key={upload.id} className="flex justify-between items-center p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{upload.filename}</p>
                              <p className="text-sm text-gray-500">
                                Uploaded on {new Date(upload.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                upload.processed 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {upload.processed ? "Processed" : "Processing"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <BottomNavigation />
      </div>
    </div>
  );
}
