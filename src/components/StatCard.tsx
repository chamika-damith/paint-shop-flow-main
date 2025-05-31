
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  colorClass?: string;
  change?: number;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  colorClass = "from-blue-500 to-cyan-400",
  change
}: StatCardProps) => {
  return (
    <Card className="overflow-hidden paint-card">
      <CardContent className="p-0">
        <div className="flex items-center p-6">
          <div className={cn(
            "h-12 w-12 rounded-lg bg-gradient-to-tr flex items-center justify-center text-white",
            colorClass
          )}>
            <Icon size={24} />
          </div>
          
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            
            {(description || change !== undefined) && (
              <div className="mt-1 flex items-center text-sm">
                {change !== undefined && (
                  <span className={cn(
                    "font-medium mr-2",
                    change >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {change >= 0 ? `+${change}%` : `${change}%`}
                  </span>
                )}
                {description && (
                  <span className="text-gray-500">{description}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
