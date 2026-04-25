import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
  { label: 'See my work', section: 'work' },
  { label: 'Talk to me', section: 'contact' }];

  const handleLogoClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (location.pathname !== '/') navigate('/');
  };

  const handleSectionClick = (e, section) => {
    e.preventDefault();
    setOpen(false);
    const scrollTo = () => {
      const el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(scrollTo, 100);
    } else {
      scrollTo();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="bg-[hsl(var(--primary))] w-full px-8 h-16 flex items-center justify-between">
        <a href="/" onClick={handleLogoClick} className="font-zen-dots text-2xl font-bold tracking-wider text-white">Tall-e</a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) =>
          <a
            key={l.section}
            href={`/#${l.section}`}
            onClick={(e) => handleSectionClick(e, l.section)}
            className="text-[hsl(var(--accent-foreground))] text-sm hover:text-foreground transition-colors duration-300">
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
          key={l.section}
          href={`/#${l.section}`}
          onClick={(e) => handleSectionClick(e, l.section)}
          className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
        )}
        </div>
      }
    </nav>);

}