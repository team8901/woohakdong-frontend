import {
  BeerIcon,
  CircleEllipsisIcon,
  FlameKindlingIcon,
  LampDeskIcon,
  type LucideIcon,
  PresentationIcon,
} from 'lucide-react';

export type Activity = {
  id: number;
  title: string;
  content: string;
  writer: string;
  createdAt: string;
  updatedAt: string;
  participantCount: string;
  activityDate: string;
  tag: string;
  activityImages: string[];
};

export const tagIconMap: Record<string, LucideIcon> = {
  스터디: LampDeskIcon,
  회식: BeerIcon,
  회의: PresentationIcon,
  기타: CircleEllipsisIcon,
  MT: FlameKindlingIcon,
};
