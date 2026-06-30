import { motion } from 'framer-motion';

function InymiLogo({ color }) {
  return (
    <svg viewBox="0 0 64 48" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-label="inymi envelope mark" className="h-9 w-auto" style={{ transform: 'translateY(-2px)' }}>
      <path d="M4.5 9.2 C 4.4 8.0  6.0 6.6  8.4 6.5 L 55.6 7.2 C 58.0 7.3  59.7 8.7  59.5 10.1 L 58.1 39.6 C 58.0 41.0  56.4 42.4  54.0 42.4 L 6.5 41.7 C 4.1 41.7  2.5 40.3  2.7 38.9 Z" />
      <path d="M4.0 10.0 L 30.4 26.6 C 31.6 27.3  33.0 27.3  34.2 26.6 L 60.0 10.6" />
      <path d="M44.5 30.5 c -1.4 -1.6 -3.6 -0.8 -3.6 1.0 c 0 1.5 2.0 2.7 3.6 3.7 c 1.6 -1.0 3.6 -2.2 3.6 -3.7 c 0 -1.8 -2.2 -2.6 -3.6 -1.0 z" fill={color} stroke="none" opacity="0.9" />
    </svg>
  );
}

const projects = [
  {
    name: 'Surprise Me, Silly',
    description: [
      'Finds a perfect gift for those hard to shop for.',
      'Who say: “I don’t know, just surprise me, silly”',
    ],
    url: 'https://surprisemesilly.nl/',
    displayUrl: 'surprisemesilly.nl',
    bg: '#234f5a',
    ink: '#e4e9e0',
    accent: '#b6c8bf',
    titleFont: "'Cherry Swash', Georgia, serif",
    Logo: () => <img src="/surprise-box.png" alt="Surprise Me, Silly gift box" className="h-14 w-auto" style={{ transform: 'translateY(-5px)' }} />,
    screenshot: '/screenshot-sms.png',
    screenshotAlt: 'Surprise Me, Silly homepage showing the gift finder form',
  },
  {
    name: "It's not you, it's me",
    description: ['Writes the hard messages for you.', 'Breakups, apologies, hard truths and more'],
    url: 'https://www.itsnotyouitsme.nl/',
    displayUrl: 'itsnotyouitsme.nl',
    bg: '#9A2E25',
    ink: '#F4ECDC',
    accent: '#F4ECDC',
    titleFont: "'Newsreader', Georgia, serif",
    Logo: ({ color }) => <InymiLogo color={color} />,
    screenshot: '/screenshot-inymi.png',
    screenshotAlt: "It's Not You, It's Me writing assistant with message categories",
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
            Products I&rsquo;ve delivered where the conversation <em>is</em> the experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, i) => (
            <motion.a
              key={i}
              href={project.url}
              target="_blank"
              rel="noopener"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group rounded-2xl border-2 border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 px-6 py-5 flex flex-col"
              style={{ background: project.bg, color: project.ink }}>

              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="flex-shrink-0 h-12 flex items-center">
                  <project.Logo color={project.accent} />
                </div>
                <h3 className="text-xl md:text-2xl" style={{ color: project.accent, fontFamily: project.titleFont }}>
                  {project.name}
                </h3>
              </div>

              <div className="text-sm leading-relaxed space-y-1.5 text-center" style={{ color: project.ink, opacity: 0.85 }}>
                {project.description.map((line, idx) => <p key={idx}>{line}</p>)}
              </div>

              <div className="mx-auto mt-4 w-3/4 rounded-lg overflow-hidden border-2" style={{ borderColor: project.accent }}>
                <img
                  src={project.screenshot}
                  alt={project.screenshotAlt}
                  loading="lazy"
                  className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500" />
              </div>

              <div className="text-center text-xs mt-3 tracking-wide underline underline-offset-2" style={{ color: project.accent, opacity: 0.85 }}>
                {project.displayUrl}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
