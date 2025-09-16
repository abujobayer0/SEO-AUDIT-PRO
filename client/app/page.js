"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";
import FeaturesBento from "../components/FeaturesBento";
import StarBorder from "../components/StarBorder";
import TrueFocus from "../components/TrueFocus";
import ScrollReveal from "../components/ScrollReveal";
import SpotlightCard from "../components/SpotlightCard";
import ShinyText from "../components/ShinyText";
import CircularGallery from "../components/CircularGallery";
import RippleGrid from "../components/RippleGrid";
import Threads from "@/components/Threads";
import Galaxy from "@/components/Galaxy";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAudit = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    setIsLoading(true);

    try {
      // For demo purposes, redirect to dashboard
      // In real implementation, you'd perform the audit here
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to perform audit");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen w-full bg-black flex flex-col items-center'>
      {/* Header */}
      <header className='bg-black/30 backdrop-blur-md w-[90%] rounded-full absolute shadow-xl border border-white/10 top-4 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center'>
              <BarChart3 className='h-8 w-8 text-white' />
              <span className='ml-2 text-xl font-bold text-white'>SEO Audit Pro</span>
            </div>
            <div className='flex space-x-4'>
              <button
                onClick={() => router.push("/login")}
                className='px-4 py-2 rounded-full text-white border border-white/20 hover:border-white/50 transition-all'
              >
                Sign In
              </button>
              <StarBorder onClick={() => router.push("/register")} color='rgba(255, 255, 255, 0.6)' thickness={1}>
                Begin Experience
              </StarBorder>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='py-20 w-full mx-auto pt-0 relative h-screen'>
        <div className='absolute inset-0 w-full h-full'>
          {/* <LiquidEther colors={["#0c8aed", "#0077ff", "#002952"]} />
           */}
          <Threads amplitude={1} distance={0} enableMouseInteraction={true} />
        </div>
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10'>
            <h1 className='text-5xl md:text-7xl font-bold text-white mb-8'>
              <span className='text-gradient-blue'>Audit Pro</span>
              <div className='my-6'>
                <TrueFocus
                  sentence='Close Clients Faster'
                  blurAmount={3}
                  borderColor='#ffffff'
                  glowColor='rgba(255, 255, 255, 0.6)'
                  animationDuration={0.7}
                  pauseBetweenAnimations={2}
                />
              </div>
              <span className='block text-white'>With White‑Label SEO Reports</span>
            </h1>
            <p className='text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl mx-auto leading-relaxed'>
              Turn quick audits into signed proposals. Build <ShinyText text='beautiful, data‑driven' className='font-semibold' speed={7} />{" "}
              reports in minutes—fully branded, easy to understand, and ready to send.
            </p>
            {/* Quick Audit Form */}
            <div className='max-w-2xl mx-auto'>
              <form onSubmit={handleAudit} className='flex gap-4 w-full'>
                <div className='flex-1'>
                  <input
                    type='url'
                    placeholder='Paste a website URL (e.g., https://example.com)'
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className='w-full bg-gray-900/30 border border-white/20 focus:border-white text-white rounded-xl py-4 px-6 text-lg outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-lg backdrop-blur-sm'
                    disabled={isLoading}
                  />
                </div>
                <StarBorder
                  as='button'
                  type='submit'
                  disabled={isLoading}
                  color='rgba(255, 255, 255, 0.6)'
                  thickness={1}
                  className='px-8 text-lg'
                >
                  {isLoading ? (
                    <div className='flex items-center'>
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                      Analyzing...
                    </div>
                  ) : (
                    <div className='flex items-center'>
                      <Search className='h-5 w-5 mr-2' />
                      Run Free Audit
                    </div>
                  )}
                </StarBorder>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* About Section with ScrollReveal */}
      <section className='py-32 w-full'>
        <div className='max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='items-center'>
            <div className='space-y-12'>
              <ScrollReveal
                baseOpacity={0}
                enableBlur={true}
                baseRotation={3}
                blurStrength={8}
                containerClassName='mb-8'
                textClassName='text-white text-2xl font-light'
              >
                Win trust in the first meeting. Deliver executive‑ready audits with your branding—not ours.
              </ScrollReveal>

              <ScrollReveal
                baseOpacity={0}
                enableBlur={true}
                baseRotation={3}
                blurStrength={8}
                containerClassName='mb-8'
                textClassName='text-gray-100 text-2xl font-light'
              >
                Cut through jargon. Show site health, growth levers, and exactly what to do next.
              </ScrollReveal>

              <ScrollReveal
                baseOpacity={0}
                enableBlur={true}
                baseRotation={3}
                blurStrength={8}
                containerClassName='mb-8'
                textClassName='text-white text-2xl font-light'
              >
                Pair technical fixes with content wins and a clear roadmap—so clients say yes.
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Circular Gallery Section */}
      <section className='py-24 w-full'>
        <div className='max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
              <ShinyText text='Showcase' className='font-bold' speed={8} /> Your Results
            </h2>
            <p className='text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto'>
              Everything you need to run fast audits, surface real opportunities, and present them beautifully
            </p>
          </div>
          <div className='h-[500px] w-full'>
            <CircularGallery
              items={[
                { image: "https://picsum.photos/seed/seo1/800/600", text: "Technical Audit" },
                { image: "https://picsum.photos/seed/seo2/800/600", text: "Content Analysis" },
                { image: "https://picsum.photos/seed/seo3/800/600", text: "Backlink Profile" },
                { image: "https://picsum.photos/seed/seo4/800/600", text: "Performance Metrics" },
                { image: "https://picsum.photos/seed/seo5/800/600", text: "Keyword Research" },
                { image: "https://picsum.photos/seed/seo6/800/600", text: "Competitor Analysis" },
              ]}
              bend={2}
              textColor='#ffffff'
              borderRadius={0.05}
              font='bold 24px Figtree'
              scrollSpeed={2}
              scrollEase={0.05}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-24 w-full'>
        <div className='max-w-7xl w-full mx-auto flex flex-col items-center px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
              <ShinyText text='Agency‑Grade' className='font-bold' speed={8} /> Intelligence Suite
            </h2>
            <p className='text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto'>
              Built for agencies that need fast audits, trustworthy data, and presentation‑ready output
            </p>
          </div>

          <FeaturesBento glowColor='12, 138, 237' enableTilt={true} enableMagnetism={true} clickEffect={true} enableSpotlight={true} />
        </div>
      </section>

      {/* Pricing Section */}
      <section className='py-24 w-full mt-20 relative'>
        <div className='absolute inset-0 z-0'>
          <RippleGrid
            gridColor='#0077ff'
            enableRainbow={true}
            // gridColor="#ffffff"
            rippleIntensity={0.02}
            gridSize={30}
            gridThickness={30}
            mouseInteraction={true}
            mouseInteractionRadius={1.2}
            opacity={0.8}
            fadeDistance={1.2}
            vignetteStrength={1.2}
            glowIntensity={0.1}
            gridRotation={45}
          />
        </div>
        <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
              <ShinyText text='Simple' className='font-bold' speed={8} /> Pricing
            </h2>
            <p className='text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto'>
              Start free. Upgrade when you're closing more deals and need more scale.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8 mt-12'>
            <SpotlightCard
              className='text-center bg-black/10 backdrop-blur-md border border-white/10 rounded-xl'
              spotlightColor='rgba(255, 255, 255, 0.2)'
            >
              <h3 className='text-2xl font-bold mb-2 text-white'>Starter</h3>
              <div className='text-4xl font-bold text-white mb-4'>$0</div>
              <p className='text-gray-100 mb-6'>For testing and side projects</p>
              <ul className='text-left space-y-3 mb-8 text-gray-100'>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-white rounded-full mr-3'></div>5 monthly audits
                </li>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-white rounded-full mr-3'></div>
                  Core technical checks
                </li>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-white rounded-full mr-3'></div>
                  Instant share links
                </li>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-white rounded-full mr-3'></div>
                  Community support
                </li>
              </ul>
              <StarBorder as='button' className='w-full' color='rgba(255, 255, 255, 0.4)' thickness={1}>
                Get Started Free
              </StarBorder>
            </SpotlightCard>
            <div className='relative'>
              <div className='absolute -top-3 z-10 left-1/2 transform -translate-x-1/2'>
                <span className='bg-white text-black px-4 py-1 rounded-full text-sm font-medium'>Recommended</span>
              </div>
              <SpotlightCard
                className='text-center bg-black/5 backdrop-blur-lg border-2 border-white/40 rounded-xl relative'
                spotlightColor='rgba(255, 255, 255, 0.5)'
              >
                <h3 className='text-2xl font-bold mb-2 text-white'>Professional</h3>
                <div className='text-4xl font-bold text-white mb-4'>$19</div>
                <p className='text-gray-100 mb-6'>For growing agencies</p>
                <ul className='text-left space-y-3 mb-8 text-gray-100'>
                  <li className='flex items-center'>
                    <div className='w-2 h-2 bg-white rounded-full mr-3'></div>
                    50 monthly audits
                  </li>
                  <li className='flex items-center'>
                    <div className='w-2 h-2 bg-white rounded-full mr-3'></div>
                    <ShinyText text='Advanced insights' speed={6} />
                  </li>
                  <li className='flex items-center'>
                    <div className='w-2 h-2 bg-white rounded-full mr-3'></div>
                    Branded PDF reports
                  </li>
                  <li className='flex items-center'>
                    <div className='w-2 h-2 bg-white rounded-full mr-3'></div>
                    Custom logo & colors
                  </li>
                  <li className='flex items-center'>
                    <div className='w-2 h-2 bg-white rounded-full mr-3'></div>
                    Priority support
                  </li>
                </ul>
                <StarBorder as='button' className='w-full' color='rgba(255, 255, 255, 0.8)' thickness={1}>
                  Start 7‑Day Trial
                </StarBorder>
              </SpotlightCard>
            </div>

            <SpotlightCard
              className='text-center bg-black/10 backdrop-blur-md border border-white/10 rounded-xl'
              spotlightColor='rgba(255, 255, 255, 0.2)'
            >
              <h3 className='text-2xl font-bold mb-2 text-white'>Agency</h3>
              <div className='text-4xl font-bold text-white mb-4'>$49</div>
              <p className='text-gray-100 mb-6'>For established teams and brands</p>
              <ul className='text-left space-y-3 mb-8 text-gray-100'>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-white rounded-full mr-3'></div>
                  500 monthly audits
                </li>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-white rounded-full mr-3'></div>
                  <ShinyText text='All Pro features' speed={6} />
                </li>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-white rounded-full mr-3'></div>
                  Full white‑labeling
                </li>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-white rounded-full mr-3'></div>
                  API access
                </li>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-white rounded-full mr-3'></div>
                  Multi‑team collaboration
                </li>
              </ul>
              <StarBorder as='button' className='w-full' color='rgba(255, 255, 255, 0.4)' thickness={1}>
                Talk to Sales
              </StarBorder>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='relative w-full text-white backdrop-blur-md border-t flex flex-col items-center border-white/10 mt-16 overflow-hidden'>
        <div className='relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16'>
          <div className='text-center'>
            <div className='flex items-center justify-center mb-4'>
              <BarChart3 className='h-8 w-8 text-white' />
              <span className='ml-2 text-xl font-bold'>SEO Audit Pro</span>
            </div>
            <p className='text-gray-100 mb-4'>
              <ShinyText text='Premium intelligence platform' speed={7} /> for discerning agencies
            </p>
            <p className='text-gray-200 text-sm'>© 2024 SEO Audit Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
