import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AREOLA | Forensic Intelligence",
  description: "Advanced Fraud Analysis Model",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">{/* Removed data-theme="dark" to default to light */}
      <body className="min-h-screen p-8 md:p-12 lg:p-16">
        <header className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-50 pointer-events-none">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Areola</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">Advanced Fraud Analysis Model</span>
            </div>
          </div>
          <div className="text-[10px] font-bold tracking-widest uppercase opacity-40">
            nmesoma's prototype
          </div>
        </header>
        <main className="max-w-7xl mx-auto pt-12">
          {children}
        </main>
      </body>
    </html>
  );
}