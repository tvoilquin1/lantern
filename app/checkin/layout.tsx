// "Still Water" — scoped to this route only. Imports its own stylesheet
// instead of the Lamplight design_system/ tokens used by the rest of the
// app (see app/layout.tsx). Do not import design_system/ tokens here, and
// do not import ./checkin.css from any other route.
import "./checkin.css";

export default function CheckinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
