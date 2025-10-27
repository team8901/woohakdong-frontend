'use client';

import { CLUB_CATEGORY_OPTIONS } from '@/app/_helpers/constants/regex';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@workspace/ui/components/navigation-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';

export const LandingHeaderClient = () => {
  const isScrolled = useScrollCheck();
  const { form, onSubmit, onQuit, submitStatus, isFormValid, isSubmitting } =
    usePreRegistrationFlow();

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      onQuit();
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
              <DialogContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle>사전 등록</DialogTitle>
                      <DialogDescription>
                        이메일 주소를 입력하시면 출시 소식을 알려드려요!
                        <br />
                        대학명과 동아리 카테고리는 추후에 추가될 기능을 위해
                        수집되는 정보에요.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid w-full max-w-lg items-center gap-6 py-4">
                      {/* 이메일 입력 */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>이메일</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                inputMode="email"
                                placeholder="8901.dev@gmail.com"
                                autoComplete="on"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 대학명 입력 */}
                      <FormField
                        control={form.control}
                        name="schoolName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>대학명</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                inputMode="text"
                                placeholder="아주대학교"
                                autoComplete="off"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 동아리 카테고리 선택 */}
                      <FormField
                        control={form.control}
                        name="clubCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>동아리 카테고리</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="카테고리" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent
                                side="bottom"
                                className="max-h-[12rem]">
                                {CLUB_CATEGORY_OPTIONS.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
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
                          onClick={onQuit}
                          disabled={isSubmitting}>
                          닫기
                        </Button>
                      </DialogClose>
                      <Button
                        type="submit"
                        disabled={!isFormValid || isSubmitting}>
                        {isSubmitting ? '등록 중...' : '등록하기'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};
