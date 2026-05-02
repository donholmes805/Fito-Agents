"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService, userService } from "@/services";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const user = await authService.register(email, password, fullName);
      const profile = await userService.getUserProfile(user.uid);
      const redirectPath = authService.getRedirectPathForRole(profile?.role || "business_owner");
      router.push(redirectPath);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.loginWithGoogle();
      const profile = await userService.getUserProfile(user.uid);
      const redirectPath = authService.getRedirectPathForRole(profile?.role || "business_owner");
      router.push(redirectPath);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to register with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Link href="/" className="text-3xl font-black text-white font-heading mb-12 uppercase tracking-tighter">
        Fito Agents
      </Link>
      
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 rim-light ambient-glow">
        <h1 className="font-heading text-2xl font-bold text-on-surface mb-2">Create Your Account</h1>
        <p className="text-on-surface-variant text-sm mb-8">Start your AI automation journey today.</p>
        
        {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-bold uppercase tracking-widest leading-relaxed">
                {error}
            </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
              placeholder="name@company.com"
              disabled={loading}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Confirm</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 py-2">
            <input type="checkbox" required id="terms" className="rounded bg-surface-container border-outline-variant text-secondary focus:ring-secondary" />
            <label htmlFor="terms" className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest leading-none">
              I agree to the <Link href="#" className="text-secondary hover:underline">Terms</Link>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-gradient py-4 rounded-xl font-bold uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Create Account"}
          </button>
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
            </div>
            <div className="relative flex justify-center text-xs">
                <span className="bg-surface-container-lowest px-4 text-on-surface-variant font-bold uppercase tracking-[0.2em] text-[10px]">Or</span>
            </div>
        </div>

        <button 
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full py-4 bg-surface-container border border-outline-variant rounded-xl font-bold text-[10px] uppercase tracking-widest text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center gap-3"
        >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google Account
        </button>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link href="/login" className="text-secondary font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
        &copy; 2024 Fito Technology, LLC. All rights reserved.
      </p>
    </div>
  );
}
