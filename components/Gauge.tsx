import { copy } from "@/constants/copy";
import { cn } from "@/lib/utils";
import type { GaugeColor } from "@/lib/companion/burnout";

const COLOR_STYLES: Record<GaugeColor, string> = {
  green: "bg-sage-100 text-sage-700 border-sage-200",
  amber: "bg-ochre-100 text-ochre-700 border-ochre-400",
  red: "bg-clay-100 text-clay-700 border-clay-400",
};

const DOT_STYLES: Record<GaugeColor, string> = {
  green: "bg-sage-700",
  amber: "bg-ochre-700",
  red: "bg-clay-700",
};

const LABEL: Record<GaugeColor, string> = {
  green: copy.gaugeLabelGreen,
  amber: copy.gaugeLabelAmber,
  red: copy.gaugeLabelRed,
};

const SUPPORTING: Record<GaugeColor, string> = {
  green: copy.gaugeSupportingGreen,
  amber: copy.gaugeSupportingAmber,
  red: copy.gaugeSupportingRed,
};

type GaugeProps = {
  color: GaugeColor;
  className?: string;
};

/**
 * Plain-language wellbeing gauge — word first, color follows (see
 * design_system/readme.md). Deliberately never renders the underlying
 * numeric score as a headline.
 */
export function Gauge({ color, className }: GaugeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-12 rounded-card border px-card-x py-card-y",
        COLOR_STYLES[color],
        className,
      )}
    >
      <span className={cn("h-11 w-11 flex-shrink-0 rounded-pill", DOT_STYLES[color])} aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <span className="text-title font-semibold">{LABEL[color]}</span>
        <span className="text-supporting">{SUPPORTING[color]}</span>
      </div>
    </div>
  );
}
