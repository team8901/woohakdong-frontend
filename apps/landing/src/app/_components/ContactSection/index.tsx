import { MailIcon } from 'lucide-react';
import Image from 'next/image';

export const ContactSection = () => {
  return (
    <section id="contact" className="bg-background py-20 md:py-24">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="text-center md:text-left">
            <h3 className="font-jua text-foreground mb-4 text-xl">우학동</h3>
            <div className="space-y-3">
              <div className="text-foreground flex items-center justify-center gap-3 md:justify-start">
                <MailIcon className="size-5" />
                <p>8901.dev@gmail.com</p>
              </div>
              <div className="text-foreground flex items-center justify-center gap-3 md:justify-start">
                <Image
                  src="/icons/github-mark.svg"
                  alt="GitHub"
                  width={24}
                  height={24}
                  className="size-5"
                />
                <a
                  href="https://github.com/team8901"
                  target="_blank"
                  rel="noopener noreferrer">
                  https://github.com/team8901
                </a>
              </div>
            </div>
          </div>
          <div className="text-muted-foreground text-center md:text-right">
            © 2025 우학동. All rights reserved.
          </div>
        </div>
      </div>
    </section>
  );
};
