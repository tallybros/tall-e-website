import { motion } from 'framer-motion';
import { Mail, Linkedin } from 'lucide-react';

export default function ContactSection() {
  return (
    <section id="contact" className="bg-[hsl(var(--primary))] py-28 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="max-w-xl space-y-10">
          
          <div className="space-y-3">
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold">
              Talk to me
            </h2>
            <p className="text-[hsl(var(--primary-foreground))] text-base leading-relaxed">Let's build a great experience together:

            </p>
          </div>

          <div className="space-y-4">
            <a
              href="mailto:info@tall-e.nl"
              className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-purple/40 transition-all duration-300 group">
              
              <div className="w-11 h-11 rounded-lg bg-purple/10 flex items-center justify-center group-hover:bg-purple/20 transition-colors">
                <Mail size={18} className="text-purple" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                <p className="text-foreground text-sm font-medium">info@tall-e.nl</p>
              </div>
            </a>

            <a
              href="https://www.linkedin.com/in/tally-brostowsky/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-turquoise/40 transition-all duration-300 group">
              
              <div className="w-11 h-11 rounded-lg bg-turquoise/10 flex items-center justify-center group-hover:bg-turquoise/20 transition-colors">
                <Linkedin size={18} className="text-turquoise" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">LinkedIn</p>
                <p className="text-foreground text-sm font-medium">Tally Brostowsky</p>
              </div>
            </a>
          </div>
        </motion.div>
        <div className="text-white/60 text-xs mt-10">
          <p>KVK: 42029043</p>
          <p>BTW: NL005441756B54</p>
        </div>
      </div>
    </section>);
}