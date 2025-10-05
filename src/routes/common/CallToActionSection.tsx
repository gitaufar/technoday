export const CallToActionSection = () => {
  return (
    <section id="get-started" className="relative bg-[#4376C6] py-16 sm:py-20 scroll-mt-24">
      <div
        className="animate-float-slow pointer-events-none absolute top-1/2 left-[-22vw] sm:left-[-14vw] lg:left-[-6vw] -translate-y-1/2 w-[560px] sm:w-[760px] lg:w-[72vw] xl:w-[58vw] 2xl:w-[50vw]"
      >
        <div className="absolute inset-0 rounded-full bg-white/55 blur-[260px] opacity-90" />
        <img
          src="/landingpage/bubble.svg"
          alt="floating bubble"
          className="relative w-full mix-blend-screen opacity-95 drop-shadow-[0_0_160px_rgba(255,255,255,0.5)]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to Optimize Your Contracts?
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg">
          Join thousands of businesses already using OptiMind to streamline their contract management process.
        </p>
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="rounded-lg bg-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(249,115,22,0.35)] transition-colors duration-200 hover:bg-orange-600"
          >
            Try OptiMind Now
          </button>
        </div>
      </div>
    </section>
  )
}



