import { GameProvider } from "../context/GameContext";
import "./globals.css";

export const metadata = {
  title: "Solstice Cipher",
  description: "Decode the cipher before the darkness consumes the light",
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