import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { CategorySection } from '../components/home/CategorySection';
import { FeaturedFleetSection } from '../components/home/FeaturedFleetSection';
import { WhyChooseUsSection } from '../components/home/WhyChooseUsSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { TestimonialSection } from '../components/home/TestimonialSection';
import { FAQSection } from '../components/home/FAQSection';

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <CategorySection />
      <FeaturedFleetSection />
      <WhyChooseUsSection />
      <HowItWorksSection />
      <TestimonialSection />
      <FAQSection />
    </div>
  );
};
