import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, RefreshCcw, Database, ClipboardCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [autoFlip, setAutoFlip] = React.useState(false);
  const [flipDelay, setFlipDelay] = React.useState(5);
  const [defaultCategory, setDefaultCategory] = React.useState("all");
  const [showResetDialog, setShowResetDialog] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get device ID from local storage
  const deviceId = localStorage.getItem('deviceId') || 'Not set';

  // Load saved settings from localStorage on component mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setAutoFlip(parsedSettings.autoFlip || false);
      setFlipDelay(parsedSettings.flipDelay || 5);
      setDefaultCategory(parsedSettings.defaultCategory || "all");
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      autoFlip,
      flipDelay,
      defaultCategory
    };
    localStorage.setItem('app_settings', JSON.stringify(settings));
    
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
  };

  // Reset all user progress
  const resetUserProgress = async () => {
    try {
      // Reset progress in database via API
      const response = await fetch('/api/progress/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deviceId })
      });

      if (!response.ok) {
        throw new Error('Failed to reset progress');
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-questions'] });
      
      // Close dialog and show success message
      setShowResetDialog(false);
      toast({
        title: "Progress reset",
        description: "All your progress has been reset successfully.",
      });
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast({
        title: "Error",
        description: "Failed to reset progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate a new device ID
  const regenerateDeviceId = () => {
    const newDeviceId = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
    localStorage.setItem('deviceId', newDeviceId);
    
    toast({
      title: "Device ID reset",
      description: "A new device ID has been generated. Your progress has been reset.",
    });
    
    // Reload the page to ensure all queries are reset
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopBar 
          title="Settings" 
          onMenuClick={() => setSidebarOpen(true)}
          showCategoryFilter={false}
        />
        
        <main className="flex-1 px-4 sm:px-6 py-8 overflow-auto bg-gray-50 mb-16 md:mb-0">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Application Settings</h1>
            
            {/* Study Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Study Settings</CardTitle>
                <CardDescription>
                  Configure your flashcard and study preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-flip">Auto-flip cards</Label>
                    <p className="text-sm text-gray-500">
                      Automatically flip cards after a delay
                    </p>
                  </div>
                  <Switch 
                    id="auto-flip" 
                    checked={autoFlip}
                    onCheckedChange={setAutoFlip}
                  />
                </div>
                
                {autoFlip && (
                  <div className="space-y-2">
                    <Label>Flip delay (seconds): {flipDelay}</Label>
                    <Slider 
                      value={[flipDelay]} 
                      min={1} 
                      max={10} 
                      step={1} 
                      onValueChange={(value) => setFlipDelay(value[0])}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="default-category">Default Category</Label>
                  <Select 
                    value={defaultCategory} 
                    onValueChange={setDefaultCategory}
                  >
                    <SelectTrigger id="default-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="1">Utah State Law</SelectItem>
                      <SelectItem value="2">Federal Regulations</SelectItem>
                      <SelectItem value="3">Contracts</SelectItem>
                      <SelectItem value="4">Property Ownership</SelectItem>
                      <SelectItem value="5">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings}>Save Settings</Button>
              </CardFooter>
            </Card>
            
            {/* Data Management */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Manage your study data and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="font-medium">Device ID</Label>
                    <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{deviceId.slice(0, 12)}...</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Your device ID is used to track your study progress without requiring login.
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowResetDialog(true)}
                    >
                      <Database className="mr-2 h-4 w-4" />
                      Reset All Progress
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={regenerateDeviceId}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Generate New Device ID
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>
                  Utah Real Estate Exam Preparation App
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  This application is designed to help you prepare for the Utah real estate exam.
                  Upload your study materials, create flashcards, and track your progress.
                </p>
                
                <div className="rounded-lg border p-4 bg-blue-50 text-blue-800">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <ClipboardCheck className="h-5 w-5 mr-2" />
                    Exam Preparation Tips
                  </h4>
                  <ul className="text-xs space-y-1 list-disc pl-4">
                    <li>Study consistently, rather than cramming</li>
                    <li>Focus on understanding concepts, not just memorizing</li>
                    <li>Take regular practice tests to simulate exam conditions</li>
                    <li>Review your weak areas identified by the app</li>
                    <li>Get plenty of rest before your actual exam</li>
                  </ul>
                </div>
                
                <p className="text-xs text-gray-500 pt-2">
                  Version 1.0.0
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <BottomNavigation />
      </div>
      
      {/* Reset Progress Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Progress</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset all your progress? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-3">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <p className="text-sm text-amber-700">
              This will remove all your saved questions and progress history.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={resetUserProgress}>
              Reset Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
