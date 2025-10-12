'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export const ItemFeaturesSectionClient = () => {
  return (
    <section id="feature_item" className="bg-muted/50 py-20 md:py-24">
      <div className="container mx-auto max-w-5xl px-6">
        <h2 className="text-primary mb-12 text-lg font-semibold md:text-2xl">
          물품
        </h2>
        {/* 물품 등록 기능 소개 부분 */}
        <div className="mb-6 flex flex-col gap-8 md:mb-20 md:flex-row md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="order-2 flex w-full md:order-1 md:w-2/3">
            <Image
              src="/feature_images/item_1.webp"
              alt="Item features image1"
              width={500}
              height={500}
              className="w-1/2 md:mt-16"
            />
            <Image
              src="/feature_images/item_2.webp"
              alt="Item features image2"
              width={500}
              height={500}
              className="w-1/2 md:mb-16"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="md-w-1/3 order-1 md:order-2 md:mt-24 md:gap-4">
            <h3 className="text-foreground text-2xl font-semibold md:text-4xl">
              <p>물품도 한 눈에</p>
            </h3>
            <div className="text-muted-foreground mt-1 md:mt-4 md:text-xl">
              <p>물품을 등록하고</p>
              <p>대여 상태를 한 눈에 확인해 보세요.</p>
            </div>
          </motion.div>
        </div>
        {/* 물품 대여 기능 소개 부분 */}
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="md-w-1/3 order-1 md:order-2 md:mt-24 md:gap-4">
            <h3 className="text-foreground text-2xl font-semibold md:text-4xl">
              <p>대여 내역 관리까지</p>
            </h3>
            <div className="text-muted-foreground mt-1 md:mt-4 md:text-xl">
              <p>누가, 언제 빌렸고, 언제 반납했는지</p>
              <p>과거 내역을 간편하게 보세요.</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="order-2 flex w-full md:w-2/3">
            <Image
              src="/feature_images/item_3.webp"
              alt="Item features image3"
              width={500}
              height={500}
              className="w-1/2"
            />
            <Image
              src="/feature_images/item_4.webp"
              alt="Item features image4"
              width={500}
              height={500}
              className="w-1/2"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
