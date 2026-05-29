import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, MessageSquare, PenTool } from 'lucide-react';

const skills = [
{ icon: Sparkles, label: 'Prompt engineering' },
{ icon: MessageSquare, label: '(AI) Conversation design' },
{ icon: PenTool, label: 'UX writing' }];


export default function AboutMe() {
  return (
    <section id="about" className="py-28 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 space-y-6">
            
            <h2 className="font-zen-dots text-3xl md:text-4xl font-bold">
              Hi, I'm <span className="text-purple">Tall-e!</span>
            </h2>
            <p className="text-[hsl(var(--secondary))] text-sm leading-relaxed">(human name: Tally Brostowsky)

            </p>

            <div className="space-y-5 text-foreground/85 text-[15px] leading-relaxed">
              <p>
                I've been in tech for over two decades: I started out as a software developer, writing in Visual Basic. I moved to product management and led one of the most successful mobile apps in the country. These days, not only do I have a front row seat to the biggest revolution in tech history – Generative AI – I'm part of the conversation.
              </p>
              <p>
                In my years translating user intent into user delight, I have learned how to pinpoint the precise wording to create consistent interactions that build trust. Like a two-way conversation with a product.
              </p>
              <p>
                I do this by finding the essence of a brand's voice and bringing it to life to craft experiences powered by words – this could be traditional conversations, embedded AI or{' '}
                <a href="#convobots" onClick={(e) => { e.preventDefault(); document.getElementById('convobots')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-turquoise hover:text-turquoise/80 underline underline-offset-2 transition-colors">Convobots</a>
                {' '}(AI-powered conversations).
              </p>
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 flex flex-col justify-center">
            
            <div className="space-y-5">
              {skills.map((skill, i) =>
              <a
                key={skill.label}
                href="#contact"
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-purple/30 transition-all duration-300 group">

                  <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center group-hover:bg-purple/20 transition-colors">
                    <skill.icon size={18} className="text-purple" />
                  </div>
                  <span className="text-foreground text-sm font-medium">{skill.label}</span>
                </a>
              )}
            </div>
            <Link to="/why" className="inline-flex items-center gap-1 text-sm text-purple hover:opacity-80 transition-opacity mt-4">
              Every good product starts with the 'why'. <span className="text-[#DFC2F2]">This is mine</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>);

}