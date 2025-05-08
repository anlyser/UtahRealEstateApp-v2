import * as React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const [location] = useLocation();
  const isMobile = useMobile();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: progress } = useQuery<{
    completed: number;
    total: number;
    percentage: number;
  }>({
    queryKey: ['/api/progress'],
  });

  const progressPercentage = progress?.percentage || 0;
  const completedQuestions = progress?.completed || 0;
  const totalQuestions = progress?.total || 0;

  // If we're on mobile and the sidebar isn't explicitly open, don't render
  if (isMobile && !isOpen) return null;

  return (
    <div className={cn(
      "w-64 bg-white shadow-md fixed h-full left-0 z-40 transition-transform duration-300",
      isMobile ? "top-0" : "top-0",
      isMobile && !isOpen && "-translate-x-full",
      isMobile && isOpen && "translate-x-0"
    )}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-800">Utah RE Exam Prep</h1>
          {isMobile && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </div>
        
        <div className="mb-6 mt-6">
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-500">Study Progress</p>
            <p className="text-sm font-medium">{progressPercentage}%</p>
          </div>
          <Progress value={progressPercentage} className="h-2.5" />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{completedQuestions} completed</span>
            <span>{totalQuestions} total</span>
          </div>
        </div>
        
        <nav>
          <p className="text-sm font-medium text-gray-600 mb-2">STUDY</p>
          <ul>
            <li className="mb-1">
              <Link href="/flash-cards" className={cn(
                "block py-2 px-4 rounded",
                location === "/flash-cards" ? "bg-primary-50 text-primary-800" : "hover:bg-gray-100"
              )}>
                Flash Cards
              </Link>
            </li>
            <li className="mb-1">
              <Link href="/practice-test" className={cn(
                "block py-2 px-4 rounded",
                location === "/practice-test" ? "bg-primary-50 text-primary-800" : "hover:bg-gray-100"
              )}>
                Practice Test
              </Link>
            </li>
            <li className="mb-1">
              <Link href="/saved-questions" className={cn(
                "block py-2 px-4 rounded",
                location === "/saved-questions" ? "bg-primary-50 text-primary-800" : "hover:bg-gray-100"
              )}>
                Saved Questions
              </Link>
            </li>
          </ul>
          
          <p className="text-sm font-medium text-gray-600 mt-6 mb-2">CATEGORIES</p>
          {categories && categories.length > 0 ? (
            <ul>
              {categories.map((category) => (
                <li key={category.id} className="mb-1">
                  <Link href={`/flash-cards?category=${category.id}`} className={cn(
                    "block py-2 px-4 rounded hover:bg-gray-100 flex justify-between items-center",
                    location === `/flash-cards?category=${category.id}` ? "bg-primary-50 text-primary-800" : ""
                  )}>
                    <span>{category.name}</span>
                    <span className="text-xs bg-gray-200 rounded-full px-2 py-1">
                      {category.questionCount}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 py-2 px-4">No categories available</p>
          )}
          
          <p className="text-sm font-medium text-gray-600 mt-6 mb-2">RESOURCES</p>
          <ul>
            <li className="mb-1">
              <Link href="/upload-materials" className={cn(
                "block py-2 px-4 rounded",
                location === "/upload-materials" ? "bg-primary-50 text-primary-800" : "hover:bg-gray-100"
              )}>
                Upload Materials
              </Link>
            </li>
            <li className="mb-1">
              <Link href="/settings" className={cn(
                "block py-2 px-4 rounded",
                location === "/settings" ? "bg-primary-50 text-primary-800" : "hover:bg-gray-100"
              )}>
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
