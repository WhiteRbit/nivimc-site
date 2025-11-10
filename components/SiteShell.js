import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function SiteShell({ children }) {
  return (
    <div className="min-h-screen page-enter">
      <NavBar />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
}
