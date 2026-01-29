import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FriendsPanel } from "./FriendsPanel";

interface MobileFriendsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (userId: string) => void;
}

export function MobileFriendsSheet({ isOpen, onClose, onStartChat }: MobileFriendsSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl p-0 flex flex-col">
        <SheetHeader className="p-4 border-b shrink-0">
          <SheetTitle>Friends</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-auto pb-safe">
          <FriendsPanel onStartChat={onStartChat} />
        </div>
      </SheetContent>
    </Sheet>
  );
}