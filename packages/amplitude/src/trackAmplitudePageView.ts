import { amplitude } from './amplitude';

export const trackAmplitudePageView = () => {
  amplitude.track('page_view', {
    page_path: window.location.pathname,
    search_params: window.location.search,
  });
};
