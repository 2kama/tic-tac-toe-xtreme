import type { Metadata } from "next";
import "./globals.css";
import DarkModeProvider from "./components/DarkModeProvider";

export const metadata: Metadata = {
  title: "Tic Tac Toe Xtreme",
  description: "Play a game with friends"
};

const darkModeScript = `
  (function () {
    try {
      if (localStorage.getItem("tic-tac-toe-dark-mode") === "true") {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sedgwick+Ave&display=swap" rel="stylesheet" />
      </head>
      <body>
        <DarkModeProvider>
          <div className="flex flex-col w-full min-h-screen">
            {children}
            <div className="theme-piece fixed bottom-1 w-full text-center text-sm">built by Mishael Kama</div>
          </div>
        </DarkModeProvider>
      </body>
    </html>
  );
}
