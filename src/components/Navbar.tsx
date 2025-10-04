export const Navbar = () => {
  return (
    <nav className="justify-between py-6 px-16 bg-white shadow-md flex items-center fixed top-0 w-full z-20">
      <div className="flex items-center gap-3 cursor-pointer">
        <img
          src="./logo_optimind.svg"
          alt="OptiMind Logo"
          className="h-8 w-8"
        />
        <h1 className="text-xl font-bold text-primary">OptiMind</h1>
      </div>
      <ul className="flex space-x-12 text-black text-medium font-medium">
        <div className="flex flex-col group items-center">
          <li className="cursor-pointer">Home</li>
          <div className="w-full bg-primary h-1 block scale-x-0 group-hover:scale-x-100 duration-300 origin-left transition-transform" />
        </div>
        <div className="flex flex-col group items-center">
          <li className="cursor-pointer">Features</li>
          <div className="w-full bg-primary h-1 block scale-x-0 group-hover:scale-x-100 duration-300 origin-left transition-transform" />
        </div>
        <div className="flex flex-col group items-center">
          <li className="cursor-pointer">Solutions</li>
          <div className="w-full bg-primary h-1 block scale-x-0 group-hover:scale-x-100 duration-300 origin-left transition-transform" />
        </div>
        <div className="flex flex-col group items-center">
          <li className="cursor-pointer">Pricing</li>
          <div className="w-full bg-primary h-1 block scale-x-0 group-hover:scale-x-100 duration-300 origin-left transition-transform" />
        </div>
      </ul>
      <div className="flex items-center gap-4">
        <button className="text-base font-medium text-gray-600 hover:text-gray-800 duration-300 cursor-pointer">
          Help
        </button>
        <button className="rounded-lg bg-primary px-4 py-2 text-base font-semibold text-white hover:bg-blue-700 duration-300 cursor-pointer">
          Get Started
        </button>
      </div>
    </nav>
  );
};
