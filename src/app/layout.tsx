import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/layout/Navbar/page";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReduxProvider from "@/redux/reduxProvider";
import ReferralRedirect from "./ReferralRedirect/page";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Sulmine | Stake & Mine SUL Tokens on PolluxChain",
  description: "Sulmine is a mining platform on PolluxChain. Stake SUL tokens earn rewards, and mine seamlessly with next-gen blockchain technology.",
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  keywords: 'Sulmine, PolluxChain, stake, mine, SUL tokens, rewards.',
  openGraph: {
    type: 'website',
    title: "Sulmine | Stake & Mine SUL Tokens on PolluxChain",
    description: "Sulmine is a mining platform on PolluxChain. Stake SUL tokens earn rewards, and mine seamlessly with next-gen blockchain technology.",
    url: 'https://sulmine.sulaana.com/',
    images: [
      {
        url: 'https://sulmine.sulaana.com/Logo.svg', // Full URL for the image
        width: 1200,
        height: 630,
        alt: 'sulmine-logo-image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Sulmine | Stake & Mine SUL Tokens on PolluxChain",
  description: "Sulmine is a mining platform on PolluxChain. Stake SUL tokens earn rewards, and mine seamlessly with next-gen blockchain technology.",
    images: [
      {
        url: 'https://sulmine.sulaana.com/Logo.svg', // Full URL for the image
        alt: 'sulmine-logo-image',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <link rel="icon" href="/Logo.svg" type="image/*" />
      <link rel="canonical" href="https://www.sulmine.sulaana.com/" />
       <link rel="alternate"  href="https://www.sulmine.sulaana.com/dashboard" />
       <head>

        {/* <meta name="google-site-verification" content="LiiyqTZPc3uXRtlUbkiZHfJKHDgAnOeBUDnl4YRduFM" /> */}
        
        {/* OpenGraph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Sulmine | Stake & Mine SUL Tokens on PolluxChain" />
        <meta property="og:description" content="Sulmine is a mining platform on PolluxChain. Stake SUL tokens earn rewards, and mine seamlessly with next-gen blockchain technology." />
        <meta property="og:url" content="https://www.sulmine.sulaana.com/" />
        <meta property="og:image" content="https://sulmine.sulaana.com/Logo.svg" />

        {/* JSON-LD Schema Markup for WebPage */}
        <script type="application/ld+json">
          {`
          {
            "@context": "http://schema.org",
            "@type": "WebPage",
            "name": "Sulmine | Stake & Mine SUL Tokens on PolluxChain",
            "url": "https://www.sulmine.sulaana.com/",
            "description": "Sulmine is a mining platform on PolluxChain. Stake SUL tokens earn rewards, and mine seamlessly with next-gen blockchain technology.",
            "potentialAction": {
              "@type": "Action",
              "name": "Sulmine is a mining platform on PolluxChain",
              "target": "https://www.sulmine.sulaana.com/"
            }
          }
          `}
        </script>
</head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
         <ToastContainer
            position="top-center"
            autoClose={3000}
            theme="dark"
            newestOnTop={true}
            pauseOnFocusLoss
            toastClassName="custom-toast"
          />
           <ReferralRedirect />
        <Navbar />
        {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
