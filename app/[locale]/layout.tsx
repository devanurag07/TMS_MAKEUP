import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "../globals.css";
import "react-toastify/dist/ReactToastify.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const montserratMono = Montserrat({
  variable: "--font-montserrat-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Try My Style - AI Consultation",
  description: "AI-powered skin and hair analysis",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale)) {
    notFound();
  }

  // Providing all messages to the client side
  const messages = await getMessages();

  const isRtl = locale === "ar";

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"} className="m-0 p-0 w-full h-full">
      <body
        className={`${montserrat.variable} ${montserratMono.variable} antialiased bg-black m-0 p-0 w-full h-full ${isRtl ? "font-sans" : ""}`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
