import { Github, Linkedin, Twitter } from "lucide-react"

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Security", href: "#security" },
  { label: "Integrations", href: "#integrations" }
]

const companyLinks = [
  { label: "About Us", href: "#about" },
  { label: "Careers", href: "#careers" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" }
]

const socials = [
  { label: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com" },
  { label: "GitHub", icon: Github, href: "https://github.com" },
  { label: "Twitter", icon: Twitter, href: "https://twitter.com" }
]

export const FooterSection = () => {
  return (
    <footer className="relative overflow-hidden bg-[#0b1424] text-slate-300">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr_1fr_0.8fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <img src="/logo_optimind.svg" alt="OptiMind logo" className="h-10 w-10" />
              <span className="text-xl font-semibold text-white">OptiMind</span>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              AI-powered contract management for modern businesses
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Product</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              {productLinks.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="transition-colors duration-200 hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Company</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              {companyLinks.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="transition-colors duration-200 hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Connect</h3>
            <div className="mt-5 flex gap-4">
              {socials.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121c30] text-slate-300 transition-transform duration-200 hover:-translate-y-1 hover:text-white"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/5 pt-8 text-center text-xs text-slate-500">
          © 2025 OptiMind. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
