import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { QuestionWithAnswer } from "@shared/schema";

interface FlashCardProps {
  question: QuestionWithAnswer;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
}

export function FlashCard({ question, isFlipped, onFlip, className }: FlashCardProps) {
  return (
    <div 
      className={cn("card-flip cursor-pointer select-none", {
        "flipped": isFlipped
      }, className)}
      onClick={onFlip}
    >
      <div className="card-inner h-full w-full">
        {/* Question Side */}
        <Card className="card-front shadow-md p-6 flex flex-col">
          <Badge 
            variant="outline"
            className="category-badge bg-primary-100 text-primary-800 hover:bg-primary-100"
          >
            {question.category?.name || "General"}
          </Badge>
          
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
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
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            <span className="text-gray-500 text-sm flex items-center">
              <span className="material-icons text-sm mr-1">touch_app</span>
              Tap to reveal answer
            </span>
          </div>
        </Card>
        
        {/* Answer Side */}
        <Card className="card-back shadow-md p-6 flex flex-col">
          <Badge 
            variant="outline"
            className="category-badge bg-primary-100 text-primary-800 hover:bg-primary-100"
          >
            {question.category?.name || "General"}
          </Badge>
          
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">ANSWER:</p>
              <h3 className="text-lg sm:text-xl font-medium mb-4">
                {question.answer.text}
              </h3>
              
              {question.answer.explanation && (
                <p className="text-sm text-gray-600 mt-4">
                  {question.answer.explanation}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            <span className="text-gray-500 text-sm flex items-center">
              <span className="material-icons text-sm mr-1">touch_app</span>
              Tap to see question
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
