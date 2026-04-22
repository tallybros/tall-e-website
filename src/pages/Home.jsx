import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import SelectedWork from '../components/SelectedWork';
import AboutMe from '../components/AboutMe';
import ContactSection from '../components/ContactSection';
import Certifications from '../components/Certifications';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <SelectedWork />
      <AboutMe />
      <ContactSection />
      <Certifications />
      <Footer />
    </div>
  );
}