// app/layout.js

import "./globals.css";                 // bring in all global styles

import { Plus_Jakarta_Sans } from "next/font/google"; // Google font helper
import NavBar from "../components/NavBar";            // top navigation bar
import Footer from "../components/Footer";            // bottom footer

// Load Plus Jakarta and store it as a CSS variable we can use in CSS
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],                  // basic latin characters
  variable: "--font-jakarta",          // name of the CSS variable
  weight: ["400", "600", "700", "800"],// allowed font weights
});

// Info for the browser tab and SEO
export const metadata = {
  title: "NIVIMC",
  description: "NIVIMC — web design & code studio",
};

// Viewport settings so PHONES STOP ZOOMING WEIRDLY
export const viewport = {
  width: "device-width",              // use the actual phone width
  initialScale: 1,                    // no auto zoom
  viewportFit: "cover",               // lets us use safe-area env() in CSS
};

export default function RootLayout({ children }) {
  return (
    // <html> wrapper; lang helps screen readers and SEO
    <html lang="en">
      {/* 
        body:
        - uses Jakarta font variable
        - full-height black canvas
        - white text
      */}
      <body
        className={`${jakarta.variable} bg-black text-white min-h-screen selection:bg-white selection:text-black`}
      >
        {/* Navbar always at the top */}
        <NavBar />

        {/* Main content; leave vertical space so footer sits at bottom */}
        <main className="min-h-[calc(100vh-160px)]">
          {children}
        </main>

        {/* Footer always at the bottom */}
        <Footer />
      </body>
    </html>
  );
}
