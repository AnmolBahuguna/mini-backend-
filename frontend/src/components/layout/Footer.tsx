import { Github, Linkedin, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-[#484849]/20 bg-[#000000]">
      <div className="page-wrap grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-headline text-xl font-black uppercase tracking-tight text-white">DHIP</h3>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#adaaab]">Synthetic Sentinel Intelligence Platform.</p>
          <div className="mt-4 flex gap-3 text-[#adaaab]">
            <button className="rounded-md border border-[#484849]/30 bg-[#1a191b] p-2 transition hover:text-[#5cbfff]" aria-label="Twitter"><Twitter className="h-4 w-4" /></button>
            <button className="rounded-md border border-[#484849]/30 bg-[#1a191b] p-2 transition hover:text-white" aria-label="Github"><Github className="h-4 w-4" /></button>
            <button className="rounded-md border border-[#484849]/30 bg-[#1a191b] p-2 transition hover:text-[#00edb4]" aria-label="Linkedin"><Linkedin className="h-4 w-4" /></button>
          </div>
        </div>

        <div>
          <h4 className="font-headline text-xs font-black uppercase tracking-[0.2em] text-white">Capabilities</h4>
          <ul className="mt-3 space-y-2 text-xs uppercase tracking-[0.16em] text-[#adaaab]">
            <li><Link to="/threat-check" className="transition-all hover:translate-x-1 hover:text-[#5cbfff]">Threat Check</Link></li>
            <li><Link to="/alerts" className="transition-all hover:translate-x-1 hover:text-[#5cbfff]">Alerts</Link></li>
            <li><Link to="/community" className="transition-all hover:translate-x-1 hover:text-[#5cbfff]">Community</Link></li>
            <li><Link to="/evidence" className="transition-all hover:translate-x-1 hover:text-[#5cbfff]">Evidence Vault</Link></li>
            <li><Link to="/features" className="transition-all hover:translate-x-1 hover:text-[#5cbfff]">Features</Link></li>
            <li><Link to="/about" className="transition-all hover:translate-x-1 hover:text-[#5cbfff]">About</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline text-xs font-black uppercase tracking-[0.2em] text-white">Protocol</h4>
          <ul className="mt-3 space-y-2 text-xs uppercase tracking-[0.16em] text-[#adaaab]">
            <li><Link to="/women-safety" className="transition-all hover:translate-x-1 hover:text-[#5cbfff]">Women Safety Hub</Link></li>
            <li><Link to="/adult-safety" className="transition-all hover:translate-x-1 hover:text-[#5cbfff]">Adult Safety</Link></li>
            <li><Link to="/community/report" className="transition-all hover:translate-x-1 hover:text-[#5cbfff]">Report</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline text-xs font-black uppercase tracking-[0.2em] text-white">Intelligence Node</h4>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[#00edb4] shadow-[0_0_8px_rgba(0,237,180,0.6)]" />
            <span className="text-xs uppercase tracking-[0.16em] text-[#adaaab]">Operational: 0ms latency</span>
          </div>
        </div>
      </div>

      <div className="border-t border-[#484849]/20 py-4 text-center text-[11px] uppercase tracking-[0.14em] text-[#adaaab]">
        © 2026 DHIP — Synthetic Sentinel Intelligence.
      </div>
    </footer>
  )
}
