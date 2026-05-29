import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function PersonifiedAISection() {
  return (
    <section id="personified-ai" className="bg-[hsl(var(--secondary))] pt-14 pb-8 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-3">Personified AI</h2>
          <p className="text-white text-sm mb-10">What does designing a persona on an AI model actually look like?</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border-2 border-border bg-card p-8 md:p-12">
          <div className="space-y-4">
            <p className="text-foreground/80 text-base md:text-lg leading-relaxed ">
              I created this demo with this question in mind. The idea was to showcase the difference a persona can make. By crafting the persona prompt – holding the essence of a brand, its values and personality traits – the whole interaction becomes more deliberate, efficient and focused:
            </p>
            <ul className="text-[#DFC2F2] font-bold text-base md:text-lg space-y-1 ">
              <li>Pick a persona.</li>
              <li>Ask it anything.</li>
              <li>Compare the responses.</li>
            </ul>
            <Link
              to="/personified-ai"
              className="inline-flex items-center gap-2 px-16 py-3 rounded-lg bg-purple text-white font-medium text-sm hover:bg-purple/90 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple/25 whitespace-nowrap text-shadow-btn">
              Try it out <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
