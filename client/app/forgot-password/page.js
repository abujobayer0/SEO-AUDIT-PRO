"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/password/request-reset", { email });
      setEmailSent(true);
      toast.success("Password reset instructions sent to your email");
    } catch (error) {
      toast.error(error.message || "Failed to send reset instructions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <div className='flex items-center justify-center mb-4'>
            <BarChart3 className='h-10 w-10 text-white' />
            <span className='ml-2 text-2xl font-bold text-white'>Seo Inspect Pro</span>
          </div>
          <h2 className='text-3xl font-bold text-white'>Reset your password</h2>
          <p className='mt-2 text-gray-100'>
            {emailSent ? "Check your email for reset instructions" : "Enter your email to receive password reset instructions"}
          </p>
        </div>

        {!emailSent ? (
          <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-100 mb-1'>
                Email address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full bg-gray-900/30 border border-white/20 focus:border-white text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-lg backdrop-blur-sm'
                placeholder='Enter your email'
                disabled={isLoading}
              />
            </div>

            <div>
              <button
                type='submit'
                disabled={isLoading}
                className='w-full py-3 px-4 border border-white/30 rounded-xl text-white hover:bg-white/10 transition-all'
              >
                {isLoading ? (
                  <div className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                    Sending instructions...
                  </div>
                ) : (
                  "Send Reset Instructions"
                )}
              </button>
            </div>

            <div className='text-center'>
              <p className='text-sm text-gray-100'>
                Remember your password?{" "}
                <a href='/login' className='font-medium text-white hover:text-white/80'>
                  Sign in
                </a>
              </p>
            </div>
          </form>
        ) : (
          <div className='mt-8 space-y-6'>
            <div className='bg-black/30 border border-white/10 p-4 rounded-md'>
              <p className='text-gray-100'>
                We've sent password reset instructions to <strong>{email}</strong>. Please check your inbox and follow the instructions to
                reset your password.
              </p>
            </div>

            <div className='space-y-4'>
              <button
                onClick={() => router.push("/login")}
                className='w-full py-3 px-4 border border-white/30 rounded-xl text-white hover:bg-white/10 transition-all'
              >
                Return to Login
              </button>

              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                className='text-sm text-white hover:text-white/80 w-full text-center'
              >
                Try with a different email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
