export default function Footer() {
  return (
    <footer className="bg-[hsl(var(--secondary))] py-10 border-t border-border/40">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-zen-dots text-[hsl(var(--background))] text-lg font-bold tracking-wider">Tall-e, prompt engineering & conversation design

        </span>
        <div className="flex flex-col items-center md:items-end gap-1">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Tally Brostowsky. All rights reserved.
          </p>
          <a
            href="https://coolors.co/?ref=69cb9d421eb95b000f6b111b"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground text-xs hover:text-foreground transition-colors duration-300 underline underline-offset-2">
            Like my color scheme? Curate your own Coolors
          </a>
        </div>
      </div>
    </footer>);

}