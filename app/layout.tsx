import type { Metadata } from "next";

// Lamplight design system tokens — imported in dependency order
import "@/design_system/tokens/fonts.css";
import "@/design_system/tokens/colors.css";
import "@/design_system/tokens/typography.css";
import "@/design_system/tokens/spacing.css";
import "@/design_system/tokens/radius.css";
import "@/design_system/tokens/elevation.css";
import "@/design_system/tokens/motion.css";

// Tailwind base + app-level overrides
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Lantern",
  description: "An AI companion for dementia caregivers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
