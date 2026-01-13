import { Monitor, Tablet, Smartphone } from "lucide-react";
import { Logo } from "./Logo";

export const MobileBlocker = () => {
  return (
    <div className="fixed inset-0 bg-background z-[100] lg:hidden">
      {/* Logo - Top Left */}
      <div className="absolute top-4 left-4">
        <Logo size="md" />
      </div>
      
      <div className="flex items-center justify-center h-full p-6">
        <div className="max-w-md text-center space-y-8">

        {/* Illustration */}
        <div className="relative">
          <div className="flex items-end justify-center gap-4">
            {/* Desktop - Full color */}
            <div className="relative">
              <div className="w-32 h-24 bg-primary/10 rounded-lg border-2 border-primary flex items-center justify-center">
                <Monitor size={40} className="text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            {/* Tablet - Muted */}
            <div className="relative opacity-40">
              <div className="w-20 h-28 bg-muted rounded-lg border-2 border-muted-foreground/30 flex items-center justify-center">
                <Tablet size={28} className="text-muted-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            </div>

            {/* Phone - Muted */}
            <div className="relative opacity-40">
              <div className="w-14 h-24 bg-muted rounded-lg border-2 border-muted-foreground/30 flex items-center justify-center">
                <Smartphone size={20} className="text-muted-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bus decoration */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-3 h-1 bg-primary rounded-full" />
            <div className="w-6 h-1 bg-primary rounded-full" />
            <div className="w-3 h-1 bg-primary rounded-full" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-display font-bold text-foreground">
            Desktop Required
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            DoubleDecker's powerful query builder requires a desktop or laptop screen for the best experience. 
            Please switch to a larger device to continue.
          </p>
        </div>

        {/* Decorative bottom */}
        <div className="pt-4">
          <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
        </div>
        </div>
      </div>
    </div>
  );
};
