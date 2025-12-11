import { CommunicationFeaturesSectionClient } from './_clientBoundary/CommunicationFeaturesSectionClient';
import { HomeSectionClient } from './_clientBoundary/HomeSectionClient';
import { ItemFeaturesSectionClient } from './_clientBoundary/ItemFeaturesSectionClient';
import { LandingHeaderClient } from './_clientBoundary/LandingHeaderClient';
import { MemberFeaturesSectionClient } from './_clientBoundary/MemberFeaturesSectionClient';
import { RegisterFeaturesSectionClient } from './_clientBoundary/RegisterFeaturesSectionClient';
import { ScheduleFeaturesSectionClient } from './_clientBoundary/ScheduleFeaturesSectionClient';
import { ContactSection } from './_components/ContactSection';
import { FaqSection } from './_components/FaqSection';
import { IntroductionSection } from './_components/IntroductionSection';
import { PricingSection } from './_components/PricingSection';

const LandingPage = () => {
  return (
    <>
      <LandingHeaderClient />
      <div className="bg-background h-screen w-full snap-y snap-mandatory snap-center scroll-smooth">
        <HomeSectionClient />
        <IntroductionSection />
        <RegisterFeaturesSectionClient />
        <MemberFeaturesSectionClient />
        <ItemFeaturesSectionClient />
        <ScheduleFeaturesSectionClient />
        <CommunicationFeaturesSectionClient />
        <PricingSection />
        <FaqSection />
        <ContactSection />
      </div>
    </>
  );
};

export default LandingPage;
