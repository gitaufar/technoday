import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" }
]

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => setIsOpen(prev => !prev)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .nav-link-hover {
          position: relative;
        }

        .nav-link-hover::before {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          border-radius: 2px;
          transition: transform 0.3s ease;
        }

        .nav-link-hover:hover::before {
          transform: translateX(-50%) scaleX(1);
        }

        .button-shimmer {
          position: relative;
          overflow: hidden;
        }

        .button-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.5s ease;
        }

        .button-shimmer:hover::before {
          left: 100%;
        }

        .mobile-menu-enter {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>

      <nav className={`fixed top-0 z-30 w-full border-b transition-all duration-500 ${
        scrolled 
          ? "border-slate-200/50 bg-white/70 backdrop-blur-xl shadow-lg shadow-slate-200/30" 
          : "border-slate-100 bg-white/90 backdrop-blur-md"
      }`}>
        <div className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-500 sm:px-8 lg:px-12 ${
          scrolled ? "py-3" : "py-5"
        }`}>
          <a href="#home" className="group flex items-center gap-3 text-slate-900" onClick={closeMenu}>
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src="./logo_optimind.svg" 
                alt="OptiMind Logo" 
                className="h-9 w-9 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" 
              />
            </div>
            <span className="text-lg font-semibold tracking-tight transition-all duration-300 group-hover:text-primary sm:text-xl">
              OptiMind
            </span>
          </a>

          <div className="hidden items-center gap-10 text-sm font-medium text-slate-600 md:flex">
            {navLinks.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                className="nav-link-hover relative transition-all duration-300 hover:text-primary hover:scale-105"
                style={{ 
                  animation: scrolled ? 'none' : `fadeInDown 0.6s ease-out ${index * 0.1}s both` 
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <a
              href="#footer"
              className="relative text-sm font-medium text-slate-600 transition-all duration-300 hover:text-slate-900 hover:scale-105"
            >
              Help
            </a>
            <a
              href="#get-started"
              className="button-shimmer rounded-lg bg-gradient-to-r from-primary to-blue-600 px-5 py-2 text-sm font-semibold text-white !text-white shadow-md shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/40"
            >
              Get Started
            </a>
          </div>

          <button
            type="button"
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:text-primary hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
          >
            <div className="relative h-5 w-5">
              <Menu className={`absolute inset-0 transition-all duration-300 ${
                isOpen ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'
              }`} />
              <X className={`absolute inset-0 transition-all duration-300 ${
                isOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'
              }`} />
            </div>
            <span className="sr-only">Toggle navigation</span>
          </button>
        </div>

        <div
          id="mobile-nav"
          className={`md:hidden ${
            isOpen ? "max-h-96 opacity-100" : "pointer-events-none max-h-0 opacity-0"
          } overflow-hidden border-t border-slate-100 bg-white/95 backdrop-blur transition-all duration-300 ease-out`}
        >
          <div className={`px-6 py-4 sm:px-8 ${isOpen ? 'mobile-menu-enter' : ''}`}>
            <ul className="flex flex-col gap-3 text-sm font-medium text-slate-700">
              {navLinks.map((link, index) => (
                <li 
                  key={link.label}
                  style={{
                    animation: isOpen ? `slideDown 0.4s ease-out ${index * 0.1}s both` : 'none'
                  }}
                >
                  <a
                    href={link.href}
                    onClick={closeMenu}
                    className="group flex items-center justify-between rounded-xl border border-transparent bg-gradient-to-r from-transparent to-transparent px-4 py-3 transition-all duration-300 hover:border-primary/30 hover:from-primary/5 hover:to-blue-500/5 hover:scale-[1.02] hover:shadow-sm"
                  >
                    <span className="transition-all duration-300 group-hover:translate-x-1">{link.label}</span>
                    <span className="text-xs text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-3">
              <a
                href="#footer"
                onClick={closeMenu}
                className="rounded-full border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:scale-[1.02] hover:shadow-sm"
              >
                Help
              </a>
              <a
                href="#get-started"
                onClick={closeMenu}
                className="button-shimmer rounded-lg bg-gradient-to-r from-primary to-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white !text-white shadow-md shadow-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/40"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}