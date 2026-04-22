import { motion } from 'framer-motion';

const certs = [
{
  image: 'https://media.base44.com/images/public/user_69136b9b46dc851f01f3efc1/b2f53021b_Screenshot2026-03-25at111052.png',
  alt: 'Amsterdam Data Academy — AI Engineering Bootcamp diploma'
},
{
  image: 'https://media.base44.com/images/public/user_69136b9b46dc851f01f3efc1/3fce74e7a_Screenshot2026-03-25at111131.png',
  alt: 'Maven / Convocat Academy — GenAI Design for Conversations and Content'
}];


export default function Certifications() {
  return (
    <section id="certs" className="py-28 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="font-orbitron text-3xl md:text-4xl font-bold mb-14">
          
          My certifications
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {certs.map((cert, i) =>
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="overflow-hidden">
              <img src={cert.image} alt={cert.alt} className="w-120 h-auto rounded-xl" />
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}