import * as React from "react";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, RefreshCcw } from "lucide-react";

interface CardControlsProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  onSave: () => void;
  onShuffle: () => void;
  isSaved?: boolean;
}

export function CardControls({
  currentQuestionIndex,
  totalQuestions,
  onSave,
  onShuffle,
  isSaved = false,
}: CardControlsProps) {
  return (
    <div className="max-w-2xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center">
        <span className="text-sm text-gray-600 mr-2">Question</span>
        <span className="font-medium">{currentQuestionIndex}</span>
        <span className="text-gray-600 mx-1">of</span>
        <span className="font-medium">{totalQuestions}</span>
      </div>
      
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          className="flex items-center"
        >
          <BookmarkIcon className={cn(
            "h-4 w-4 mr-1.5",
            isSaved ? "fill-current text-primary-500" : "text-gray-500"
          )} />
          {isSaved ? "Saved" : "Save"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onShuffle}
          className="flex items-center"
        >
          <RefreshCcw className="h-4 w-4 mr-1.5 text-gray-500" />
          Shuffle
        </Button>
      </div>
    </div>
  );
}

// Helper function for conditional classnames
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
