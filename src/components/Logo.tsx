import { Bus } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ size = "md" }: LogoProps) => {
  const sizes = {
    sm: { icon: 20, text: "text-lg" },
    md: { icon: 28, text: "text-2xl" },
    lg: { icon: 36, text: "text-3xl" },
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse-glow" />
        <div className="relative bg-primary rounded-xl p-2 red-glow">
          <Bus size={sizes[size].icon} className="text-primary-foreground" />
        </div>
      </div>
    </div>
  );
};
