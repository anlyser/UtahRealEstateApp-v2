import * as React from "react";
import { useLocation, useSearch } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { FlashCard } from "@/components/cards/flash-card";
import { MultipleChoiceCard } from "@/components/cards/multiple-choice-card";
import { CardControls } from "@/components/cards/card-controls";
import { AnswerFeedback } from "@/components/cards/answer-feedback";
import { CardNavigation } from "@/components/cards/card-navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QuestionWithAnswer } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function FlashCards() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const categoryParam = params.get("category");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(categoryParam);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // When categoryParam changes from URL, update the state
  React.useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Get questions based on category filter
  const { data: questions, isLoading, error } = useQuery<QuestionWithAnswer[]>({
    queryKey: ['/api/questions', selectedCategory],
  });

  // Get saved questions for the current user
  const { data: savedQuestions } = useQuery<number[]>({
    queryKey: ['/api/saved-questions'],
  });

  // Update user progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (data: { questionId: number; status: "correct" | "incorrect" | "review" }) => {
      return apiRequest("POST", "/api/progress", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    },
  });

  // Save question mutation
  const saveQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      return apiRequest("POST", "/api/saved-questions", { questionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-questions'] });
      toast({
        title: "Question saved",
        description: "This question has been added to your saved items.",
      });
    },
  });

  // Unsave question mutation
  const unsaveQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      return apiRequest("DELETE", `/api/saved-questions/${questionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-questions'] });
      toast({
        title: "Question removed",
        description: "This question has been removed from your saved items.",
      });
    },
  });

  const currentQuestion = questions?.[currentIndex];
  const isCurrentQuestionSaved = currentQuestion ? 
    savedQuestions?.includes(currentQuestion.id) : false;

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === "all") {
      setLocation("/flash-cards");
    } else {
      setLocation(`/flash-cards?category=${categoryId}`);
    }
    setSelectedCategory(categoryId);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (questions && currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion) return;
    
    if (isCurrentQuestionSaved) {
      unsaveQuestionMutation.mutate(currentQuestion.id);
    } else {
      saveQuestionMutation.mutate(currentQuestion.id);
    }
  };

  const handleShuffleQuestions = () => {
    if (!questions || questions.length <= 1) return;
    
    // Fisher-Yates shuffle algorithm
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Replace the cached data with shuffled data
    queryClient.setQueryData(['/api/questions', selectedCategory], shuffled);
    
    // Reset to first card
    setCurrentIndex(0);
    setIsFlipped(false);
    
    toast({
      title: "Questions shuffled",
      description: "The questions have been randomly reordered.",
    });
  };

  const handleFeedback = (status: "correct" | "incorrect" | "review") => {
    if (!currentQuestion) return;
    
    updateProgressMutation.mutate({
      questionId: currentQuestion.id,
      status,
    });
    
    // Auto-advance to next question after feedback
    if (questions && currentIndex < questions.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 500);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <TopBar 
            title="Flash Cards" 
            onMenuClick={() => setSidebarOpen(true)} 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
          
          <main className="flex-1 px-4 sm:px-6 py-8 overflow-auto bg-gray-50 flex items-center justify-center mb-16 md:mb-0">
            <div className="text-center">
              <p className="text-lg text-gray-500">Loading questions...</p>
            </div>
          </main>
          
          <BottomNavigation />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <TopBar 
            title="Flash Cards" 
            onMenuClick={() => setSidebarOpen(true)} 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
          
          <main className="flex-1 px-4 sm:px-6 py-8 overflow-auto bg-gray-50 flex items-center justify-center mb-16 md:mb-0">
            <div className="text-center">
              <p className="text-lg text-red-500">Error loading questions. Please try again.</p>
            </div>
          </main>
          
          <BottomNavigation />
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <TopBar 
            title="Flash Cards" 
            onMenuClick={() => setSidebarOpen(true)} 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
          
          <main className="flex-1 px-4 sm:px-6 py-8 overflow-auto bg-gray-50 flex flex-col items-center justify-center mb-16 md:mb-0">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-xl font-semibold mb-4">No Questions Available</h2>
              <p className="text-gray-600 mb-8">
                {selectedCategory && selectedCategory !== "all" 
                  ? "There are no questions in this category yet." 
                  : "There are no questions available. Start by uploading study materials."}
              </p>
              <button 
                onClick={() => setLocation("/upload-materials")}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Upload Study Materials
              </button>
            </div>
          </main>
          
          <BottomNavigation />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopBar 
          title="Flash Cards" 
          onMenuClick={() => setSidebarOpen(true)} 
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <main className="flex-1 px-4 sm:px-6 py-8 overflow-auto bg-gray-50 mb-16 md:mb-0">
          {/* Flash Card Controls */}
          <CardControls 
            currentQuestionIndex={currentIndex + 1}
            totalQuestions={questions.length}
            onSave={handleSaveQuestion}
            onShuffle={handleShuffleQuestions}
            isSaved={isCurrentQuestionSaved}
          />
          
          {/* Either Regular Flash Card or Multiple Choice Card */}
          {currentQuestion ? (
            currentQuestion.isMultipleChoice ? (
              <MultipleChoiceCard 
                question={currentQuestion}
                className="max-w-2xl mx-auto"
              />
            ) : (
              <FlashCard 
                question={currentQuestion}
                isFlipped={isFlipped}
                onFlip={handleFlipCard}
                className="max-w-2xl mx-auto h-80 sm:h-96"
              />
            )
          ) : (
            <div className="max-w-2xl mx-auto h-80 flex items-center justify-center">
              <p className="text-gray-500">Loading question...</p>
            </div>
          )}
          
          {/* Answer Feedback Buttons - Only show for regular flash cards */}
          {currentQuestion && !currentQuestion.isMultipleChoice && (
            <AnswerFeedback 
              onIncorrect={() => handleFeedback("incorrect")}
              onReview={() => handleFeedback("review")}
              onCorrect={() => handleFeedback("correct")}
              disabled={!isFlipped} // Only enable feedback when answer is shown
            />
          )}
          
          {/* Navigation Buttons */}
          <CardNavigation 
            onPrevious={handlePrevious}
            onNext={handleNext}
            canGoPrevious={currentIndex > 0}
            canGoNext={currentIndex < questions.length - 1}
          />
        </main>
        
        <BottomNavigation />
      </div>
    </div>
  );
}
