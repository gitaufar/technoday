import { Navbar } from "@/components/Navbar"
import { AboutSection } from "./AboutSection"
import { FeatureSection } from "./FeatureSection"
import { SolutionSection } from "./SolutionSection"
import { PricingSection } from "./PricingSection"
import { CallToActionSection } from "./CallToActionSection"
import { FooterSection } from "./FooterSection"

export const LandingPage = () => {
  return (
    <main className="flex flex-col">
      <Navbar />
      <AboutSection />
      <FeatureSection />
      <SolutionSection />
      <PricingSection />
      <CallToActionSection />
      <FooterSection />
    </main>
  )
}
