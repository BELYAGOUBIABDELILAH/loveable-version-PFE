/**
 * ParticleHero Component - Google Antigravity Design System
 * Requirements: 20.7
 * - Blue particle background (#4285F4) with subtle animation
 * - Centered headline with dual CTA buttons
 * - Black primary button, light grey secondary button
 */

import Particles from '@tsparticles/react';
import type { ISourceOptions } from '@tsparticles/engine';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ParticleHeroProps {
  title?: string;
  subtitle?: string;
  primaryCTA?: {
    label: string;
    href: string;
  };
  secondaryCTA?: {
    label: string;
    href: string;
  };
}

// Particle configuration - Google Blue (#4285F4) with subtle animation
const particleOptions: ISourceOptions = {
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: 'repulse',
      },
      resize: {
        enable: true,
      },
    },
    modes: {
      repulse: {
        distance: 100,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: '#4285F4', // Google Blue accent
    },
    links: {
      color: '#4285F4',
      distance: 150,
      enable: true,
      opacity: 0.3,
      width: 1,
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: {
        default: 'bounce',
      },
      random: false,
      speed: 1.5, // Subtle animation
      straight: false,
    },
    number: {
      density: {
        enable: true,
        width: 1920,
        height: 1080,
      },
      value: 60, // Number of particles
    },
    opacity: {
      value: 0.4,
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: { min: 1, max: 4 },
    },
  },
  detectRetina: true,
};

export const ParticleHero = ({
  title = 'Find Healthcare Providers Near You',
  subtitle = 'CityHealth connects you with verified healthcare providers in Sidi Bel Abbès. Search, compare, and book appointments with ease.',
  primaryCTA = { label: 'Get Started', href: '/search' },
  secondaryCTA = { label: 'Learn More', href: '/how' },
}: ParticleHeroProps) => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-white">
      {/* Particle Background */}
      <Particles
        id="tsparticles"
        particlesLoaded={async () => {}}
        options={particleOptions}
        className="absolute inset-0 z-0"
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-antigravity-primary-text mb-6 leading-tight">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-antigravity-secondary-text mb-10 max-w-2xl mx-auto">
          {subtitle}
        </p>

        {/* Dual CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Primary CTA - Black pill button */}
          <Link to={primaryCTA.href}>
            <Button
              className="bg-antigravity-button-primary text-white rounded-pill px-8 py-3 text-base font-medium shadow-soft hover:opacity-90 transition-opacity min-w-[160px]"
            >
              {primaryCTA.label}
            </Button>
          </Link>

          {/* Secondary CTA - Light grey pill button */}
          <Link to={secondaryCTA.href}>
            <Button
              variant="secondary"
              className="bg-antigravity-button-secondary text-antigravity-primary-text rounded-pill px-8 py-3 text-base font-medium shadow-soft hover:bg-gray-200 transition-colors min-w-[160px]"
            >
              {secondaryCTA.label}
            </Button>
          </Link>
        </div>
      </div>

      {/* Gradient overlay at bottom for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-5" />
    </section>
  );
};

export default ParticleHero;
