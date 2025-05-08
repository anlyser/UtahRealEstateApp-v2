import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import FlashCards from "@/pages/flash-cards";
import UploadMaterials from "@/pages/upload-materials";
import SavedQuestions from "@/pages/saved-questions";
import PracticeTest from "@/pages/practice-test";
import Settings from "@/pages/settings";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      {/* Main pages */}
      <Route path="/" component={Dashboard} />
      <Route path="/flash-cards" component={FlashCards} />
      <Route path="/practice-test" component={PracticeTest} />
      <Route path="/saved-questions" component={SavedQuestions} />
      <Route path="/upload-materials" component={UploadMaterials} />
      <Route path="/settings" component={Settings} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Generate and store a unique device ID for tracking progress
  useEffect(() => {
    // Check if device ID already exists
    if (!localStorage.getItem('deviceId')) {
      // Generate a random device ID
      const deviceId = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
      localStorage.setItem('deviceId', deviceId);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
