'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export const CommunicationFeaturesSectionClient = () => {
  return (
    <section id="feature_communication" className="bg-background py-20 md:py-24">
      <div className="container mx-auto max-w-5xl px-6">
        <h2 className="text-primary mb-12 text-lg font-semibold md:text-2xl">
          공유
        </h2>
        <div className="flex flex-col gap-8 md:text-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="md-w-1/3 md:gap-4">
            <h3 className="text-foreground text-2xl font-semibold md:text-4xl">
              알려야하는 정보도 투명하게
            </h3>
            <p className="text-muted-foreground mt-1 md:mt-4 md:text-xl">
              회비 사용 내역부터 일정, 모임까지 쉽게 공유할 수 있어요.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="scrollbar-hide flex w-full flex-nowrap justify-between overflow-x-auto scroll-smooth">
            <Image
              src="/feature_images/communication_1.webp"
              alt="Communication features image1"
              width={500}
              height={500}
              className="w-1/2 md:mb-16 md:w-1/3"
            />
            <Image
              src="/feature_images/communication_2.webp"
              alt="Communication features image2"
              width={500}
              height={500}
              className="w-1/2 md:mt-16 md:w-1/3"
            />
            <Image
              src="/feature_images/communication_3.webp"
              alt="Communication features image3"
              width={500}
              height={500}
              className="w-1/2 md:mb-16 md:w-1/3"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
