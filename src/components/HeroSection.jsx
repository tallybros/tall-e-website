import { motion } from 'framer-motion';

const LOGO_URL = 'https://media.base44.com/images/public/69c3b529e7e26a28bd6de95a/c2dc3a3e8_generated_image.png';'https://media.base44.com/images/public/69c3b529e7e26a28bd6de95a/e839b3f79_D0344396-B397-4C91-8987-3D11420E1845.png';

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center relative overflow-hidden pt-16">
      {/* Subtle gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-72 h-72 bg-turquoise/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex-1 space-y-4 text-center md:text-left">
            
            <h1 className="font-zen-dots text-[hsl(var(--primary))] text-6xl font-bold tracking-tight md:text-7xl">Tall-e
            </h1>
            <p className="font-orbitron text-[#ffffff] text-lg font-medium tracking-wide md:text-xl">Prompt Engineering & Conversation Design

            </p>
            <p className="text-muted-foreground text-base md:text-lg max-w-md leading-relaxed">
              Digitizing words into experiences
            </p>

            {/* Mobile image - half size, above CTAs */}
            <div className="md:hidden flex justify-center">
              <div className="overflow-hidden w-32" style={{ height: '160px' }}>
                <img src="https://media.base44.com/images/public/69c3b529e7e26a28bd6de95a/b3702af98_Tall-e_Logo.png"
                alt="Tall-e logo" className="w-full h-full object-cover object-center" style={{ objectPosition: 'center 30%' }} />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
              <a
                href="#work"
                className="inline-flex items-center px-7 py-3 rounded-full bg-purple text-white font-medium text-sm hover:bg-purple/90 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple/25">
                
                See my work
              </a>
              <a
                href="#contact" className="bg-[hsl(var(--secondary))] text-[hsl(var(--primary-foreground))] px-7 py-3 text-sm font-medium rounded-full inline-flex items-center border border-border hover:border-turquoise hover:text-turquoise transition-all duration-300">Talk to me



              </a>
            </div>
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="hidden md:flex flex-shrink-0 self-stretch items-center">
            <div className="overflow-hidden w-64 md:w-80 mx-auto md:mx-0" style={{ height: '320px' }}>
              <img src="https://media.base44.com/images/public/69c3b529e7e26a28bd6de95a/b3702af98_Tall-e_Logo.png"
              alt="Tall-e logo" className="w-full h-full object-cover object-center" style={{ objectPosition: 'center 30%' }} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}