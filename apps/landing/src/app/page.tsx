import { HomeSectionClient } from './_clientBoundary/HomeSectionClient';
import { LandingHeaderClient } from './_clientBoundary/LandingHeaderClient';

const LandingPage = () => {
  return (
    <>
      <LandingHeaderClient />
      <div className="bg-background h-screen w-full snap-y snap-mandatory snap-center scroll-smooth">
        <HomeSectionClient />
      </div>
    </>
  );
};

export default LandingPage;
