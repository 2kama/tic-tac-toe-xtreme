import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "Tic Tac Toe Xtreme",
  description: "Play a game with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sedgwick+Ave&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="flex flex-col w-full min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
