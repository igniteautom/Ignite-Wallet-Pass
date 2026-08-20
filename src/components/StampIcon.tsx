import React from 'react';
import { Coffee, Pizza, Utensils, Star, Flame, Sparkles, Heart, Beer, CupSoda, Croissant, Cog, Cpu, Zap } from 'lucide-react';
import { StampIconType } from '../types';
import { AutomationsIgniteLogo } from './AutomationsIgniteLogo';

interface StampIconProps {
  type: StampIconType;
  className?: string;
  size?: number;
}

export const StampIcon: React.FC<StampIconProps> = ({ type, className = 'w-6 h-6', size }) => {
  switch (type) {
    case 'ignite':
      return <AutomationsIgniteLogo size={size || 22} className={className} withGlow={false} />;
    case 'gear':
      return <Cog className={className} size={size} />;
    case 'circuit':
      return <Cpu className={className} size={size} />;
    case 'coffee':
      return <Coffee className={className} size={size} />;
    case 'pizza':
      return <Pizza className={className} size={size} />;
    case 'croissant':
      return <Croissant className={className} size={size} />;
    case 'utensils':
      return <Utensils className={className} size={size} />;
    case 'cup-soda':
      return <CupSoda className={className} size={size} />;
    case 'star':
      return <Star className={className} size={size} />;
    case 'flame':
      return <Flame className={className} size={size} />;
    case 'sparkles':
      return <Sparkles className={className} size={size} />;
    case 'heart':
      return <Heart className={className} size={size} />;
    case 'beer':
      return <Beer className={className} size={size} />;
    default:
      return <Zap className={className} size={size} />;
  }
};

