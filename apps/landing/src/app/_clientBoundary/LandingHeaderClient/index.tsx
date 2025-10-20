'use client';

import { SERVICE_NAME } from '@/app/_helpers/constants/service';
import { usePreRegistrationFlow } from '@/app/_helpers/hooks/usePreRegistrationFlow';
import { useScrollCheck } from '@/app/_helpers/hooks/useScrollCheck';
import { handleScrollToSection } from '@/app/_helpers/utils/handleScroll';
import { trackEvent } from '@/eventTracker/trackEvent';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@workspace/ui/components/navigation-menu';

export const LandingHeaderClient = () => {
  const isScrolled = useScrollCheck();
  const {
    email,
    setEmail,
    isSubmitting,
    submitStatus,
    submitEmail,
    resetForm,
  } = usePreRegistrationFlow();

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
  };

  const handleNavigationCtaClick = () => {
    trackEvent('navigation_cta_click');
  };

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

            <Dialog onOpenChange={handleDialogOpenChange}>
              <DialogTrigger
                className={`${navigationMenuTriggerStyle()} text-primary hover:bg-primary/10 hover:text-primary cursor-pointer font-bold`}
                onClick={handleNavigationCtaClick}>
                사전 등록
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submitEmail}>
                  <DialogHeader>
                    <DialogTitle>사전 등록</DialogTitle>
                    <DialogDescription>
                      이메일 주소를 입력하시면 출시 소식을 알려드려요!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid w-full max-w-sm items-center gap-2 py-4">
                    <Label htmlFor="email">이메일 주소</Label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="8901.dev@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                    {submitStatus && (
                      <div
                        className={`rounded-md p-3 text-sm ${
                          submitStatus.type === 'success'
                            ? 'bg-green-800/10 text-green-800'
                            : 'bg-red-800/10 text-red-800'
                        }`}>
                        {submitStatus.message}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}>
                        닫기
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? '등록 중...' : '등록하기'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};
