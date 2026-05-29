import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Wraps every occurrence of "reason why" in a light-purple span
function Highlighted({ text }) {
  const parts = text.split(/('reason why')/gi);
  return (
    <>
      {parts.map((part, i) =>
        /^'reason why'$/i.test(part)
          ? <span key={i} className="text-[#DFC2F2]">{part}</span>
          : part
      )}
    </>
  );
}

const paragraphs = [
  "I've always loved imagining and inventing new ideas, creating new things. Working in tech for two decades allowed me to create, to invent and to make someone's day a bit easier.",
  "Sitting at the product manager's seat, it was about sharing the idea, the 'reason why', the instructions and a few specific guidelines that are crucial. Rather than a full handbook of instructions, providing the essence and guardrails, but leaving enough space for creativity.",
  "Prompt engineering is very similar in its basic idea – it's about giving a machine (like GenAI) the right context, a clear and concise 'reason why' and directional do's and don'ts.",
  "But nailing this is hard. Machines usually assume they know everything and have all the solutions. So communicating with them has to be precise – it's about cherry picking the right words to use, being very clear and direct with intent, a good 'reason why' and the specific context.",
  "For decades I have been carefully fine-tuning the amount of information to share with my teams. Found the exact balance between transparency and oversharing. Mastered framing the precise context so that the story begins where it needs to – not too early and not too late.",
  "As a prompt engineer and conversation designer, I am doing the same, just with machines as part of the team. I use my experience and expertise to do it the right way – with the user's best interest in mind, with as much soul and personality as a machine is able to evoke.",
];

const preamble = "In anything I create, the most important part is the 'reason why'. It is part of my process. I believe if you understand the why, you can best answer the rest – the what and the how. This is the reason this page exists on my website, to share my 'reason why' – why I am so passionate about prompt engineering and conversation design.";

export default function Why() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 pt-32 pb-24">

        {/* Preamble */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-foreground/60 text-[15px] leading-relaxed mb-12">
          <Highlighted text={preamble} />
        </motion.p>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-orbitron text-3xl md:text-4xl font-bold mb-10">
          My <span className="text-[#DFC2F2]">'reason why'</span>
        </motion.h1>

        {/* Body */}
        <div className="space-y-6">
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.08 }}
              className="text-foreground/80 text-base leading-relaxed">
              <Highlighted text={p} />
            </motion.p>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}
