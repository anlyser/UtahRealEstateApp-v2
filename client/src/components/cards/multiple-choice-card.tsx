import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";
import { QuestionWithAnswer } from "@shared/schema";

interface MultipleChoiceCardProps {
  question: QuestionWithAnswer;
  className?: string;
}

export function MultipleChoiceCard({ question, className }: MultipleChoiceCardProps) {
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ isCorrect: boolean; message: string } | null>(null);

  // Reset state when question changes
  React.useEffect(() => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setFeedback(null);
  }, [question.id]);
  
  // Get formatted options for the multiple choice question
  const options = React.useMemo(() => {
    // Check if we have options in the right format (array of {letter, text} objects)
    if (question.options && Array.isArray(question.options) && question.options.length >= 2) {
      // Return the options with their text property
      return question.options.map(opt => ({ 
        letter: opt.letter || '', 
        text: opt.text || '' 
      }));
    }
    
    // Fallback: Create better default options based on the correct answer
    const correctAnswer = question.answer.text;
    const defaultOptions = [
      { letter: 'A', text: correctAnswer },
    ];
    
    // For numeric answers
    if (correctAnswer.match(/\d+/)) {
      const numMatch = correctAnswer.match(/\d+/);
      if (numMatch) {
        const num = parseInt(numMatch[0], 10);
        // Create variations around the number
        defaultOptions.push({ 
          letter: 'B', 
          text: correctAnswer.replace(numMatch[0], (num - 2).toString()) 
        });
        defaultOptions.push({ 
          letter: 'C', 
          text: correctAnswer.replace(numMatch[0], (num + 2).toString()) 
        });
        defaultOptions.push({ 
          letter: 'D', 
          text: correctAnswer.replace(numMatch[0], (num * 2).toString()) 
        });
      } else {
        // Fallback if we can't extract numbers
        defaultOptions.push({ letter: 'B', text: "A different option" });
        defaultOptions.push({ letter: 'C', text: "Another choice" });
        defaultOptions.push({ letter: 'D', text: "Yet another possibility" });
      }
    } else {
      // For text answers create realistic-sounding alternatives
      defaultOptions.push({ letter: 'B', text: "A similar but incorrect option" });
      defaultOptions.push({ letter: 'C', text: "A common misconception" });
      defaultOptions.push({ letter: 'D', text: "A plausible alternative" });
    }
    
    // Randomize the options order except the first one which is the correct answer
    return defaultOptions.sort(() => Math.random() - 0.5);
  }, [question.answer.text, question.options, question.id]);
  
  const handleOptionSelect = (value: string) => {
    if (!isSubmitted) {
      setSelectedOption(value);
    }
  };
  
  // Find the correct answer option
  const correctOption = React.useMemo(() => {
    // If the answer exactly matches an option text, use that
    const matchingOption = options.find(opt => opt.text === question.answer.text);
    if (matchingOption) return matchingOption;
    
    // Otherwise, see if any option contains the answer text
    const containingOption = options.find(opt => 
      opt.text.includes(question.answer.text) || question.answer.text.includes(opt.text));
    
    return containingOption || options[0]; // Default to first option if no match
  }, [options, question.answer.text]);
  
  const handleSubmit = () => {
    if (!selectedOption) return;
    
    setIsSubmitted(true);
    
    // Check if selected option matches the correct one
    const selectedOptionObj = options.find(opt => opt.text === selectedOption);
    const isCorrect = selectedOptionObj?.text === correctOption.text;
    
    if (isCorrect) {
      setFeedback({
        isCorrect: true,
        message: "Correct! " + (question.answer.explanation || "")
      });
    } else {
      setFeedback({
        isCorrect: false,
        message: "Incorrect. " + (question.answer.explanation || "")
      });
    }
  };
  
  const handleReset = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setFeedback(null);
  };
  
  return (
    <Card className={cn("shadow-md p-6 flex flex-col", className)}>
      <Badge 
        variant="outline"
        className="category-badge bg-primary-100 text-primary-800 hover:bg-primary-100 self-start"
      >
        {question.category?.name || "General"}
      </Badge>
      
      <div className="flex-1 w-full mt-4">
        <div className="text-left">
          <h3 className="text-lg sm:text-xl font-medium mb-4">
            {question.text}
          </h3>
          
          {/* Image (if applicable) */}
          {question.hasImage && question.imagePath && (
            <img 
              src={question.imagePath} 
              alt="Question reference"
              className="mx-auto max-h-40 my-4 object-contain"
            />
          )}
          
          {/* Multiple choice options */}
          <RadioGroup
            value={selectedOption || ""}
            className="mt-6 space-y-4"
            onValueChange={handleOptionSelect}
          >
            {options.map((option, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex items-center space-x-2 p-3 rounded-md border", 
                  {
                    "border-primary bg-primary-50": selectedOption === option.text && !isSubmitted,
                    "border-green-500 bg-green-50": isSubmitted && option.text === correctOption.text,
                    "border-red-500 bg-red-50": isSubmitted && selectedOption === option.text && option.text !== correctOption.text,
                    "opacity-60": isSubmitted && option.text !== correctOption.text && option.text !== selectedOption,
                  }
                )}
              >
                <RadioGroupItem value={option.text} id={`option-${index}`} disabled={isSubmitted} />
                <Label 
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer font-normal text-md"
                >
                  <span className="font-semibold mr-2">{option.letter}.</span>
                  {option.text}
                </Label>
                {isSubmitted && option.text === correctOption.text && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />
                )}
                {isSubmitted && selectedOption === option.text && option.text !== correctOption.text && (
                  <XCircle className="h-5 w-5 text-red-500 ml-2" />
                )}
              </div>
            ))}
          </RadioGroup>
          
          {/* Feedback alert */}
          {feedback && (
            <Alert 
              className={cn(
                "mt-4",
                feedback.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              )}
            >
              <AlertDescription>
                {feedback.message}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-end mt-6 space-x-2">
            {isSubmitted ? (
              <Button onClick={handleReset} variant="outline">
                Try Another Question
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={!selectedOption}
                className={!selectedOption ? "opacity-50 cursor-not-allowed" : ""}
              >
                Submit Answer
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}