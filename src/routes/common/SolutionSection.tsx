import { CheckCircle2 } from "lucide-react"

const benefits = [
  {
    title: "40% Faster Contract Reviews",
    description: "AI-powered analysis identifies key clauses and potential issues instantly"
  },
  {
    title: "95% Risk Reduction",
    description: "Advanced compliance checking prevents costly legal oversights"
  },
  {
    title: "Enterprise-Grade Security",
    description: "Bank-level encryption and compliance with international standards"
  }
]

export const SolutionSection = () => {
  return (
    <section id="solutions" className="relative overflow-hidden bg-blue-500 py-24 scroll-mt-24">
      <img
        src="/landingpage/solution_bg.jpg"
        alt="Glass building background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/71 via-blue-400/61 to-blue-300/56" />
      <div className="absolute inset-0 bg-slate-900/12" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[48px] border border-white/20 bg-white/5 shadow-[0_40px_80px_-40px_rgba(30,64,175,0.45)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-white/3 to-transparent" />

          <div className="relative grid gap-12 px-8 py-12 sm:px-12 lg:grid-cols-[1fr_1fr] lg:py-16 xl:px-16">
            {/* Left side - Title */}
            <div className="flex items-center justify-center text-slate-900">
              <h2 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
                <div className="block">Why Choose</div>
                <div className="block text-white drop-shadow-[0_10px_40px_rgba(2,132,199,0.35)]">OptiMind for</div>
                <div className="block">Your Business?</div>
              </h2>
            </div>

            {/* Right side - Benefits */}
            <div className="space-y-8 text-slate-900">
              <p className="max-w-xl text-lg leading-relaxed text-slate-800 sm:text-xl">
                Reduce contract review time by 40% with automated AI analysis and intelligent document processing
              </p>

              <div className="space-y-6">
                {benefits.map(({ title, description }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-white flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-700">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
