import type { CSSProperties } from "react";
import BenefitCard from "@/components/BenefitCard";

type FeatureCardItem = {
  title: string;
  text: string;
};

type FeatureCardsProps = {
  items: FeatureCardItem[];
};

export const getDesktopColumns = (count: number) => {
  if (count <= 1) {
    return 1;
  }
  if (count <= 5) {
    return count;
  }
  return Math.min(5, Math.ceil(count / 2));
};

export default function FeatureCards({ items }: FeatureCardsProps) {
  if (!items.length) {
    return null;
  }

  const desktopColumns = getDesktopColumns(items.length);

  return (
    <div className="mt-10 max-w-6xl mx-auto">
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:[grid-template-columns:repeat(var(--feature-cols),minmax(0,1fr))]"
        style={{ "--feature-cols": desktopColumns } as CSSProperties}
      >
        {items.map((benefit) => (
          <BenefitCard
            key={benefit.title}
            title={benefit.title}
            text={benefit.text}
          />
        ))}
      </div>
    </div>
  );
}
