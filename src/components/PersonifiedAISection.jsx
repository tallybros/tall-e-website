import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function PersonifiedAISection() {
  return (
    <section id="personified-ai" className="bg-[hsl(var(--secondary))] pt-14 pb-28 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-3">Personified AI</h2>
          <p className="text-white text-sm mb-10">A live demo – see what defining Voice &amp; Tone does to a model</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border-2 border-border bg-card p-8 md:p-12">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div className="space-y-4">
              <p className="text-foreground/80 text-base md:text-lg leading-relaxed max-w-2xl">
                Pick a persona, type in a prompt and watch generic AI and personified AI answer side-by-side.
                Same model, same question – only the Voice &amp; Tone guidance changes. It makes the difference obvious.
              </p>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Built as a portfolio piece to showcase what prompt engineering actually produces when you treat voice like a product.
              </p>
            </div>
            <Link
              to="/personified-ai"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-purple text-white font-medium text-sm hover:bg-purple/90 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple/25 whitespace-nowrap self-start md:self-center text-shadow-btn">
              Try the demo <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
