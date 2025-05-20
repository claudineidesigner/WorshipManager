import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "primary" | "secondary" | "accent";
  viewAllLink?: string;
}

const colorMap = {
  primary: {
    bg: "bg-primary-100",
    text: "text-primary-600",
    link: "text-primary-600 hover:text-primary-500",
  },
  secondary: {
    bg: "bg-secondary-100",
    text: "text-secondary-600",
    link: "text-secondary-600 hover:text-secondary-500",
  },
  accent: {
    bg: "bg-accent-100",
    text: "text-accent-600",
    link: "text-accent-600 hover:text-accent-500",
  },
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  color,
  viewAllLink,
}) => {
  const colors = colorMap[color];
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 p-3 rounded-md", colors.bg)}>
            <i className={cn(`fas ${icon} text-xl`, colors.text)}></i>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-xl font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      
      {viewAllLink && (
        <CardFooter className="bg-gray-50 px-5 py-3 border-t">
          <div className="text-sm">
            <a href={viewAllLink} className={cn("font-medium", colors.link)}>
              View all
            </a>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default DashboardCard;
