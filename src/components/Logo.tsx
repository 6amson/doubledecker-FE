import { Bus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
}

export const Logo = ({ size = "md", clickable = true }: LogoProps) => {
  const navigate = clickable ? useNavigate() : null;

  const sizes = {
    sm: { icon: 20, text: "text-lg" },
    md: { icon: 28, text: "text-2xl" },
    lg: { icon: 36, text: "text-3xl" },
  };

  const handleClick = () => {
    if (clickable && navigate) {
      navigate("/");
    }
  };

  return (
    <div
      className={`flex items-center gap-3 ${clickable ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
      onClick={handleClick}
      role={clickable ? "button" : undefined}
      aria-label={clickable ? "Go to dashboard" : undefined}
    >
      <div className="bg-primary rounded-xl p-2">
        <Bus size={sizes[size].icon} className="text-primary-foreground" />
      </div>
    </div>
  );
};
