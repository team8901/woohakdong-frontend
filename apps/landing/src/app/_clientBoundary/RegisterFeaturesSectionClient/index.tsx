'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export const RegisterFeaturesSectionClient = () => {
  return (
    <section id="feature_register" className="bg-background py-20 md:py-24">
      <div className="container mx-auto max-w-5xl px-6">
        <h2 className="text-primary mb-12 text-lg font-semibold md:text-2xl">
          등록
        </h2>
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="md-w-1/3 md:mt-24 md:gap-4">
            <h3 className="text-foreground text-2xl font-semibold md:text-4xl">
              <p>일단 간단하게</p>
              <p>동아리 등록부터</p>
            </h3>
            <div className="text-muted-foreground mt-1 md:mt-4 md:text-xl">
              <p>동아리를 등록하고 나면 </p>
              <p>동아리 전용 페이지를 받을 수 있어요.</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex w-full md:w-2/3">
            <Image
              src="/feature_images/register_1.webp"
              alt="Register features image1"
              width={500}
              height={500}
              className="w-1/2 md:mb-16"
            />
            <Image
              src="/feature_images/register_2.webp"
              alt="Register features image2"
              width={500}
              height={500}
              className="w-1/2 md:mt-16"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
