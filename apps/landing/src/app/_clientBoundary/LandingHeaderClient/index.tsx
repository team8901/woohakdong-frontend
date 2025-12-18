'use client';

import { PreRegistrationDialogClient } from '@/app/_clientBoundary/PreRegistrationDialogClient';
import { SERVICE_NAME } from '@/app/_helpers/constants/service';
import { useScrollCheck } from '@/app/_helpers/hooks/useScrollCheck';
import { handleScrollToSection } from '@/app/_helpers/utils/handleScroll';
import { Button } from '@workspace/ui/components/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@workspace/ui/components/navigation-menu';

export const LandingHeaderClient = () => {
  const isScrolled = useScrollCheck();

  return (
    <header
      className={`bg-background fixed left-0 top-0 z-10 w-full px-6 py-3 transition-all duration-200 ease-in-out ${isScrolled ? 'shadow-2xs border-border border-b' : 'border-background border-b'}`}>
      <div className="container mx-auto flex max-w-5xl items-center justify-between">
        <h1
          className="font-jua text-foreground cursor-pointer text-xl"
          onClick={() => handleScrollToSection('home')}>
          {SERVICE_NAME}
        </h1>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={`${navigationMenuTriggerStyle()} cursor-pointer`}
                onClick={() => handleScrollToSection('pricing')}>
                요금제
              </NavigationMenuLink>
            </NavigationMenuItem>
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
            <PreRegistrationDialogClient trackingEventName="navigation_cta_click">
              <Button
                className={`${navigationMenuTriggerStyle()} text-primary hover:bg-primary/10 hover:text-primary cursor-pointer font-bold`}>
                사전 등록
              </Button>
            </PreRegistrationDialogClient>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};
