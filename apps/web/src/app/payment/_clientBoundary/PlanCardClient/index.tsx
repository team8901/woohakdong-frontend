'use client';

import { Badge } from '@workspace/ui/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import type { SubscriptionPlan } from '@workspace/ui/constants/plans';
import { Check } from 'lucide-react';

type PlanCardClientProps = {
  plan: SubscriptionPlan;
  isSelected: boolean;
  onSelect: () => void;
};

export const PlanCardClient = ({
  plan,
  isSelected,
  onSelect,
}: PlanCardClientProps) => {
  return (
    <Card
      className={`relative cursor-pointer transition-all ${
        isSelected
          ? 'border-primary ring-primary/20 border-2 ring-2'
          : 'hover:border-primary/50'
      } ${plan.recommended ? 'border-primary' : ''}`}
      onClick={onSelect}>
      {plan.recommended && (
        <Badge className="bg-primary absolute -top-3 left-1/2 -translate-x-1/2">
          추천
        </Badge>
      )}
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-lg">{plan.name}</CardTitle>
        <CardDescription className="text-sm">
          {plan.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-center">
          <span className="text-foreground text-2xl font-bold">
            {plan.basePrice === 0
              ? '무료'
              : `${plan.basePrice.toLocaleString()}원`}
          </span>
          {plan.basePrice > 0 && (
            <span className="text-muted-foreground text-sm">/월</span>
          )}
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <Check className="text-primary size-3 shrink-0" />
              <span className="text-foreground text-xs">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
