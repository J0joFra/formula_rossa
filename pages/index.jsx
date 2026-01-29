import React, { useRef, useState, useEffect } from 'react';
import Navigation from '../components/ferrari/Navigation';
import HeroSection from '../components/ferrari/HeroSection';
import StatsSection from '../components/ferrari/StatsSection';
import PredictorSection from '../components/ferrari/PredictorSection';
import NewsSection from '../components/ferrari/NewsSection';
import FanZoneSection from '../components/ferrari/FanZoneSection';
import Footer from '../components/ferrari/Footer';


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
  <div className="min-h-screen bg-black text-white relative overflow-hidden">
    {/* SFONDO CON PUNTI FERRARI */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Punti rossi Ferrari */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-red-600 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      
      {/* Punti gialli Ferrari */}
      <div className="absolute top-1/2 left-1/5 w-5 h-5 bg-yellow-500 rounded-full animate-bounce"></div>
      <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
      
      {/* Punti che si muovono */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
      <div className="absolute bottom-10 right-10 w-2 h-2 bg-yellow-500 rounded-full animate-ping" style={{animationDelay: '0.7s'}}></div>
      
      {/* Pattern di sfondo sottile */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #DC0000 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}
      ></div>
    </div>
    
    {/* CONTENUTO PRINCIPALE */}
    <div className="relative z-10">
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
  </div>
);
}
