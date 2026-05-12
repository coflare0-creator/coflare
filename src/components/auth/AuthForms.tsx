import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Mail,
  Phone,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { supabase } from "@/utils/supabase";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/utils/useAuthStore";

export function LoginForm() {
  const { setUser } = useAuthStore();

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupData, setSignUpData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormDataComplete = () => {
    return Object.values(signupData).every((value) => value.trim() !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const formReady = isFormDataComplete();

    if (!formReady) {
      alert("Please input all fields");
      setIsLoading(false);
      // showToast("Please input all fields", "warning");

      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: signupData.email,
      password: signupData.password,
    });

    if (error) {
      alert(error);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name,
        phone: data.user.phone,
      });
      navigate("/dashboard");
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Link to="/" className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shadow-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
        </Link>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in to continue to Co-flare</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              onChange={handleChange}
              name="email"
              id="email"
              type="email"
              placeholder="you@example.com"
              // required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                onChange={handleChange}
                name="password"
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                // required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full gap-2" disabled={isLoading}>
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4">
            Continue as Anonymous Reporter
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export function RegisterForm() {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signinData, setSignInData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setSignInData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormDataComplete = () => {
    return Object.values(signinData).every((value) => value.trim() !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const formReady = isFormDataComplete();

    if (!formReady) {
      alert("Please input all fields");
      setIsLoading(false);
      // showToast("Please input all fields", "warning");

      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: signinData.email,
      password: signinData.password,
      options: {
        data: {
          name: signinData.name,
          phone: signinData.phone,
        },
      },
    });

    console.log(data);

    if (error) {
      if (error.message.includes("already registered")) {
        alert("This email is already in use");
      } else if (error.message.includes("Email not confirmed")) {
        alert("Please check your email to verify your account");
      } else {
        alert("Something went wrong. Try again.");
      }

      setIsLoading(false);
      return;
    }

    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name,
        phone: data.user.user_metadata.phone,
      });
      navigate("/dashboard");
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Link to="/" className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shadow-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
        </Link>
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>Join the Co-flare community</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                onChange={handleChange}
                name="name"
                id="name"
                placeholder="John Doe"
                className="pl-10"
                // required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                onChange={handleChange}
                name="email"
                id="register-email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                // required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-phone">Phone (optional)</Label>
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                onChange={handleChange}
                name="phone"
                id="register-phone"
                type="tel"
                placeholder="+234 801 234 5678"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                onChange={handleChange}
                name="password"
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10"
                // required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters
            </p>
          </div>

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={isLoading}
            // onClick={handleSubmit}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By signing up, you agree to our{" "}
          <Link to="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
