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
        <div className='flex items-center justify-between text-xs'>
          <span>Crawl Depth</span>
          <span className='font-semibold'>Unlimited</span>
        </div>
        <div className='w-full bg-white/10 h-1.5 rounded-full mt-1 overflow-hidden'>
          <div className='bg-blue-400 h-full rounded-full' style={{ width: "92%" }}></div>
        </div>
      </div>
    ),
  },
  {
    color: "#000000",
    title: "Bespoke Reporting",
    description: "Elegantly designed documents featuring your brand identity and custom insights.",

    customContent: (
      <div className='mt-3 pt-2 border-t border-white/10 flex flex-wrap gap-1.5'>
        <span className='px-2 py-0.5 bg-white/10 rounded-full text-[10px]'>PDF</span>
        <span className='px-2 py-0.5 bg-white/10 rounded-full text-[10px]'>Interactive</span>
        <span className='px-2 py-0.5 bg-white/10 rounded-full text-[10px]'>White Label</span>
        <span className='px-2 py-0.5 bg-white/10 rounded-full text-[10px]'>Branded</span>
      </div>
    ),
  },
  {
    color: "#000000",
    title: "Performance Metrics",
    description: "Comprehensive analytics dashboard tracking improvements with detailed visualization.",
    label: "Intelligence",
    icon: <BarChart3 className='w-8 h-8 text-green-400 mb-3' />,
    stats: "40+ metrics tracked",
    customContent: (
      <div className='mt-3 pt-2 border-t border-white/10'>
        <div className='grid grid-cols-2 gap-2 text-xs'>
          <div>
            <div className='flex justify-between'>
              <span>Speed</span>
              <span>94%</span>
            </div>
            <div className='w-full bg-white/10 h-1 rounded-full mt-1'>
              <div className='bg-green-400 h-full rounded-full' style={{ width: "94%" }}></div>
            </div>
          </div>
          <div>
            <div className='flex justify-between'>
              <span>SEO</span>
              <span>87%</span>
            </div>
            <div className='w-full bg-white/10 h-1 rounded-full mt-1'>
              <div className='bg-green-400 h-full rounded-full' style={{ width: "87%" }}></div>
            </div>
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
    icon: <Zap className='w-8 h-8 text-yellow-400 mb-3' />,
    stats: "5-minute briefings",
    customContent: (
      <div className='mt-3 pt-2 border-t border-white/10'>
        <div className='flex items-center gap-1 text-xs'>
          <div className='w-2 h-2 bg-red-400 rounded-full'></div>
          <span>Critical Issues</span>
          <span className='ml-auto'>12%</span>
        </div>
        <div className='flex items-center gap-1 text-xs mt-1'>
          <div className='w-2 h-2 bg-yellow-400 rounded-full'></div>
          <span>Warnings</span>
          <span className='ml-auto'>28%</span>
        </div>
        <div className='flex items-center gap-1 text-xs mt-1'>
          <div className='w-2 h-2 bg-green-400 rounded-full'></div>
          <span>Opportunities</span>
          <span className='ml-auto'>60%</span>
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
        <div className='flex justify-between text-xs'>
          <div className='flex items-center gap-1'>
            <div className='w-1.5 h-1.5 bg-pink-400 rounded-full'></div>
            <span>Active</span>
          </div>
          <span>128 clients</span>
        </div>
        <div className='flex justify-between text-xs mt-1.5'>
          <div className='flex items-center gap-1'>
            <div className='w-1.5 h-1.5 bg-blue-400 rounded-full'></div>
            <span>Reports</span>
          </div>
          <span>3,241 generated</span>
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
        <div className='text-xs mb-1'>Monthly growth</div>
        <div className='flex items-end gap-1 h-8'>
          {[35, 42, 38, 50, 65, 60, 75, 78, 88, 95].map((height, i) => (
            <div
              key={i}
              className='flex-1 bg-gradient-to-t from-blue-500/50 to-blue-300/50 rounded-sm'
              style={{ height: `${height}%` }}
            ></div>
          ))}
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
