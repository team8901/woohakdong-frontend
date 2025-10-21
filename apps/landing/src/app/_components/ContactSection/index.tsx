import {
  GITHUB_URL,
  SERVICE_NAME,
  SUPPORT_MAIL,
} from '@/app/_helpers/constants/service';
import { Button } from '@workspace/ui/components/button';
import { MailIcon } from 'lucide-react';
import Image from 'next/image';

export const ContactSection = () => {
  return (
    <section id="contact" className="bg-background py-20 md:py-24">
      <div className="container mx-auto max-w-5xl px-6">
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
          <div className="text-muted-foreground text-center md:text-right">
            © 2025 {SERVICE_NAME}. All rights reserved.
          </div>
        </div>
      </div>
    </section>
  );
};
