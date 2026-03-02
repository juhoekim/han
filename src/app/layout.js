import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "한순례권사 총무활동",
  description: "교회 수입/지출 관리 및 결산 보고서 시스템",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Navigation />
        <main className="main">
          {children}
        </main>
      </body>
    </html>
  );
}
