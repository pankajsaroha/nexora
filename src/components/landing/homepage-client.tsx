"use client";

import React from "react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroShowcase } from "@/components/landing/hero-showcase";
import { CapabilityStrip } from "@/components/landing/capability-strip";
import { ConnectedWorkflows } from "@/components/landing/connected-workflows";
import { ProductPillars } from "@/components/landing/product-pillars";
import { InteractiveDemo } from "@/components/landing/interactive-demo";
import { TimelineTour } from "@/components/landing/timeline-tour";
import { InstitutionTypes } from "@/components/landing/institution-types";
import { SecuritySection } from "@/components/landing/security-section";
import { OnboardingSteps } from "@/components/landing/onboarding-steps";
import { LandingFooter } from "@/components/landing/landing-footer";

export function HomepageClient() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 font-sans selection:bg-slate-900 selection:text-white antialiased">
      {/* 1. Sticky Navigation */}
      <LandingNavbar />

      <main>
        {/* 2. Hero Statement & Product Showcase */}
        <HeroShowcase />

        {/* 3. Capability Breadth Strip */}
        <CapabilityStrip />

        {/* 4. Connected Workflows & Multi-Step Data Synchronization */}
        <ConnectedWorkflows />

        {/* 5. Product Pillars (Academics, People, Operations, Finance) */}
        <ProductPillars />

        {/* 6. Interactive Role Demo (Principal, Teacher, Student, Parent) */}
        <InteractiveDemo />

        {/* 7. A Day in the Life Timeline Tour */}
        <TimelineTour />

        {/* 8. K-12 Schools vs Higher Education Colleges */}
        <InstitutionTypes />

        {/* 9. Security & Multi-Tenant Data Isolation */}
        <SecuritySection />

        {/* 10. Rapid Guided Onboarding Steps */}
        <OnboardingSteps />
      </main>

      {/* 11. High-Impact Final CTA & Directory Footer */}
      <LandingFooter />
    </div>
  );
}
