import { ChevronDownIcon } from 'lucide-react';

export const ScrollIndicator = () => {
  const handleScrollToAbout = () => {
    const introductionSection = document.getElementById('introduction');

    if (introductionSection) {
      introductionSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform">
      <button
        onClick={handleScrollToAbout}
        className="flex animate-bounce cursor-pointer flex-col items-center">
        <ChevronDownIcon className="text-muted-foreground/60 size-8 animate-pulse" />
        <ChevronDownIcon
          className="text-muted-foreground -mt-5 size-8 animate-pulse"
          style={{ animationDelay: '0.1s' }}
        />
      </button>
    </div>
  );
};
