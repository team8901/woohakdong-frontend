'use client';

import { useEffect, useState } from 'react';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@workspace/ui/components/navigation-menu';

export const LandingHeaderClient = () => {
  const [isScrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`bg-background fixed left-0 top-0 z-10 w-full px-6 py-3 transition-all duration-200 ease-in-out ${isScrolled ? 'shadow-2xs border-border border-b' : 'border-background border-b'}`}>
      <div className="container mx-auto flex max-w-5xl items-center justify-between">
        <h1
          className="font-jua text-foreground cursor-pointer text-xl"
          onClick={() => handleScrollToSection('home')}>
          우학동
        </h1>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={`${navigationMenuTriggerStyle()} cursor-pointer`}
                onClick={() => handleScrollToSection('faq')}>
                자주 묻는 질문
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                className={`${navigationMenuTriggerStyle()} cursor-pointer`}
                onClick={() => handleScrollToSection('contact')}>
                문의
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                className={`${navigationMenuTriggerStyle()} text-primary hover:bg-primary/10 hover:text-primary cursor-pointer font-bold`}
                onClick={() => {}}>
                사전 등록
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};
