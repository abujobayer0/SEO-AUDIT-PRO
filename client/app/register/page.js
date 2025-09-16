"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import ShinyText from "../../components/ShinyText";
import StarBorder from "../../components/StarBorder";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: "gray",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const checkPasswordStrength = (password) => {
    // Password strength criteria
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteria = [hasMinLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar];
    const score = criteria.filter(Boolean).length;

    let message = "";
    let color = "";

    if (score === 0 || password.length === 0) {
      message = "";
      color = "gray";
    } else if (score <= 2) {
      message = "Weak password";
      color = "red-500";
    } else if (score <= 4) {
      message = "Moderate password";
      color = "yellow-500";
    } else {
      message = "Strong password";
      color = "green-500";
    }

    return { score, message, color };
  };

  useEffect(() => {
    const strength = checkPasswordStrength(formData.password);
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (passwordStrength.score < 3) {
      toast.error("Please use a stronger password with uppercase, lowercase, numbers, and special characters");
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/register", {
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
      });

      if (typeof window !== "undefined") {
        window.localStorage.setItem("auth_token", data.token);
      }

      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
            Create your <ShinyText text='account' className='font-bold' speed={7} />
          </h2>
          <p className='mt-2 text-gray-100'>Start auditing in minutes. No credit card required.</p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='companyName' className='block text-sm font-medium text-gray-100 mb-1'>
                Company Name
              </label>
              <input
                id='companyName'
                name='companyName'
                type='text'
                required
                value={formData.companyName}
                onChange={handleChange}
                className='w-full bg-gray-900/30 border border-white/20 focus:border-white text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-lg backdrop-blur-sm'
                placeholder='Your agency name'
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-100 mb-1'>
                Work email
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
              <div className='space-y-1'>
                <div className='relative'>
                  <input
                    id='password'
                    name='password'
                    type={showPassword ? "text" : "password"}
                    autoComplete='new-password'
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className='w-full bg-gray-900/30 border border-white/20 focus:border-white text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-lg backdrop-blur-sm pr-10'
                    placeholder='Create a password'
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
                {formData.password && (
                  <div className='mt-1'>
                    <div className='flex items-center gap-2'>
                      <div className='h-1 flex-grow rounded-full bg-white/20 overflow-hidden'>
                        <div
                          className={`h-full ${
                            passwordStrength.score === 0
                              ? "w-0"
                              : passwordStrength.score <= 2
                              ? "w-1/3 bg-red-400"
                              : passwordStrength.score <= 4
                              ? "w-2/3 bg-yellow-400"
                              : "w-full bg-green-400"
                          }`}
                        />
                      </div>
                      <span className='text-xs font-medium text-white/80'>{passwordStrength.message}</span>
                    </div>
                    <p className='text-xs text-gray-300 mt-1'>Use 8+ characters with uppercase, lowercase, numbers, and symbols</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-100 mb-1'>
                Confirm Password
              </label>
              <div className='relative'>
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete='new-password'
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className='w-full bg-gray-900/30 border border-white/20 focus:border-white text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-lg backdrop-blur-sm pr-10'
                  placeholder='Confirm your password'
                  disabled={isLoading}
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className='h-5 w-5 text-white/70' /> : <Eye className='h-5 w-5 text-white/70' />}
                </button>
              </div>
            </div>
          </div>

          <div className='flex items-center'>
            <input
              id='terms'
              name='terms'
              type='checkbox'
              required
              className='h-4 w-4 text-white focus:ring-white border-white/30 rounded bg-gray-900/30'
            />
            <label htmlFor='terms' className='ml-2 block text-sm text-gray-100'>
              I agree to the{" "}
              <a href='#' className='text-white hover:text-white/80'>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href='#' className='text-white hover:text-white/80'>
                Privacy Policy
              </a>
            </label>
          </div>

          <div>
            <StarBorder as='button' type='submit' disabled={isLoading} color='rgba(255, 255, 255, 0.6)' thickness={1} className='w-full'>
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                  Creating account...
                </div>
              ) : (
                "Create account"
              )}
            </StarBorder>
          </div>

          <div className='text-center'>
            <p className='text-sm text-gray-100'>
              Already have an account?{" "}
              <a href='/login' className='font-medium text-white hover:text-white/80'>
                <ShinyText text='Sign in' speed={6} />
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
