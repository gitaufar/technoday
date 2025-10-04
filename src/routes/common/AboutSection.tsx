export const AboutSection = () => {
  return (
    <section className="bg-black/40 relative h-screen overflow-hidden">
      <img
        src="./landingpage/about_bg.jpg"
        alt="About Section Image"
        className="absolute inset-0 w-full h-full object-cover -z-10 mt-14"
      />

      <div className="absolute inset-0 bg-blue-600/50 -z-10" />

      <div className="relative z-10 flex flex-col items-center mt-16 gap-4 justify-center h-full text-white">
        <h1 className="text-center leading-none text-5.5xl font-bold">
          Smarter Contract <br />
          <span className="text-secondary">Management </span>with AI
        </h1>
        <p className="text-lg max-w-lg text-center">
          Automate, analyze, and make better business decisions with OptiMind.
          Transform your contract lifecycle with intelligent AI-powered
          insights.
        </p>
        <div className="flex gap-16 mt-6">
          <button className="cursor-pointer py-4 px-6 bg-secondary rounded-md text-xl text-white">Get Started</button>
          <button className="cursor-pointer text-secondary border border-secondary rounded-md py-4 px-6 text-lg font-medium">Learn More</button>
        </div>
      </div>
    </section>
  );
};
