import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Bus, KeyRound, Mail, ArrowRight } from "lucide-react";

export const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsLoading(true);
        try {
            const response = await authService.login(email, password);
            // Login using the response data
            login(response.token, response.user);

            toast.success("Welcome back!");
            navigate(from, { replace: true });
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="space-y-2">
                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                            <Bus className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                            Welcome back
                        </h1>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your workspace
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-9 bg-muted/50 border-input focus:bg-background transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-medium text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9 bg-muted/50 border-input focus:bg-background transition-colors font-sans text-lg tracking-widest"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="bus"
                            className="w-full h-11 text-base shadow-lg shadow-primary/20"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Don't have an account? </span>
                        <Link
                            to="/signup"
                            className="font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Create an account
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:block relative bg-muted overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 pattern-grid-lg opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-20 space-y-6">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium leading-relaxed">
                            "DoubleDecker has completely transformed how we analyze our data. The query builder is intuitive and the results are instant."
                        </p>
                        <footer className="text-sm font-semibold text-primary">
                            Sofia Davis, Data Analyst
                        </footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
};
