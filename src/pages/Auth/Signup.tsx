import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Bus, KeyRound, Mail, ArrowRight, User } from "lucide-react";

export const Signup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.signup(formData.email, formData.password);
            login(response.token, response.user);

            toast.success("Account created successfully!");
            navigate("/");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to create account");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Right Side - Visual (Switched for Signup for visual variety) */}
            <div className="hidden lg:block relative bg-primary overflow-hidden">
                <div className="absolute inset-0 bg-black/10 pattern-dots opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center text-primary-foreground/20">
                    <Bus size={400} strokeWidth={0.5} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-20">
                    <h2 className="text-3xl font-display font-bold text-primary-foreground mb-4">
                        Join the journey
                    </h2>
                    <p className="text-primary-foreground/80 text-lg">
                        Start building complex queries in minutes. Analyze spreadsheets easily with no SQL knowledge.
                    </p>
                </div>
            </div>

            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="space-y-2">
                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                            Create an account
                        </h1>
                        <p className="text-muted-foreground">
                            Get started with DoubleDecker today
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
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9 bg-muted/50 border-input focus:bg-background transition-colors font-sans text-lg tracking-widest"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9 bg-muted/50 border-input focus:bg-background transition-colors font-sans text-lg tracking-widest"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                            {isLoading ? "Creating account..." : "Create account"}
                            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link
                            to="/login"
                            className="font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
