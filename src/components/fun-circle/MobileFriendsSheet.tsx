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
      <SheetContent side="bottom" className="h-[80vh] rounded-t-xl p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Friends</SheetTitle>
        </SheetHeader>
        <div className="overflow-auto h-full pb-8">
          <FriendsPanel onStartChat={onStartChat} />
        </div>
      </SheetContent>
    </Sheet>
  );
}