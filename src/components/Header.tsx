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
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <Logo size={showBack ? "sm" : "md"} />
          {showBack && (
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft size={20} />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
