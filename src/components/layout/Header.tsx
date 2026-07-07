import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Globe,
  Menu,
  X,
  Bell,
  MapPin,
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Users,
  Settings,
  LogOut,
  Plus,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/utils/useAuthStore";
import { supabase } from "@/utils/supabase";
import { useNavigate } from "react-router-dom";

const navLinks = [
  { href: "/map", label: "Live Map", icon: MapPin },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
];

export function Header() {
  const { user, clearUser } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error.message);
      return;
    }

    setTimeout(() => {
      clearUser();

      navigate("/");
    }, 500);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isLanding && !isScrolled
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur-xl border-b shadow-sm",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {}
          <Link to="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="Co-flare Logo"
              className={cn(
                "h-36 md:h-60 w-auto object-contain transition-transform group-hover:scale-105",
                isLanding && !isScrolled ? "brightness-0 invert" : "",
              )}
            />
          </Link>

          {}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks
              .filter((link) => {
                if (
                  link.href === "/reports" &&
                  ![
                    "coflare0@gmail.com",
                    "lekeham@gmail.com",
                    "obanishola122@gmail.com",
                  ].includes(user?.email)
                ) {
                  return false;
                }
                return true;
              })
              .map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      isLanding && !isScrolled
                        ? isActive
                          ? "bg-white/20 text-white"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                        : isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <link.icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
          </nav>

          {}
          <div className="flex items-center gap-3">
            <Link to="/submit" className="hidden sm:block">
              <Button className="gap-2 hover:shadow-xl transition-shadow">
                <Plus size={18} />
                Report Incident
              </Button>
            </Link>

            {}

            {user?.id && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "relative",
                    isLanding && !isScrolled
                      ? "text-white hover:bg-white/10"
                      : "",
                  )}
                >
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "rounded-full transition-colors",
                        isLanding && !isScrolled ? "hover:bg-white/10" : "",
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="gap-2 cursor-pointer">
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/my-reports" className="gap-2 cursor-pointer">
                        <FileText size={16} />
                        My Reports
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="gap-2 cursor-pointer">
                        <Settings size={16} />
                        Settings
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <div
                        onClick={handleSignOut}
                        className="gap-2 cursor-pointer text-destructive"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!user?.id && (
              <Link to="/login">
                <Button className="gap-2 hover:shadow-xl transition-shadow">
                  <User size={18} />
                  Sign In
                </Button>
              </Link>
            )}

            {}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "lg:hidden",
                isLanding && !isScrolled ? "text-white hover:bg-white/10" : "",
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b"
          >
            <nav className="container mx-auto px-4 py-4 space-y-1">
              {navLinks
                .filter((link) => {
                  if (
                    link.href === "/reports" &&
                    user?.email !== "coflare0@gmail.com"
                  ) {
                    return false;
                  }
                  return true;
                })
                .map((link) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      <link.icon size={20} />
                      {link.label}
                    </Link>
                  );
                })}
              <Link
                to="/submit"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium bg-primary text-primary-foreground mt-4"
              >
                <Plus size={20} />
                Report Incident
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
