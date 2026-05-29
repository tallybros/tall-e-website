import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const projects = [
  {
    name: "It's Not You, It's Me",
    tagline: 'The breakup message writer',
    description: "Writing the 'it's over' message is one of the hardest things to put into words. This tool guides you through a short conversation, then writes the message for you — honest, kind, and with just enough distance to make it easier. Sometimes the most human thing is admitting you need a little help.",
    url: 'https://www.itsnotyouitsme.nl/',
    accent: 'text-purple',
    border: 'hover:border-purple/60',
  },
  {
    name: 'Surprise Me, Silly',
    tagline: 'A curated gift finder',
    description: "A few smart questions about the person, and you get genuinely thoughtful gift ideas — experiences, local finds, acts of kindness. No invasive data collection, no generic lists. The conversation is the product: it surfaces what you already know about someone and turns it into something meaningful.",
    url: 'https://surprisemesilly.nl/',
    accent: 'text-turquoise',
    border: 'hover:border-turquoise/60',
  },
];

export default function ConversationDesign() {
  return (
    <section id="conversation-design" className="bg-[hsl(var(--secondary))] py-14 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-3">Conversation Design</h2>
          <p className="text-white text-sm mb-10 max-w-2xl">
            Products where the conversation <em>is</em> the experience — designed from the ground up around how people actually talk.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, i) => (
            <motion.a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`group flex flex-col justify-between rounded-2xl border-2 border-border ${project.border} bg-card p-8 transition-all duration-300 hover:shadow-lg`}>

              <div className="space-y-4">
                <div>
                  <h3 className={`font-orbitron text-lg font-semibold ${project.accent} mb-1`}>{project.name}</h3>
                  <p className="text-muted-foreground text-sm">{project.tagline}</p>
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed">{project.description}</p>
              </div>

              <div className={`inline-flex items-center gap-2 mt-6 text-sm font-medium ${project.accent} group-hover:opacity-80 transition-opacity`}>
                Visit {project.name} <ExternalLink size={13} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
