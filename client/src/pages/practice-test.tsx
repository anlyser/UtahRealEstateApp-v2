import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { QuestionWithAnswer, Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AlertCircle, CheckCircle, XCircle, TimerIcon, BrainCircuit } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PracticeTest() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>("all");
  const [isTestStarted, setIsTestStarted] = React.useState(false);
  const [isTestFinished, setIsTestFinished] = React.useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [testQuestions, setTestQuestions] = React.useState<QuestionWithAnswer[]>([]);
  const [testTime, setTestTime] = React.useState(0);
  const [timerInterval, setTimerInterval] = React.useState<NodeJS.Timeout | null>(null);
  const [showResults, setShowResults] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get categories for the filter
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Get questions based on category
  const { data: questions, isLoading } = useQuery<QuestionWithAnswer[]>({
    queryKey: ['/api/questions', selectedCategory],
  });

  // Start the test with a specified number of questions
  const startTest = (numQuestions: number) => {
    if (!questions || questions.length === 0) {
      toast({
        title: "No questions available",
        description: "There are no questions available for this test. Try uploading study materials first.",
        variant: "destructive",
      });
      return;
    }

    if (questions.length < numQuestions) {
      numQuestions = questions.length;
      toast({
        title: "Limited questions available",
        description: `Only ${numQuestions} questions are available for this test.`,
      });
    }

    // Randomly select questions
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, numQuestions);
    
    setTestQuestions(selectedQuestions);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsTestStarted(true);
    setIsTestFinished(false);
    setShowResults(false);
    setTestTime(0);

    // Start timer
    const interval = setInterval(() => {
      setTestTime(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (isTestStarted) {
      // If changing category during test, confirm with user
      if (window.confirm("Changing category will end your current test. Continue?")) {
        endTest();
      } else {
        return;
      }
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (!testQuestions[currentQuestionIndex]) return;
    
    setAnswers({
      ...answers,
      [testQuestions[currentQuestionIndex].id]: answer
    });
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // If it's the last question, show finish dialog
      setShowResults(true);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      setIsTestFinished(true);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // End the test early
  const endTest = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsTestStarted(false);
    setIsTestFinished(false);
    setShowResults(false);
  };

  // Calculate test results
  const calculateResults = () => {
    if (!testQuestions.length) return { correct: 0, incorrect: 0, unanswered: 0, score: 0 };
    
    const results = {
      correct: 0,
      incorrect: 0,
      unanswered: 0,
      score: 0
    };
    
    testQuestions.forEach(question => {
      const userAnswer = answers[question.id];
      if (!userAnswer) {
        results.unanswered++;
      } else if (userAnswer === question.answer.text) {
        results.correct++;
      } else {
        results.incorrect++;
      }
    });
    
    results.score = Math.round((results.correct / testQuestions.length) * 100);
    return results;
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Current question data
  const currentQuestion = testQuestions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const correctAnswer = currentQuestion?.answer.text;
  const isCorrect = currentAnswer === correctAnswer;
  const testResults = calculateResults();

  if (!isTestStarted) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <TopBar 
            title="Practice Test" 
            onMenuClick={() => setSidebarOpen(true)}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
          
          <main className="flex-1 px-4 sm:px-6 py-8 overflow-auto bg-gray-50 mb-16 md:mb-0">
            <div className="max-w-4xl mx-auto">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Practice Test Options</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Select Test Length</h3>
                    <p className="text-gray-600 mb-4">
                      Choose how many questions you want to include in your practice test.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => startTest(10)}
                        disabled={isLoading || !questions || questions.length === 0}
                      >
                        10 Questions
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => startTest(25)}
                        disabled={isLoading || !questions || questions.length === 0}
                      >
                        25 Questions
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => startTest(50)}
                        disabled={isLoading || !questions || questions.length === 0}
                      >
                        50 Questions
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => startTest(100)}
                        disabled={isLoading || !questions || questions.length === 0}
                      >
                        100 Questions
                      </Button>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <p className="text-gray-500">Loading questions...</p>
                  ) : !questions || questions.length === 0 ? (
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        No Questions Available
                      </h4>
                      <p>
                        There are no questions available for the selected category.
                        Please upload study materials or select a different category.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center">
                        <BrainCircuit className="h-5 w-5 mr-2" />
                        Ready to Test Your Knowledge
                      </h4>
                      <p>
                        {questions.length} questions available in the selected category.
                        Select a test length above to begin practicing.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Test Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">About the Utah Real Estate Exam</h4>
                    <p className="text-sm text-gray-600">
                      The Utah real estate exam consists of two portions: a national portion and a state-specific portion.
                      You need to pass both sections to get your license. The exam includes multiple-choice questions
                      covering topics like real property ownership, contracts, financing, and Utah state laws.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Test Tips</h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                      <li>Read each question carefully</li>
                      <li>Look for keywords that may change the meaning of a question</li>
                      <li>Eliminate obviously wrong answers first</li>
                      <li>Don't change your first answer unless you're certain</li>
                      <li>Pace yourself and watch the time</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
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
          title="Practice Test" 
          onMenuClick={() => setSidebarOpen(true)}
          showCategoryFilter={false}
        />
        
        <main className="flex-1 px-4 sm:px-6 py-8 overflow-auto bg-gray-50 mb-16 md:mb-0">
          <div className="max-w-4xl mx-auto">
            {/* Test Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium">
                    Question {currentQuestionIndex + 1} of {testQuestions.length}
                  </span>
                </div>
                <div className="flex items-center">
                  <TimerIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                  <span className="text-sm font-medium">{formatTime(testTime)}</span>
                </div>
              </div>
              <Progress value={(currentQuestionIndex + 1) / testQuestions.length * 100} className="h-2" />
            </div>
            
            {/* Question Card */}
            {currentQuestion && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
                  
                  {currentQuestion.hasImage && currentQuestion.imagePath && (
                    <img 
                      src={currentQuestion.imagePath} 
                      alt="Question reference"
                      className="max-h-40 my-4 mx-auto object-contain"
                    />
                  )}
                  
                  <RadioGroup 
                    value={currentAnswer} 
                    onValueChange={handleAnswerSelect}
                    className="mt-6 space-y-3"
                  >
                    {/* Use predefined options from the question */}
                    {currentQuestion.isMultipleChoice && currentQuestion.options 
                      ? currentQuestion.options.map((option) => (
                          <div key={option.letter} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                            <RadioGroupItem value={option.text} id={`option-${option.letter}`} />
                            <Label htmlFor={`option-${option.letter}`} className="flex-1 cursor-pointer">
                              {option.letter}. {option.text}
                            </Label>
                          </div>
                        ))
                      : null
                    }
                  </RadioGroup>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button 
                    variant="outline" 
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant={currentQuestionIndex === testQuestions.length - 1 ? "default" : "outline"}
                    onClick={nextQuestion}
                  >
                    {currentQuestionIndex === testQuestions.length - 1 ? "Finish Test" : "Next"}
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {/* Test Controls */}
            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                className="text-gray-600" 
                onClick={() => {
                  if (window.confirm("Are you sure you want to end this test? Your progress will be lost.")) {
                    endTest();
                  }
                }}
              >
                End Test
              </Button>
            </div>
          </div>
        </main>
        
        <BottomNavigation />
      </div>
      
      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={(open) => !open && setShowResults(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Test Results</DialogTitle>
            <DialogDescription>
              Your practice test results summary
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center rounded-full w-24 h-24 mb-4 text-2xl font-bold bg-gray-100">
                {testResults.score}%
              </div>
              <h3 className="text-lg font-medium">
                {testResults.score >= 70 ? "You passed!" : "Keep practicing!"}
              </h3>
              <p className="text-sm text-gray-500">
                {formatTime(testTime)} • {testQuestions.length} questions
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  <span>Correct</span>
                </div>
                <span className="font-medium">{testResults.correct}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 mr-2 text-red-500" />
                  <span>Incorrect</span>
                </div>
                <span className="font-medium">{testResults.incorrect}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
                  <span>Unanswered</span>
                </div>
                <span className="font-medium">{testResults.unanswered}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={endTest}>
              Return to Test Options
            </Button>
            <Button onClick={() => {
              setShowResults(false);
              startTest(testQuestions.length);
            }}>
              Retry Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// This function was removed as we now use the predefined options from the questions
