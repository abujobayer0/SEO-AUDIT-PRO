import React from "react";
import { BRAND } from "@/lib/brand";

const Logo = ({ size = 28, showText = true }) => {
  const gradientId = "brand-gradient";
  return (
    <div className='flex items-center select-none'>
      <svg width={size} height={size} viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' aria-label={`${BRAND.name} logo`}>
        <defs>
          <linearGradient id={gradientId} x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor={BRAND.colors.primary} />
            <stop offset='50%' stopColor={BRAND.colors.accent} />
            <stop offset='100%' stopColor={BRAND.colors.primaryDark} />
          </linearGradient>
        </defs>
        <rect x='4' y='4' width='40' height='40' rx='10' fill={`url(#${gradientId})`} />
        <path d='M14 30c6-2 10-6 12-12 2 6 6 10 12 12' stroke='white' strokeWidth='3' strokeLinecap='round' fill='none' />
      </svg>
      {showText && <span className='ml-2 font-bold tracking-tight text-white'>{BRAND.name}</span>}
    </div>
  );
};

export default Logo;
