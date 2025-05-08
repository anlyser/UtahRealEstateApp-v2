import * as React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface CardNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function CardNavigation({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: CardNavigationProps) {
  return (
    <div className="max-w-2xl mx-auto mt-8 flex justify-between">
      <Button
        variant="ghost"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="flex items-center text-primary-700 font-medium hover:text-primary-800 hover:bg-primary-50 disabled:opacity-50"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
      <Button
        variant="ghost"
        onClick={onNext}
        disabled={!canGoNext}
        className="flex items-center text-primary-700 font-medium hover:text-primary-800 hover:bg-primary-50 disabled:opacity-50"
      >
        Next
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
