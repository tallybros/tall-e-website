import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[hsl(var(--secondary))] py-10 border-t border-border/40">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-end justify-between gap-1 md:gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-zen-dots text-white text-shadow-btn text-lg font-bold tracking-wider text-center md:text-left">Tall-e, prompt engineering & conversation design</span>
          <p className="text-[#2a6b6a] text-xs">
            © {new Date().getFullYear()} Tally Brostowsky. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col items-center md:items-end gap-1">
          <Link
            to="/terms"
            className="text-[#2a6b6a] text-xs hover:text-[#1a4a49] transition-colors duration-300 underline underline-offset-2">
            Terms &amp; Conditions
          </Link>
          <a
            href="https://coolors.co/?ref=69cb9d421eb95b000f6b111b"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2a6b6a] text-xs hover:text-[#1a4a49] transition-colors duration-300 underline underline-offset-2">
            Like my color scheme? Curate your own Coolors
          </a>
        </div>
      </div>
    </footer>);

}