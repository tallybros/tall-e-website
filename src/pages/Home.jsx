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
  useEffect(() => { window.scrollTo(0, 0); }, []);
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