import * as React from "react";
import { Button } from "@/components/ui/button";
import { X, HelpCircle, Check } from "lucide-react";

interface AnswerFeedbackProps {
  onIncorrect: () => void;
  onReview: () => void;
  onCorrect: () => void;
  disabled?: boolean;
}

export function AnswerFeedback({
  onIncorrect,
  onReview,
  onCorrect,
  disabled = false,
}: AnswerFeedbackProps) {
  return (
    <div className="max-w-2xl mx-auto mt-6 flex gap-3 sm:gap-4 justify-center">
      <Button
        variant="outline"
        size="lg"
        onClick={onIncorrect}
        disabled={disabled}
        className="flex-1 sm:flex-none sm:w-40 justify-center"
      >
        <X className="h-5 w-5 mr-2 text-red-500" />
        Incorrect
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={onReview}
        disabled={disabled}
        className="flex-1 sm:flex-none sm:w-40 justify-center"
      >
        <HelpCircle className="h-5 w-5 mr-2 text-yellow-500" />
        Review Later
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={onCorrect}
        disabled={disabled}
        className="flex-1 sm:flex-none sm:w-40 justify-center"
      >
        <Check className="h-5 w-5 mr-2 text-green-500" />
        Correct
      </Button>
    </div>
  );
}
