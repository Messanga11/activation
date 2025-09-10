import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const AvatarItem = ({ title }: { title: string }) => {
  return (
    <Avatar className="size-[50px]">
      <AvatarFallback className="text-[20px] font-bold bg-muted text-gray">
        {title
          .split(" ")
          .map((part) => part.charAt(0))
          .slice(0, 2)
          .join("")}
      </AvatarFallback>
    </Avatar>
  );
};
