import SurveyPage from "@/views/SurveyPage";

/* The survey link gets pasted into WhatsApp like the home page does, so it
   carries its own title and URL for the preview. Next replaces the layout's
   `openGraph` block whole rather than merging it, so the image is repeated
   here; it starts working when /og.png exists, same as on the home page. */
const title = "CutShot — ten quick questions";
const description =
  "Tried CutShot? Ten tap-to-answer questions about installing it, how well it found your shots, serve speed and what it is worth to you.";

export const metadata = {
  title,
  description,
  alternates: {
    canonical: "/survey",
  },
  openGraph: {
    type: "website",
    url: "/survey",
    siteName: "CutShot",
    title,
    description,
    locale: "en_GB",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "CutShot — a desktop app for reviewing tennis training video.",
      },
    ],
  },
};

export default function Page() {
  return <SurveyPage />;
}
