"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import ShinyText from "../../components/ShinyText";
import StarBorder from "../../components/StarBorder";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (typeof window !== "undefined") {
        window.localStorage.setItem("auth_token", data.token);
      }

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If already logged in, redirect
    const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className='min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 p-8 '>
        <div className='text-center'>
          <div className='flex items-center justify-center mb-4'>
            <BarChart3 className='h-10 w-10 text-white' />
            <span className='ml-2 text-2xl font-bold text-white'>SEO Audit Pro</span>
          </div>
          <h2 className='text-3xl font-bold text-white'>
            Welcome <ShinyText text='back' className='font-bold' speed={7} />
          </h2>
          <p className='mt-2 text-gray-100'>Access your audits, reports, and branding settings</p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4'>
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
                value={formData.email}
                onChange={handleChange}
                className='w-full bg-gray-900/30 border border-white/20 focus:border-white text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-lg backdrop-blur-sm'
                placeholder='Enter your email'
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-100 mb-1'>
                Password
              </label>
              <div className='relative'>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? "text" : "password"}
                  autoComplete='current-password'
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className='w-full bg-gray-900/30 border border-white/20 focus:border-white text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-lg backdrop-blur-sm pr-10'
                  placeholder='Enter your password'
                  disabled={isLoading}
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className='h-5 w-5 text-white/70' /> : <Eye className='h-5 w-5 text-white/70' />}
                </button>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='remember-me'
                name='remember-me'
                type='checkbox'
                className='h-4 w-4 text-white focus:ring-white border-white/30 rounded bg-gray-900/30'
              />
              <label htmlFor='remember-me' className='ml-2 block text-sm text-gray-100'>
                Remember me
              </label>
            </div>

            <div className='text-sm'>
              <a href='/forgot-password' className='font-medium text-white hover:text-white/80'>
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <StarBorder as='button' type='submit' disabled={isLoading} color='rgba(255, 255, 255, 0.6)' thickness={1} className='w-full'>
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </StarBorder>
          </div>

          <div className='text-center'>
            <p className='text-sm text-gray-100'>
              Don't have an account?{" "}
              <a href='/register' className='font-medium text-white hover:text-white/80'>
                <ShinyText text='Create one free' speed={6} />
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
