import MagicBento from "./MagicBento";
import { useState } from "react";
import { BarChart3, Search, Zap, FileText, Users, LineChart } from "lucide-react";

// Enhanced SEO feature data with icons and interactive content
const seoFeatureData = [
  {
    color: "#000000",
    title: "Precision Analysis",
    description: "Sophisticated technical evaluation with proprietary algorithms for unmatched accuracy.",

    customContent: (
      <div className='mt-3 pt-2 border-t border-white/10'>
        {/* Analysis Depth Metrics */}
        <div className='mb-3'>
          <div className='flex items-center justify-between text-xs mb-2'>
            <span>Crawl Depth</span>
            <span className='font-semibold text-blue-400'>Unlimited</span>
          </div>
          <div className='w-full bg-white/10 h-1.5 rounded-full mt-1 overflow-hidden'>
            <div className='bg-blue-400 h-full rounded-full' style={{ width: "92%" }}></div>
          </div>
        </div>

        {/* Analysis Coverage Chart */}
        <div className='mb-3'>
          <div className='text-xs mb-2 opacity-80'>Analysis Coverage</div>
          <div className='flex items-end gap-1 h-8'>
            {[85, 92, 88, 95, 98, 96, 100, 100, 100, 100].map((height, i) => (
              <div
                key={i}
                className='flex-1 bg-gradient-to-t from-blue-600/60 to-blue-400/60 rounded-sm transition-all duration-300 hover:from-blue-500/80 hover:to-blue-300/80'
                style={{ height: `${height}%` }}
                title={`Page ${i + 1}: ${height}% coverage`}
              ></div>
            ))}
          </div>
        </div>

        {/* Technical Metrics */}
        <div className='grid grid-cols-2 gap-2 text-[10px]'>
          <div className='text-center'>
            <div className='font-semibold text-blue-400'>2,847</div>
            <div className='opacity-70'>Pages Analyzed</div>
          </div>
          <div className='text-center'>
            <div className='font-semibold text-green-400'>99.2%</div>
            <div className='opacity-70'>Accuracy Rate</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    color: "#000000",
    title: "Bespoke Reporting",
    description: "Elegantly designed documents featuring your brand identity and custom insights.",

    customContent: (
      <div className='mt-3 pt-2 border-t border-white/10'>
        {/* Report Format Tags */}
        <div className='flex flex-wrap gap-1.5 mb-3'>
          <span className='px-2 py-0.5 bg-white/10 rounded-full text-[10px]'>PDF</span>
          <span className='px-2 py-0.5 bg-white/10 rounded-full text-[10px]'>Interactive</span>
          <span className='px-2 py-0.5 bg-white/10 rounded-full text-[10px]'>White Label</span>
          <span className='px-2 py-0.5 bg-white/10 rounded-full text-[10px]'>Branded</span>
        </div>

        {/* Report Generation Stats */}
        <div className='mb-3'>
          <div className='text-xs mb-2 opacity-80'>Report Generation</div>
          <div className='flex items-end gap-1 h-6'>
            {[45, 52, 48, 65, 78, 72, 85, 88, 92, 95].map((height, i) => (
              <div
                key={i}
                className='flex-1 bg-gradient-to-t from-purple-600/60 to-purple-400/60 rounded-sm transition-all duration-300 hover:from-purple-500/80 hover:to-purple-300/80'
                style={{ height: `${height}%` }}
                title={`Week ${i + 1}: ${height} reports`}
              ></div>
            ))}
          </div>
        </div>

        {/* Report Metrics */}
        <div className='grid grid-cols-2 gap-2 text-[10px]'>
          <div className='text-center'>
            <div className='font-semibold text-purple-400'>24h</div>
            <div className='opacity-70'>Avg. Generation</div>
          </div>
          <div className='text-center'>
            <div className='font-semibold text-green-400'>98%</div>
            <div className='opacity-70'>Client Satisfaction</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    color: "#000000",
    title: "Performance Metrics",
    description: "Comprehensive analytics dashboard tracking improvements with detailed visualization.",
    label: "Intelligence",

    stats: "40+ metrics tracked",
    customContent: (
      <div className='mt-3 pt-2 border-t border-white/10'>
        {/* Core Performance Metrics */}
        <div className='grid grid-cols-2 gap-2 text-xs mb-3'>
          <div>
            <div className='flex justify-between'>
              <span>Speed</span>
              <span className='font-semibold text-green-400'>99%</span>
            </div>
            <div className='w-full bg-white/10 h-1 rounded-full mt-1'>
              <div className='bg-green-400 h-full rounded-full' style={{ width: "99%" }}></div>
            </div>
          </div>
          <div>
            <div className='flex justify-between'>
              <span>SEO</span>
              <span className='font-semibold text-green-400'>98%</span>
            </div>
            <div className='w-full bg-white/10 h-1 rounded-full mt-1'>
              <div className='bg-green-400 h-full rounded-full' style={{ width: "98%" }}></div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Chart */}
        <div className='mb-3'>
          <div className='text-xs mb-2 opacity-80'>Performance Trends (30 days)</div>
          <div className='flex items-end gap-1 h-12'>
            {[320, 380, 350, 420, 450, 430, 480, 500, 495, 500, 485, 470].map((height, i) => (
              <div
                key={i}
                className='flex-1 bg-gradient-to-t from-green-600/60 to-green-400/60 rounded-sm transition-all duration-300 hover:from-green-500/80 hover:to-green-300/80'
                style={{ height: `${(height / 500) * 100}%` }}
                title={`Day ${i + 1}: ${height}`}
              ></div>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className='grid grid-cols-3 gap-1 text-[10px] mb-3'>
          <div className='text-center'>
            <div className='font-semibold text-green-400'>485</div>
            <div className='opacity-70'>Score</div>
          </div>
          <div className='text-center'>
            <div className='font-semibold text-blue-400'>500</div>
            <div className='opacity-70'>Max Score</div>
          </div>
          <div className='text-center'>
            <div className='font-semibold text-purple-400'>A+</div>
            <div className='opacity-70'>Grade</div>
          </div>
        </div>

        {/* Advanced Performance Breakdown */}
        <div className='mb-3'>
          <div className='text-xs mb-2 opacity-80'>Performance Breakdown</div>
          <div className='space-y-1'>
            <div className='flex justify-between items-center text-[10px]'>
              <span>Core Web Vitals</span>
              <span className='text-green-400 font-semibold'>98%</span>
            </div>
            <div className='flex justify-between items-center text-[10px]'>
              <span>Accessibility</span>
              <span className='text-blue-400 font-semibold'>96%</span>
            </div>
            <div className='flex justify-between items-center text-[10px]'>
              <span>Best Practices</span>
              <span className='text-purple-400 font-semibold'>100%</span>
            </div>
            <div className='flex justify-between items-center text-[10px]'>
              <span>SEO Optimization</span>
              <span className='text-yellow-400 font-semibold'>94%</span>
            </div>
          </div>
        </div>

        {/* Real-time Monitoring */}
        <div className='mb-3'>
          <div className='text-xs mb-2 opacity-80'>Real-time Monitoring</div>
          <div className='flex items-center justify-between text-[10px]'>
            <div className='flex items-center gap-1'>
              <div className='w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse'></div>
              <span>Live Status</span>
            </div>
            <span className='text-green-400 font-semibold'>Active</span>
          </div>
          <div className='flex items-center justify-between text-[10px] mt-1'>
            <span>Uptime</span>
            <span className='text-blue-400 font-semibold'>99.9%</span>
          </div>
        </div>

        {/* Performance Insights */}
        <div className='text-xs mb-2 opacity-80'>Performance Insights</div>
        <div className='grid grid-cols-2 gap-2 text-[10px]'>
          <div className='text-center'>
            <div className='font-semibold text-green-400'>2.3s</div>
            <div className='opacity-70'>Avg Response</div>
          </div>
          <div className='text-center'>
            <div className='font-semibold text-blue-400'>847</div>
            <div className='opacity-70'>Requests/min</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    color: "#000000",
    title: "Executive Summaries",
    description: "Sophisticated yet accessible recommendations tailored for decision-maker comprehension.",
    label: "Clarity",
    stats: "5-minute briefings",
    customContent: (
      <div className='mt-3 pt-2 border-t border-white/10'>
        {/* Issue Priority Breakdown */}
        <div className='mb-3'>
          <div className='flex items-center gap-1 text-xs mb-2'>
            <div className='w-2 h-2 bg-red-400 rounded-full'></div>
            <span>Critical Issues</span>
            <span className='ml-auto font-semibold text-red-400'>12%</span>
          </div>
          <div className='flex items-center gap-1 text-xs mb-2'>
            <div className='w-2 h-2 bg-yellow-400 rounded-full'></div>
            <span>Warnings</span>
            <span className='ml-auto font-semibold text-yellow-400'>28%</span>
          </div>
          <div className='flex items-center gap-1 text-xs mb-2'>
            <div className='w-2 h-2 bg-green-400 rounded-full'></div>
            <span>Opportunities</span>
            <span className='ml-auto font-semibold text-green-400'>60%</span>
          </div>
        </div>

        {/* Priority Distribution Chart */}
        <div className='mb-3'>
          <div className='text-xs mb-2 opacity-80'>Priority Distribution</div>
          <div className='flex items-end gap-1 h-6'>
            <div
              className='flex-1 bg-gradient-to-t from-red-600/60 to-red-400/60 rounded-sm'
              style={{ height: "40%" }}
              title='Critical: 12%'
            ></div>
            <div
              className='flex-1 bg-gradient-to-t from-yellow-600/60 to-yellow-400/60 rounded-sm'
              style={{ height: "70%" }}
              title='Warnings: 28%'
            ></div>
            <div
              className='flex-1 bg-gradient-to-t from-green-600/60 to-green-400/60 rounded-sm'
              style={{ height: "100%" }}
              title='Opportunities: 60%'
            ></div>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className='grid grid-cols-2 gap-2 text-[10px]'>
          <div className='text-center'>
            <div className='font-semibold text-yellow-400'>5min</div>
            <div className='opacity-70'>Avg. Read Time</div>
          </div>
          <div className='text-center'>
            <div className='font-semibold text-blue-400'>95%</div>
            <div className='opacity-70'>Clarity Score</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    color: "#000000",
    title: "Portfolio Management",
    description: "Enterprise-grade platform for managing multiple client accounts with granular controls.",

    customContent: (
      <div className='mt-3 pt-2 border-t border-white/10'>
        {/* Client Portfolio Stats */}
        <div className='mb-3'>
          <div className='flex justify-between text-xs mb-2'>
            <div className='flex items-center gap-1'>
              <div className='w-1.5 h-1.5 bg-pink-400 rounded-full'></div>
              <span>Active Clients</span>
            </div>
            <span className='font-semibold text-pink-400'>128</span>
          </div>
          <div className='flex justify-between text-xs mb-2'>
            <div className='flex items-center gap-1'>
              <div className='w-1.5 h-1.5 bg-blue-400 rounded-full'></div>
              <span>Reports Generated</span>
            </div>
            <span className='font-semibold text-blue-400'>3,241</span>
          </div>
        </div>

        {/* Portfolio Growth Chart */}
        <div className='mb-3'>
          <div className='text-xs mb-2 opacity-80'>Portfolio Growth</div>
          <div className='flex items-end gap-1 h-6'>
            {[25, 32, 28, 45, 58, 52, 68, 75, 82, 88, 95, 100].map((height, i) => (
              <div
                key={i}
                className='flex-1 bg-gradient-to-t from-pink-600/60 to-pink-400/60 rounded-sm transition-all duration-300 hover:from-pink-500/80 hover:to-pink-300/80'
                style={{ height: `${height}%` }}
                title={`Month ${i + 1}: ${height} clients`}
              ></div>
            ))}
          </div>
        </div>

        {/* Management Metrics */}
        <div className='grid grid-cols-2 gap-2 text-[10px]'>
          <div className='text-center'>
            <div className='font-semibold text-pink-400'>24/7</div>
            <div className='opacity-70'>Monitoring</div>
          </div>
          <div className='text-center'>
            <div className='font-semibold text-green-400'>99.8%</div>
            <div className='opacity-70'>Uptime</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    color: "#000000",
    title: "Strategic Investment",
    description: "Tiered service offerings designed to scale with your agency's growth trajectory.",
    label: "Value",
    icon: <LineChart className='w-8 h-8 text-blue-400 mb-3' />,
    stats: "3x ROI average",
    customContent: (
      <div className='mt-3 pt-2 border-t border-white/10'>
        {/* ROI Performance Chart */}
        <div className='mb-3'>
          <div className='text-xs mb-2 opacity-80'>ROI Growth (12 months)</div>
          <div className='flex items-end gap-1 h-10'>
            {[120, 135, 142, 158, 175, 168, 195, 208, 225, 240, 255, 280].map((height, i) => (
              <div
                key={i}
                className='flex-1 bg-gradient-to-t from-blue-600/60 to-blue-400/60 rounded-sm transition-all duration-300 hover:from-blue-500/80 hover:to-blue-300/80'
                style={{ height: `${(height / 280) * 100}%` }}
                title={`Month ${i + 1}: ${height}% ROI`}
              ></div>
            ))}
          </div>
        </div>

        {/* Revenue Impact Metrics */}
        <div className='grid grid-cols-2 gap-2 text-xs mb-3'>
          <div>
            <div className='flex justify-between'>
              <span>Cost Savings</span>
              <span className='text-green-400 font-semibold'>$47K</span>
            </div>
            <div className='w-full bg-white/10 h-1 rounded-full mt-1'>
              <div className='bg-green-400 h-full rounded-full' style={{ width: "85%" }}></div>
            </div>
          </div>
          <div>
            <div className='flex justify-between'>
              <span>Revenue Growth</span>
              <span className='text-blue-400 font-semibold'>+156%</span>
            </div>
            <div className='w-full bg-white/10 h-1 rounded-full mt-1'>
              <div className='bg-blue-400 h-full rounded-full' style={{ width: "92%" }}></div>
            </div>
          </div>
        </div>

        {/* Investment Tiers */}
        <div className='text-xs mb-2 opacity-80'>Investment Tiers</div>
        <div className='space-y-1'>
          <div className='flex justify-between items-center text-[10px]'>
            <span>Starter</span>
            <span className='text-green-400'>$299/mo</span>
            <div className='w-8 h-1 bg-white/10 rounded-full'>
              <div className='w-2 h-full bg-green-400 rounded-full'></div>
            </div>
          </div>
          <div className='flex justify-between items-center text-[10px]'>
            <span>Professional</span>
            <span className='text-blue-400'>$799/mo</span>
            <div className='w-8 h-1 bg-white/10 rounded-full'>
              <div className='w-5 h-full bg-blue-400 rounded-full'></div>
            </div>
          </div>
          <div className='flex justify-between items-center text-[10px]'>
            <span>Enterprise</span>
            <span className='text-purple-400'>$1,999/mo</span>
            <div className='w-8 h-1 bg-white/10 rounded-full'>
              <div className='w-full h-full bg-purple-400 rounded-full'></div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

const FeaturesBento = (props) => {
  // Custom renderer for the card content
  const renderCustomCard = (card, index) => {
    const baseClassName = `card flex flex-col justify-between relative aspect-[4/3] min-h-[200px] w-full max-w-full p-5 rounded-[20px] border border-solid font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.05)] backdrop-blur-sm card--border-glow`;

    const cardStyle = {
      backgroundColor: "rgba(0,0,0,0.2)",
      borderColor: "rgba(255,255,255,0.1)",
      color: "white",
    };

    return (
      <div key={index} className={baseClassName} style={cardStyle}>
        <div className='card__header flex justify-between gap-3 relative text-white'>
          <span className='card__label text-base'>{card.label}</span>
          <span className='text-xs opacity-80'>{card.stats}</span>
        </div>
        <div className='card__content flex flex-col relative text-white'>
          {card.icon}
          <h3 className='card__title font-normal text-base m-0 mb-1'>{card.title}</h3>
          <p className='card__description text-xs leading-5 opacity-90'>{card.description}</p>
          {card.customContent}
        </div>
      </div>
    );
  };

  return (
    <MagicBento
      cardData={seoFeatureData}
      glowColor='255, 255, 255'
      enableTilt={true}
      enableMagnetism={true}
      clickEffect={true}
      enableSpotlight={true}
      customCardRenderer={renderCustomCard}
      {...props}
    />
  );
};

export default FeaturesBento;
