export const CallToActionSection = () => {
  return (
    <section id="get-started" className="relative overflow-hidden bg-[#4376C6] py-16 sm:py-20 scroll-mt-24">
      <img
        src="/landingpage/bubble3.svg"
        alt="floating bubbles"
        className="pointer-events-none absolute -top-40 -left-28 w-[520px] opacity-85"
      />
      <img
        src="/landingpage/bubble3.svg"
        alt="floating bubbles"
        className="pointer-events-none absolute -bottom-20 -left-16 w-[380px] opacity-70"
      />

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
