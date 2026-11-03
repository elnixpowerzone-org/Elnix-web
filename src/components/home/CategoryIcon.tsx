import React from 'react';
import {
  BatteryCharging,
  Zap,
  SunMedium,
  Droplets,
  Flame,
  Power,
  Wrench,
  Bath,
  Layers,
  Sparkles,
} from 'lucide-react';

interface CategoryIconProps {
  icon?: string;
  name?: string;
  className?: string;
}

export default function CategoryIcon({ icon, name = '', className = 'w-5 h-5 text-sky-600' }: CategoryIconProps) {
  const normalized = (icon || '').toLowerCase();
  const nameNorm = name.toLowerCase();

  if (normalized === 'battery' || nameNorm.includes('batter')) {
    return <BatteryCharging className={className} />;
  }
  if (normalized === 'zap' || nameNorm.includes('invert') || nameNorm.includes('ups')) {
    return <Zap className={className} />;
  }
  if (normalized === 'sun' || nameNorm.includes('solar')) {
    return <SunMedium className={className} />;
  }
  if (normalized === 'droplet' || normalized === 'droplets' || nameNorm.includes('pump')) {
    return <Droplets className={className} />;
  }
  if (normalized === 'flame' || nameNorm.includes('heater') || nameNorm.includes('geyser') || nameNorm.includes('heat')) {
    return <Flame className={className} />;
  }
  if (normalized === 'plug' || normalized === 'power' || nameNorm.includes('elect')) {
    return <Power className={className} />;
  }
  if (normalized === 'wrench' || nameNorm.includes('plumb') || nameNorm.includes('pipe')) {
    return <Wrench className={className} />;
  }
  if (normalized === 'bath' || nameNorm.includes('sanit') || nameNorm.includes('bath')) {
    return <Bath className={className} />;
  }
  if (normalized === 'sparkles') {
    return <Sparkles className={className} />;
  }

  return <Layers className={className} />;
}

