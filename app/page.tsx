import { copy } from "@/constants/copy";

export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <p className="text-body text-ink-500">{copy.scaffoldPlaceholder}</p>
    </main>
  );
}
