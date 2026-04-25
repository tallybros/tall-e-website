import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Info, X } from 'lucide-react';

const bots = [
{
  name: 'Teenage-buddy Kai',
  tagline: 'A virtual teenager for bored teenagers',
  description: 'Kai is a friendly conversation buddy for teens when they are bored or lonely - a companion. Kai is friendly, cool, supportive, knowledgeable about things teens care about, he is a good conversation starter. He offers to play games together that will encourage the teen to express themselves and engage. \nKai was born at my personal teenager’s request, but can now keep anyone engaged.',
  url: 'https://kai-convobot.tall-e.nl/',
  image: 'https://media.base44.com/images/public/69c3b529e7e26a28bd6de95a/2b5e97328_Screenshot2026-03-21at165809.png'
},
{
  name: 'Pubquiz Rick',
  tagline: 'Your virtual pub quiz game host',
  description: 'The concept was to recreate a fun, social pub-quiz atmosphere that feels like a night out at the pub. Rick is true to the classic quiz style but with a Dutch twist (Yep, I’m prompting from Amsterdam). \nWhile the user will be playing alone, Rick still makes them feel the glamour, thrill of success and a sense of belonging. \nRick uses RAG to ask questions on Dutch topics. ',
  url: 'https://rick-convobot.tall-e.nl/',
  image: 'https://media.base44.com/images/public/69c3b529e7e26a28bd6de95a/7db37edb2_Screenshot2026-03-25at113239.png'
},
{
  name: 'My CV Bot',
  tagline: 'Ask it anything about my professional experience',
  description: 'The CV bot acts as an interactive way of reading my CV. It uses my personal CV file as its only source, allowing it to answer questions about my background, experience and skills with accuracy and context. \nThe bot retrieves relevant details directly from my CV as a RAG source, ensuring consistent and factual responses. It is trained to keep it professional and on topic.',
  url: 'https://cv-convobot.tall-e.nl/',
  image: 'https://media.base44.com/images/public/69c3b529e7e26a28bd6de95a/fa30ade19_Screenshot2026-03-14at104806.png'
}];


function BotCard({ bot, index }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="relative"
      style={{ perspective: '1000px' }}>
      
      <div
        className="relative w-full transition-all duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          aspectRatio: '1 / 1.03'
        }}>
        
        {/* Front */}
        <a
          href={bot.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-border hover:border-purple/60 bg-card group transition-all duration-300"
          style={{ backfaceVisibility: 'hidden' }}>
          
          <img
            src={bot.image}
            alt={bot.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-white">{bot.name}</h3>
                <p className="text-white/70 text-xs leading-relaxed mt-0.5">{bot.tagline}</p>
              </div>
              <button
                onClick={(e) => {e.preventDefault();setFlipped(true);}}
                className="ml-3 flex-shrink-0 w-8 h-8 rounded-full bg-purple/80 hover:bg-purple flex items-center justify-center transition-colors">
                
                <Info size={14} className="text-white" />
              </button>
            </div>
          </div>
        </a>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl border-2 border-purple/60 bg-card p-6 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          
          <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
            <h3 className="font-orbitron text-sm font-semibold tracking-wide text-purple">{bot.name}</h3>
            <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-line">{bot.description}</p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <a
              href={bot.url}
              target="_blank"
              rel="noopener noreferrer" className="font-orbitron inline-flex items-center gap-2 text-sm text-turquoise hover:text-turquoise/80 transition-colors">


              Try it <ExternalLink size={13} />
            </a>
            <button
              onClick={() => setFlipped(false)}
              className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors">
              
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>);

}

export default function SelectedWork() {
  return (
    <section id="work" className="bg-[hsl(var(--secondary))] pt-28 pb-14 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-3">Convobots*</h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-white mb-10 text-sm max-w-2xl">
          * Convobots are AI-powered conversational experiences designed & crafted by a human (me!)
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bots.map((bot, i) => <BotCard key={bot.name} bot={bot} index={i} />)}
        </div>
      </div>
    </section>);

}