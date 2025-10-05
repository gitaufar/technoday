export const AboutSection = () => {
  return (
    <section className="bg-black/40 relative h-screen overflow-hidden">
      <img
        src="./landingpage/about_bg.jpg"
        alt="About Section Image"
        className="absolute inset-0 w-full h-full object-cover -z-10 mt-14"
      />

      <div className="absolute inset-0 bg-blue-600/50 -z-10 animate-hero-glow" />

      <div className="relative z-10 flex flex-col items-center mt-16 gap-4 justify-center h-full text-white px-6 text-center">
        <h1 className="leading-none text-5.5xl font-bold animate-fade-in-up">
          Smarter Contract <br />
          <span className="text-secondary">Management </span>with AI
        </h1>
        <p className="text-lg max-w-xl animate-fade-in-up animate-delay-200">
          Automate, analyze, and make better business decisions with OptiMind.
          Transform your contract lifecycle with intelligent AI-powered insights.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-6 animate-fade-in-up animate-delay-400">
          <button className="cursor-pointer py-4 px-6 bg-secondary rounded-md text-xl text-white shadow-lg shadow-secondary/40 transition-transform duration-300 hover:-translate-y-1">
            Get Started
          </button>
          <button className="cursor-pointer text-secondary border border-secondary rounded-md py-4 px-6 text-lg font-medium transition-colors duration-300 hover:bg-secondary hover:text-white">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};
