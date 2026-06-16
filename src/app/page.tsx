"use client";

// =============================================================================
// MediTrack Pro — marketing landing page (public, at /).
// A cinematic, scroll-driven story: problem → solution → product → proof → CTA.
// The actual app lives behind /login.
// =============================================================================

import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection, HowItWorks } from "@/components/landing/ProblemAndProcess";
import { Showcase } from "@/components/landing/Showcase";
import { MetricsSection, AIFeatures } from "@/components/landing/MetricsAndAI";
import { AnalyticsDemo } from "@/components/landing/AnalyticsDemo";
import {
  TrustSecurity,
  Testimonials,
  Awards,
} from "@/components/landing/TrustTestimonialsAwards";
import { FinalCTA, LandingFooter } from "@/components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden bg-white scroll-smooth dark:bg-[#070b18]">
      <LandingNav />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <Showcase />
      <MetricsSection />
      <AIFeatures />
      <AnalyticsDemo />
      <TrustSecurity />
      <Testimonials />
      <Awards />
      <FinalCTA />
      <LandingFooter />
    </main>
  );
}
