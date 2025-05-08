import * as React from "react";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Award, BookMarked, ActivitySquare } from "lucide-react";
import { Category } from "@shared/schema";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: progress } = useQuery<{
    completed: number;
    total: number;
    percentage: number;
    byCategory: {
      categoryId: number;
      categoryName: string;
      completed: number;
      total: number;
      percentage: number;
    }[];
  }>({
    queryKey: ['/api/progress'],
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopBar 
          title="Dashboard" 
          onMenuClick={() => setSidebarOpen(true)}
          showCategoryFilter={false}
        />
        
        <main className="flex-1 px-4 sm:px-6 py-8 overflow-auto bg-gray-50 mb-16 md:mb-0">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Your Study Progress</h1>
            
            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-gray-700">Flash Cards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <BookOpen className="h-10 w-10 text-primary-600" />
                    <span className="text-2xl font-bold">{progress?.total || 0}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/flash-cards">Study Now</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-gray-700">Practice Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <ActivitySquare className="h-10 w-10 text-secondary-600" />
                    <span className="text-2xl font-bold">Ready</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/practice-test">Take Test</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-gray-700">Saved Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <BookMarked className="h-10 w-10 text-yellow-500" />
                    <span className="text-2xl font-bold">0</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/saved-questions">Review</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-gray-700">Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Award className="h-10 w-10 text-accent-600" />
                    <span className="text-2xl font-bold">{progress?.percentage || 0}%</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={progress?.percentage || 0} className="w-full h-2" />
                </CardFooter>
              </Card>
            </div>
            
            {/* Category Progress */}
            <h2 className="text-xl font-semibold mb-4">Category Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {progress?.byCategory?.map((category) => (
                <Card key={category.categoryId}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">{category.categoryName}</CardTitle>
                    <CardDescription>{category.completed} of {category.total} completed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{category.percentage}%</span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/flash-cards?category=${category.categoryId}`}>Study Category</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {(!progress?.byCategory || progress.byCategory.length === 0) && (
                <Card className="md:col-span-2">
                  <CardContent className="pt-6 text-center">
                    <p className="text-gray-500">No category progress data available yet. Start studying to track your progress!</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Upload Materials CTA */}
            <Card className="border-dashed border-2 mb-8">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Add Your Study Materials</h3>
                  <p className="text-gray-500 mb-4">Upload PDF files or images with Utah real estate exam content</p>
                  <Button className="w-full sm:w-auto" asChild>
                    <Link href="/upload-materials">Upload Materials</Link>
                  </Button>
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
