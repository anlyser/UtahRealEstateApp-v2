import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { QuestionWithAnswer } from "@shared/schema";
import { BookmarkIcon, Trash2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function SavedQuestions() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Get saved questions
  const { data: savedQuestions, isLoading, error } = useQuery<QuestionWithAnswer[]>({
    queryKey: ['/api/saved-questions/details'],
  });

  // Unsave question mutation
  const unsaveQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      return apiRequest("DELETE", `/api/saved-questions/${questionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-questions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-questions/details'] });
      toast({
        title: "Question removed",
        description: "This question has been removed from your saved items.",
      });
    },
  });

  // Start flash cards with saved questions
  const handleStudySaved = () => {
    setLocation("/flash-cards?saved=true");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopBar 
          title="Saved Questions" 
          onMenuClick={() => setSidebarOpen(true)}
          showCategoryFilter={false}
        />
        
        <main className="flex-1 px-4 sm:px-6 py-8 overflow-auto bg-gray-50 mb-16 md:mb-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Saved for Review</h1>
              {savedQuestions && savedQuestions.length > 0 && (
                <Button onClick={handleStudySaved}>
                  Study Saved Questions
                </Button>
              )}
            </div>
            
            {isLoading ? (
              <p className="text-center py-8 text-gray-500">Loading saved questions...</p>
            ) : error ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-red-500 text-center">Error loading saved questions. Please try again.</p>
                </CardContent>
              </Card>
            ) : !savedQuestions || savedQuestions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Saved Questions</h2>
                  <p className="text-gray-500 mb-6">
                    Questions you save while studying will appear here for easy review.
                  </p>
                  <Button onClick={() => setLocation("/flash-cards")}>
                    Start Studying
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {savedQuestions.map((question) => (
                  <Card key={question.id} className="overflow-hidden">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <Badge className="mb-2 bg-primary-100 text-primary-800 hover:bg-primary-100">
                          {question.category?.name || "General"}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => unsaveQuestionMutation.mutate(question.id)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                      <h3 className="font-medium mb-3">{question.text}</h3>
                      
                      {question.hasImage && question.imagePath && (
                        <img 
                          src={question.imagePath} 
                          alt="Question reference"
                          className="max-h-40 my-3 object-contain"
                        />
                      )}
                      
                      <div className="mt-4 bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500 mb-1">Answer:</p>
                        <p className="font-medium">{question.answer.text}</p>
                        
                        {question.answer.explanation && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            {question.answer.explanation}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 border-t px-6 py-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto text-primary-600"
                        onClick={() => setLocation(`/flash-cards?question=${question.id}`)}
                      >
                        Study This Question
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        
        <BottomNavigation />
      </div>
    </div>
  );
}
