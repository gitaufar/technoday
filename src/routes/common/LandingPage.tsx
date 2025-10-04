import { Navbar } from "@/components/Navbar"
import { AboutSection } from "./AboutSection"
import { FeatureSection } from "./FeatureSection"
import { SolutionSection } from "./SolutionSection"
import { PricingSection } from "./PricingSection"

export const LandingPage = () => {
  return (
    <main className="flex flex-col">
        <Navbar />
        <AboutSection />
        <FeatureSection />
        <SolutionSection />
        <PricingSection />
    </main>
  )
}
