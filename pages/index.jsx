import React, { useRef, useState, useEffect } from 'react';
import Navigation from '@/Components/ferrari/Navigation';
import HeroSection from '@/Components/ferrari/HeroSection';
import StatsSection from '@/Components/ferrari/StatsSection';
import PredictorSection from '@/Components/ferrari/PredictorSection';
import NewsSection from '@/Components/ferrari/NewsSection';
import FanZoneSection from '@/Components/ferrari/FanZoneSection';
import Footer from '@/Components/ferrari/Footer';

export default function Home() {
  const [activeSection, setActiveSection] = useState('home');
  
  const homeRef = useRef(null);
  const statsRef = useRef(null);
  const predictorRef = useRef(null);
  const newsRef = useRef(null);
  const fanzoneRef = useRef(null);

  const refs = {
    home: homeRef,
    stats: statsRef,
    predictor: predictorRef,
    news: newsRef,
    fanzone: fanzoneRef,
  };

  const handleNavigate = (sectionId) => {
    const ref = refs[sectionId];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section');
          if (sectionId) {
            setActiveSection(sectionId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    Object.entries(refs).forEach(([id, ref]) => {
      if (ref.current) {
        ref.current.setAttribute('data-section', id);
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation activeSection={activeSection} onNavigate={handleNavigate} />
      
      <main>
        <div ref={homeRef}>
          <HeroSection />
        </div>
        
        <div ref={statsRef}>
          <StatsSection />
        </div>
        
        <div ref={predictorRef}>
          <PredictorSection />
        </div>
        
        <div ref={newsRef}>
          <NewsSection />
        </div>
        
        <div ref={fanzoneRef}>
          <FanZoneSection />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
