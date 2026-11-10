// Entry point for the Claude artifact build of Sculpt (see scripts/build-sculpt-artifact.mjs).
import { createRoot } from "react-dom/client";
import WorkoutApp from "../components/workout/WorkoutApp";

createRoot(document.getElementById("root")).render(<WorkoutApp />);
