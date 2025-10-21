'use client';

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function AOSInit() {
  useEffect(() => {
    AOS.init({
  duration: 1000,
  once: false,           // Repeat animations
  mirror: true,          // Animate out
  offset: 100,           // Trigger 100px before element enters viewport
  delay: 0,              // Delay before animation starts
  easing: 'ease-in-out',
  anchorPlacement: 'top-bottom', // When to trigger (element's top hits viewport's bottom)
});
  }, []);

  return null;
}