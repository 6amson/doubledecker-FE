import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  showBack?: boolean;
  backTo?: string | -1;
  children?: React.ReactNode;
}

export const Header = ({ showBack = false, backTo = "/", children }: HeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo === -1) {
      navigate(-1);
    } else {
      navigate(backTo);
    }
  };

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-50 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo size={showBack ? "sm" : "md"} />
          {showBack && (
            <div className="h-6 w-px bg-border/60 mx-2" />
          )}
          {showBack && (
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4">
          {children}
          <div className="h-6 w-px bg-border/60 mx-2 hidden sm:block" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
