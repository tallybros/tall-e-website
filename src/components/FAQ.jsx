import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const linkClass = 'text-purple hover:text-purple/80 underline underline-offset-2 transition-colors';

const faqs = [
  {
    q: 'What is prompt engineering?',
    a: 'Prompt engineering is the craft of writing the instructions that tell an AI how to think, sound, and respond. What information it’s allowed to share and what are its reliable data sources. Think of it as training a really smart employee – it will pick up fast but it still needs guidance based on what you want it to do.',
  },
  {
    q: 'Why does prompt engineering matter?',
    a: 'The difference between an AI people love using and one they close immediately is almost entirely in the prompt. Clear intent, the right voice, and well-placed guardrails turn a generic model into an experience that actually helps.\n\nIf done right, it will not only save you and the user time, but it can also save money, by using less tokens (vs. using a generic AI solution).',
  },
  {
    q: 'What does a conversation designer do?',
    a: 'A conversation designer understands your brand, what it does but also what it values. She looks at your IRL conversations and translates them into a persona that thinks and sounds like you – think about terms you use, phrases that are common, and that helpfulness that only you know how to provide. This creates a conversation that flows naturally but is also humble – it knows when to stop and escalate, and do it with the right empathy and kindness.',
  },
  {
    q: 'What is a Convobot?',
    a: 'A Convobot is an AI-powered conversational experience that is designed & crafted by a human conversation designer. It’s a product on its own that can solve a real problem, where the conversation is the solution. A Convobot has the knowledge it needs to solve the problem and it has been personified exactly for its purpose, so it sounds like the expert it is.',
    cta: (
      <a href="https://surprisemesilly.nl/en" target="_blank" rel="noopener" className={linkClass}>
        See Surprise Me, Silly’s Convobot Sally in action
      </a>
    ),
    ctaInline: true,
  },
  {
    q: 'What’s the difference between a chatbot and a Convobot?',
    a: 'A chatbot is smart and has all the information of the world, but it is also very generic and can be unpredictable. Think about your last conversation with Gemini or ChatGPT.\n\nA Convobot uses the same chatbot capabilities but in a focused manner, both in its expertise and its experience, so the result is a personified and personal conversation, tailored exactly to your brand.',
  },
  {
    q: 'Who is behind Tall-e?',
    a: 'Tall-e is Tally Brostowsky, a Netherlands-based prompt engineer and conversation designer with over two decades in tech. She started out as a software developer but quickly moved into product management, drawn to the strategic “why”, not just the technical “how”. There she led product and UX teams and one of the most successful mobile apps in her country.\n\nToday she applies that same product-manager empathy to deliver custom solutions using AI, as a conversation designer.',
    cta: (
      <>Transitioning into a conversation designer also started with a “why”, read about it <Link to="/why" className={linkClass}>here</Link>.</>
    ),
    ctaInline: true,
  },
  {
    q: 'What makes Tall-e unique?',
    a: 'Tall-e brings a unique voice to every project, that conveys its essence in a humanoid form, a personified Convobot. Each project starts with the “why”, lands on a precise voice, and treats every line of dialogue the way a seasoned product manager treats a feature, with love.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-3xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="font-orbitron text-3xl md:text-4xl font-bold mb-10 text-center">
          Frequently asked questions
        </motion.h2>

        <div className="space-y-3">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card overflow-hidden hover:border-purple/40 transition-colors">
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 text-foreground">
                  <span className="font-medium text-base md:text-lg">{item.q}</span>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 text-purple transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden">
                      <div className="px-5 pb-5 text-foreground/75 text-sm md:text-base leading-relaxed space-y-3">
                        {item.a.split('\n\n').map((para, pi, arr) => (
                          <p key={pi}>
                            {para}
                            {pi === arr.length - 1 && item.cta && item.ctaInline && <> {item.cta}</>}
                          </p>
                        ))}
                        {item.cta && !item.ctaInline && <p className="pt-1">{item.cta}</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
