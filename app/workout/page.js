import WorkoutApp from "@/components/workout/WorkoutLoader";

export const metadata = {
  title: "Sculpt",
  description: "Bikini Pro training plan, workout tracker and progress, with Strength Training Anatomy exercises.",
  manifest: "/workout.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Sculpt",
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
