"use client";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "@/utils/supabase";
import { useAuth } from "@/auth/AuthProvider";
import AuthInputField from "@/components/auth/AuthInputField";
import { User, AtSign, Lock } from "lucide-react";

export default function Signup() {
  const { session, role } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      if (role === 'procurement') {
        navigate("/procurement", { replace: true });
      } else if (role === 'legal') {
        navigate("/legal", { replace: true });
      } else if (role === 'management') {
        navigate("/management", { replace: true });
      } else if (role === 'owner') {
        navigate("/owner", { replace: true });
      } else {
        navigate("/create-project", { replace: true });
      }
    }
  }, [session, navigate]);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setMessage("Account created successfully! Redirecting to login...");
      redirectTimer.current = setTimeout(
        () => navigate("/auth/login", { replace: true }),
        2000
      );
    } finally {
      setLoading(false);
    }
  }

  async function signUpGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <main className="relative min-h-screen flex flex-row overflow-hidden">
      <img
        className="right-0 bottom-0 absolute w-[50%] origin-bottom-right -z-10"
        src="/login/bubble_login.png"
        alt="Bubble"
      />

      {/* Left side - Image */}
      <div className="relative w-[55%] overflow-hidden">
        <div className="absolute z-10 w-full h-full pl-12 pr-24 py-12">
          <p className="text-6xl leading-normal text-white font-bold">
            <span className="text-secondary">Smarter</span> Contracts.
            <br /> <span className="text-secondary">Better</span> Outcomes.
          </p>
        </div>
        <img
          className="w-full h-full object-cover"
          src="/login/signup_bg.svg"
          alt="Login Illustration"
          loading="lazy"
        />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-4">
        <div className="w-full max-w-lg">
          <form
            onSubmit={submit}
            className="shadow-lg p-8 flex flex-col rounded-3xl bg-white"
          >
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-bold mb-1 leading-tight">
                Create Your Account
              </h1>
              <p className="text-[13px] text-gray-500">
                Sign up to start your organization and contracts.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                {message}
              </div>
            )}

            <div className="space-y-5 mb-5">
              <AuthInputField
                label="Name"
                type="text"
                placeholder="Enter your name"
                icon={<User size={18} />}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <AuthInputField
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                icon={<AtSign size={18} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <AuthInputField
                label="Password"
                type="password"
                placeholder="Enter your password"
                icon={<Lock size={18} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white rounded-xl py-3.5 font-semibold hover:bg-[#2c6ba8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-5"
            >
              {loading ? "Creating Account..." : "Login"}
            </button>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  or continue with
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={signUpGoogle}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-xl py-3 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-gray-700 font-medium">
                  Continue with Google
                </span>
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-xl py-3 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span className="text-gray-700 font-medium">
                  Continue with LinkedIn
                </span>
              </button>
            </div>
          </form>

          <p className="text-sm text-center mt-6">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/auth/login")}
              className="cursor-pointer text-[#357ABD] font-medium hover:underline"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
