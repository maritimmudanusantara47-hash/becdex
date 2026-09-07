import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export async function generateMetadata(): Promise<Metadata> {
  let seoData = {
    title: "BECdex — Blue Economy Company Index",
    desc: "Platform sertifikasi Blue Economy untuk perusahaan maritim Indonesia. Daftarkan perusahaan Anda dan dapatkan sertifikasi BECdex.",
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/cms`, { 
      next: { revalidate: 60 },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      seoData = {
        title: data.id['seo_home_title'] || data.id['seo.home.title'] || seoData.title,
        desc: data.id['seo_home_desc'] || data.id['seo.home.desc'] || seoData.desc,
      };
    }
  } catch {
    // Fallback to default
  }

  return {
    title: {
      default: seoData.title,
      template: "%s | BECdex",
    },
    description: seoData.desc,
    keywords: ["blue economy", "sertifikasi", "maritim", "becdex"],
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${nunito.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body suppressHydrationWarning className="min-h-full font-(--font-nunito)">

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
