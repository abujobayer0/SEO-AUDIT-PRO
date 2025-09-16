"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/api";
import ShinyText from "../../../components/ShinyText";
import StarBorder from "../../../components/StarBorder";

export default function VerifyEmailPage({ params }) {
  const [verificationStatus, setVerificationStatus] = useState("verifying"); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { token } = params;

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await api.post("/email/verify", { token });
        setVerificationStatus("success");
      } catch (error) {
        setVerificationStatus("error");
        setErrorMessage(error.message || "Email verification failed. Please try again.");
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setVerificationStatus("error");
      setErrorMessage("Invalid verification token");
    }
  }, [token]);

  return (
    <div className='min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 bg-black/30 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl'>
        <div className='text-center'>
          <div className='flex items-center justify-center mb-4'>
            <BarChart3 className='h-10 w-10 text-white' />
            <span className='ml-2 text-2xl font-bold text-white'>Seo Inspect Pro</span>
          </div>
          <h2 className='text-3xl font-bold text-white'>
            Email <ShinyText text='Verification' className='font-bold' speed={7} />
          </h2>
        </div>

        <div className='mt-8 space-y-6'>
          {verificationStatus === "verifying" && (
            <div className='bg-black/20 border border-white/10 p-6 rounded-md text-center backdrop-blur-sm'>
              <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-4'></div>
              <p className='text-white text-lg font-medium'>Verifying your email address...</p>
            </div>
          )}

          {verificationStatus === "success" && (
            <div className='bg-black/20 border border-white/10 p-6 rounded-md text-center backdrop-blur-sm'>
              <CheckCircle className='h-12 w-12 text-white mx-auto mb-4' />
              <h3 className='text-lg font-medium text-white mb-2'>
                <ShinyText text='Email Verified Successfully!' speed={6} />
              </h3>
              <p className='text-gray-100 mb-6'>You're all set. Head to your dashboard to run your first audit.</p>
              <StarBorder
                as='button'
                onClick={() => router.push("/dashboard")}
                color='rgba(255, 255, 255, 0.6)'
                thickness={1}
                className='w-full'
              >
                Go to Dashboard
              </StarBorder>
            </div>
          )}

          {verificationStatus === "error" && (
            <div className='bg-black/20 border border-white/10 p-6 rounded-md text-center backdrop-blur-sm'>
              <XCircle className='h-12 w-12 text-white/80 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-white mb-2'>Verification Failed</h3>
              <p className='text-gray-100 mb-6'>{errorMessage}</p>
              <div className='space-y-4'>
                <StarBorder
                  as='button'
                  onClick={() => router.push("/dashboard")}
                  color='rgba(255, 255, 255, 0.6)'
                  thickness={1}
                  className='w-full'
                >
                  Try Again
                </StarBorder>
                <button
                  onClick={async () => {
                    try {
                      await api.post("/email/send");
                      toast.success("New verification email sent!");
                    } catch (error) {
                      toast.error(error.message || "Failed to send verification email");
                    }
                  }}
                  className='w-full py-2 px-4 border border-white/30 rounded-xl text-white hover:bg-white/10 transition-all'
                >
                  Resend Verification Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
