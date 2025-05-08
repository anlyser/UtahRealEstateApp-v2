import * as React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Menu, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
  selectedCategory?: string | null; 
  onCategoryChange?: (categoryId: string) => void;
  showCategoryFilter?: boolean;
}

export function TopBar({
  title,
  onMenuClick,
  selectedCategory = "all",
  onCategoryChange,
  showCategoryFilter = true,
}: TopBarProps) {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  return (
    <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-4" 
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-medium">{title}</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Filter Dropdown */}
        {showCategoryFilter && (
          <Select 
            value={selectedCategory || "all"} 
            onValueChange={onCategoryChange}
          >
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories && categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {/* Settings Icon */}
        <Button variant="ghost" size="icon" asChild>
          <a href="/settings">
            <Settings className="h-5 w-5" />
          </a>
        </Button>
      </div>
    </header>
  );
}
