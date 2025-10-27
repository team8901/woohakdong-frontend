import {
  GITHUB_URL,
  SERVICE_NAME,
  SUPPORT_MAIL,
} from '@/app/_helpers/constants/service';
import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';
import { MailIcon } from 'lucide-react';
import Image from 'next/image';

import { PreRegistrationDialogClient } from '../../_clientBoundary/PreRegistrationDialogClient';

export const ContactSection = () => {
  return (
    <section id="contact" className="bg-background py-20 md:py-24">
      <div className="container mx-auto flex max-w-5xl flex-col gap-16 px-6">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between">
          <h2 className="font-jua text-2xl">
            지금 사전 등록하고 가장 먼저 새로운 소식을 받아보세요!
          </h2>
          <PreRegistrationDialogClient>
            <Button size="lg">사전 등록하기</Button>
          </PreRegistrationDialogClient>
        </div>
        <Separator />
        <div className="grid gap-8 md:grid-cols-2">
          <div className="text-center md:text-left">
            <h3 className="font-jua text-foreground mb-4 text-xl">
              {SERVICE_NAME}
            </h3>
            <div className="space-y-0.5">
              <div className="text-foreground flex items-center justify-center md:justify-start">
                <MailIcon className="size-5" />
                <Button variant="link" className="text-foreground" asChild>
                  <a href={`mailto:${SUPPORT_MAIL}`}>{SUPPORT_MAIL}</a>
                </Button>
              </div>
              <div className="text-foreground flex items-center justify-center md:justify-start">
                <Image
                  src="/icons/github-mark.svg"
                  alt="GitHub"
                  width={20}
                  height={20}
                  className="size-5"
                />
                <Button variant="link" className="text-foreground" asChild>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer">
                    {GITHUB_URL}
                  </a>
                </Button>
              </div>
            </div>
          </div>
          <div className="text-muted-foreground text-center text-sm md:text-right">
            © 2025 {SERVICE_NAME}. All rights reserved.
          </div>
        </div>
      </div>
    </section>
  );
};
