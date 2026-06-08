import { GameProvider } from "../context/GameContext";
import "./globals.css";

export const metadata = {
  title: "Solstice Cipher — Decode the light before darkness wins",
  description:
    "A Caesar cipher game where light and darkness battle for the sky. Decode the cipher before the timer runs out and the darkness consumes everything.",
  metadataBase: new URL("https://ifeanyi-solstice.netlify.app"),

  openGraph: {
    title: "Solstice Cipher — Decode the light before darkness wins",
    description:
      "A Caesar cipher game where light and darkness battle for the sky. Decode the cipher before the timer runs out and the darkness consumes everything.",
    url: "https://ifeanyi-solstice.netlify.app",
    siteName: "Solstice Cipher",
    images: [
      {
        url: "https://ifeanyi-solstice.netlify.app/logo.png",
        width: 1200,
        height: 630,
        alt: "Solstice Cipher — Decode the light before darkness wins",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Solstice Cipher — Decode the light before darkness wins",
    description:
      "A Caesar cipher game where light and darkness battle for the sky. Decode the cipher before the timer runs out and the darkness consumes everything.",
    images: ["https://ifeanyi-solstice.netlify.app/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GameProvider>
          {children}
        </GameProvider>
        <div id="modal-root" />
      </body>
    </html>
  );
}