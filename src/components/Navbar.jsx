import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
  { label: 'See my work', href: '#work' },
  { label: 'Talk to me', href: '#contact' }];


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="bg-[hsl(var(--primary))] w-full px-8 h-16 flex items-center justify-between">
        <a href="#" className="font-zen-dots text-2xl font-bold tracking-wider text-white">Tall-e</a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) =>
          <a
            key={l.href}
            href={l.href} className="text-[hsl(var(--accent-foreground))] text-sm hover:text-foreground transition-colors duration-300">
            
            
              {l.label}
            </a>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground">
          
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open &&
      <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-6 pb-6 pt-2 space-y-4">
          {links.map((l) =>
        <a
          key={l.href}
          href={l.href}
          onClick={() => setOpen(false)}
          className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
          
          
              {l.label}
            </a>
        )}
        </div>
      }
    </nav>);

}