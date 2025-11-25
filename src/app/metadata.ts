import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_URL
      ? `${process.env.APP_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT || 3000}`
  ),
  title: "Faz Teu Mambo - Pretos Music Software",
  description:
    "Pretos Music Software: suite criativa para música, vídeo e narrativa.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    url: "/",
    title: "Faz Teu Mambo - Pretos Music Software",
    description:
      "Pretos Music Software: suite criativa para música, vídeo e narrativa.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Faz Teu Mambo - Pretos Music Software",
    description:
      "Pretos Music Software: suite criativa para música, vídeo e narrativa."
  }
}; 