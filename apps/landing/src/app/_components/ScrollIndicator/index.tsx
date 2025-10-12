import { handleScrollToSection } from '@/app/_helpers/utils/handleScroll';
import { ChevronDownIcon } from 'lucide-react';

export const ScrollIndicator = () => {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform">
      <button
        onClick={() => handleScrollToSection('introduction')}
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
