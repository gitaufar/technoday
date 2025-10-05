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
      <div className="pointer-events-none absolute right-[-140px] top-[-160px] h-[420px] w-[420px] rounded-full bg-blue-200/30 blur-[120px]" />
      <div className="pointer-events-none absolute right-[120px] top-10 h-[220px] w-[220px] rounded-full bg-blue-200/50 blur-[80px]" />
      <div className="pointer-events-none absolute right-[-60px] bottom-[-120px] h-[360px] w-[360px] rounded-full bg-slate-200/40 blur-[120px]" />
      <div className="pointer-events-none absolute left-[-180px] bottom-[-120px] h-[320px] w-[320px] rounded-full bg-blue-100/30 blur-[120px]" />

      <img
        src="/landingpage/bubble.svg"
        alt="floating bubbles"
        className="pointer-events-none absolute -top-44 right-0 w-[660px] max-w-none translate-x-1/4"
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

