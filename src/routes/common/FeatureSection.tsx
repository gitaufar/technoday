import { BarChart3, Database, ShieldCheck, Workflow } from "lucide-react"

const features = [
  {
    title: "AI-Powered Risk Detection",
    description: "Automatically identify potential risks and compliance issues in your contracts with advanced AI analysis",
    accent: "bg-blue-50 text-blue-600",
    icon: ShieldCheck
  },
  {
    title: "Seamless Contract Lifecycle",
    description: "Streamline every stage from creation to renewal with automated workflows and smart notifications",
    accent: "bg-teal-50 text-teal-600",
    icon: Workflow
  },
  {
    title: "Data-Driven Insights & KPIs",
    description: "Get actionable insights with comprehensive analytics and real-time performance dashboards",
    accent: "bg-orange-50 text-orange-500",
    icon: BarChart3
  },
  {
    title: "Integrated with Supabase",
    description: "Secure, scalable cloud infrastructure ensuring your data is always protected and accessible",
    accent: "bg-indigo-50 text-indigo-600",
    icon: Database
  }
]

export const FeatureSection = () => {
  return (
    <section id="features" className="relative isolate bg-gradient-to-r from-white via-white to-blue-50/50 py-24 scroll-mt-24">
      {/* Decorative bubbles */}
      <div className="animate-float-slow pointer-events-none absolute right-[6vw] sm:right-[8vw] lg:right-[10vw] top-[-140px] sm:top-[-180px] h-[280px] w-[280px] sm:h-[380px] sm:w-[380px] lg:h-[46vw] lg:w-[46vw] xl:h-[36vw] xl:w-[36vw] rounded-full bg-blue-200/30 blur-[140px]" />
      <div className="animate-float-delayed pointer-events-none absolute right-[14vw] sm:right-[16vw] lg:right-[20vw] top-[16vh] h-[200px] w-[200px] sm:h-[260px] sm:w-[260px] lg:h-[32vw] lg:w-[32vw] xl:h-[26vw] xl:w-[26vw] rounded-full bg-blue-200/50 blur-[120px]" />
      <div className="animate-float-reverse pointer-events-none absolute right-[10vw] sm:right-[12vw] lg:right-[16vw] bottom-[-80px] sm:bottom-[-120px] h-[260px] w-[260px] sm:h-[340px] sm:w-[340px] lg:h-[36vw] lg:w-[36vw] xl:h-[30vw] xl:w-[30vw] rounded-full bg-slate-200/40 blur-[140px]" />
      <div className="animate-float-soft pointer-events-none absolute left-[-6vw] sm:left-[-2vw] lg:left-[4vw] bottom-[-80px] sm:bottom-[-120px] h-[240px] w-[240px] sm:h-[320px] sm:w-[320px] lg:h-[34vw] lg:w-[34vw] xl:h-[28vw] xl:w-[28vw] rounded-full bg-blue-100/30 blur-[140px]" />

      <img
        src="/landingpage/bubble.svg"
        alt="floating bubbles"
        className="animate-orbit pointer-events-none absolute -top-48 right-[-6vw] w-[90vw] max-w-[960px]"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-5 flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2">
            <h2 className="text-4xl font-bold tracking-tight text-orange-500 sm:text-5xl">Powerful Features</h2>
            <span className="text-2xl font-semibold text-slate-900 sm:text-3xl">for Modern Businesses</span>
          </div>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Experience next-generation contract management with AI-driven automation and insights
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, description, accent, icon: Icon }) => (
            <div
              key={title}
              className="group relative rounded-3xl border border-slate-100/80 bg-white/90 p-8 shadow-lg shadow-slate-200/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-300/60"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white via-white to-blue-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${accent}`}>
                  <Icon className="h-8 w-8" strokeWidth={1.6} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600">{title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


