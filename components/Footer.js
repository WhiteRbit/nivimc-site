// components/Footer.js
export default function Footer() {
  return (
    <footer
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483647,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          width: "100%",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          background: "rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.65)",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          textAlign: "center",
          padding: "10px 16px",
          fontSize: 13,
          lineHeight: 1,
          fontWeight: 400,
        letterSpacing: "0.05em",
           // force Plus Jakarta Sans here:
          fontFamily:
            'var(--font-jakarta), system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        © {new Date().getFullYear()} <span style={{ letterSpacing: "0.04em" }}>NIVIMC</span> — All rights reserved.
      </div>
    </footer>
  );
}
