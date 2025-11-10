// app/layout.js
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import Footer from "../components/Footer";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "600", "700", "800"],
});

export const metadata = {
  title: "NIVIMC",
  description: "NIVIMC — web design & code studio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="jakarta">
      <body className={`${jakarta.variable} min-h-screen bg-black text-white selection:bg-white selection:text-black`}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
