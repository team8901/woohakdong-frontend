import { amplitude } from './amplitude';

export const trackAmplitudeEvent = (
  eventName: string,
  properties?: Record<string, unknown>,
) => {
  amplitude.track(eventName, properties);
};
