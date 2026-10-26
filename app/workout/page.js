import WorkoutApp from "@/components/workout/WorkoutLoader";

export const metadata = {
  title: "Squat Every Day — Workout Tracker",
  description: "Daily workout tracker with routines from Strength Training Anatomy and a back squat every day.",
  manifest: "/workout.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Squat Daily",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/workout-icons/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function WorkoutPage() {
  return <WorkoutApp />;
}
