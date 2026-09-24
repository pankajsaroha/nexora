import { Metadata } from "next";
import { StandaloneOnboarding } from "@/components/onboarding/standalone-onboarding";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Onboard Institution | NEXORA Enterprise OS",
  description: "Provision a dedicated educational institution tenancy with terms, classes, and master executive credentials.",
};

export default function OnboardingPage() {
  return <StandaloneOnboarding />;
}
