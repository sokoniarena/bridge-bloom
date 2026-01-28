import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Search, ShoppingBag, Sparkles, Calendar, User, X, LogOut, LayoutDashboard, Shield, Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { href: "/products", label: "Products", icon: ShoppingBag },
  { href: "/services", label: "Services", icon: Sparkles },
  { href: "/events", label: "Events", icon: Calendar },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const unreadCount = useUnreadMessages();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <span className="font-display text-lg font-bold text-primary-foreground">S</span>
          </div>
          <span className="hidden font-display text-xl font-bold text-foreground sm:inline-block">
            Sokoni<span className="text-primary">Arena</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "nav-link flex items-center gap-2",
                  isActive && "active"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          {user && <NotificationBell />}

          {user && (
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to="/messages">
                <MessageCircle className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Link>
            </Button>
          )}

          {user && (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/favorites">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button asChild>
                <Link to="/register">
                  Post Ad
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <span className="font-display text-lg font-bold">
                    Sokoni<span className="text-primary">Arena</span>
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    );
                  })}

                  {user && (
                    <>
                      <Link
                        to="/favorites"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted"
                      >
                        <Heart className="h-5 w-5" />
                        Favorites
                      </Link>
                      <Link
                        to="/messages"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted"
                      >
                        <div className="relative">
                          <MessageCircle className="h-5 w-5" />
                          {unreadCount > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-4 min-w-4 flex items-center justify-center p-0 text-[10px]">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </Badge>
                          )}
                        </div>
                        Messages
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted"
                        >
                          <Shield className="h-5 w-5" />
                          Admin Panel
                        </Link>
                      )}
                    </>
                  )}
                </nav>
                <div className="p-4 border-t space-y-3">
                  {user ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsOpen(false);
                        handleSignOut();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/login" onClick={() => setIsOpen(false)}>
                          <User className="h-4 w-4" />
                          Sign In
                        </Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link to="/register" onClick={() => setIsOpen(false)}>
                          Post Ad
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
