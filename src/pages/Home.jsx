import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import SelectedWork from '../components/SelectedWork';
import PersonifiedAISection from '../components/PersonifiedAISection';
import AboutMe from '../components/AboutMe';
import ContactBot from '../components/ContactBot';
import Certifications from '../components/Certifications';
import Footer from '../components/Footer';

export default function Home() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const scroll = () => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ block: 'start' });
    };
    if (document.readyState === 'complete') {
      scroll();
    } else {
      window.addEventListener('load', scroll, { once: true });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <SelectedWork />
      <PersonifiedAISection />
      <AboutMe />
      <ContactBot />
      <Certifications />
      <Footer />
    </div>
  );
}