import { cn } from "@/lib/utils";

interface ListTileProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  actionClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export const ListTile: React.FC<ListTileProps> = ({
  title,
  description,
  icon,
  className,
  action,
  actionClassName,
  titleClassName,
  descriptionClassName,
}) => {
  return (
    <div className={cn("flex flex-wrap items-center gap-[10px]", className)}>
      <div className="flex items-center flex-1">
        {icon}
        <div className={cn("grid flex-1", icon && "ml-[10px]")}>
          <div
            className={cn("text-base truncate font-semibold", titleClassName)}
          >
            {title}
          </div>
          {description && (
            <div
              className={cn(
                "text-sm line-clamp-2 text-muted-foreground",
                descriptionClassName
              )}
            >
              {description}
            </div>
          )}
        </div>
      </div>
      <div className={cn("flex-shrink-0 ml-auto", actionClassName)}>
        {action}
      </div>
    </div>
  );
};
