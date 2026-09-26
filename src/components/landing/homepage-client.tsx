"use client";

import React from "react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroShowcase } from "@/components/landing/hero-showcase";
import { RoleStrip } from "@/components/landing/role-strip";
import { InteractiveDemo } from "@/components/landing/interactive-demo";
import { ConnectedWorkflows } from "@/components/landing/connected-workflows";
import { ProductPillars } from "@/components/landing/product-pillars";
import { InstitutionTypes } from "@/components/landing/institution-types";
import { TimelineTour } from "@/components/landing/timeline-tour";
import { SecuritySection } from "@/components/landing/security-section";
import { OnboardingSteps } from "@/components/landing/onboarding-steps";
import { LandingFooter } from "@/components/landing/landing-footer";

export function HomepageClient() {
  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#171614] font-sans selection:bg-[#171614] selection:text-[#F7F4ED] antialiased">
      {/* 1. Sticky Navigation */}
      <LandingNavbar />

      <main>
        {/* 2. Hero Statement & High-Fidelity Product Showcase (Direct Quick Task trigger built-in) */}
        <HeroShowcase />

        {/* 3. One Platform. Every Role. (1-Click Instant Demo Launchers) */}
        <RoleStrip />

        {/* 4. Interactive Live Role Sandbox Demo */}
        <InteractiveDemo />

        {/* 5. See How Nexora Connects the Entire Institution (4-Step Cascading Chain) */}
        <ConnectedWorkflows />

        {/* 6. Core Product Pillars with Live Status Badges */}
        <ProductPillars />

        {/* 7. K-12 Schools vs Higher Education Colleges Dynamic Architecture */}
        <InstitutionTypes />

        {/* 8. A Day with Nexora Operational Timeline */}
        <TimelineTour />

        {/* 9. Enterprise Security & Multi-Tenant Data Isolation */}
        <SecuritySection />

        {/* 10. Rapid Onboarding & Go-Live Steps */}
        <OnboardingSteps />
      </main>

      {/* 11. High-Impact Final CTA & Directory Footer */}
      <LandingFooter />
    </div>
  );
}

