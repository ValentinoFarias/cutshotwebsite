/*
  SurveyPage — the /survey route: the same navbar and footer as the home page,
  with the questionnaire in between. Server component; only <Survey> is a
  client component, because it is the only part with state.

  The page's one <h1> belongs to <Survey>, the way the home page's belongs to
  <Hero>.
*/

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Survey from "@/components/Survey";

export default function SurveyPage() {
  return (
    <>
      {/* Tells the navbar which link to mark as the current page. */}
      <Navbar currentPath="/survey" />

      <main id="main-content" tabIndex={-1}>
        <Survey />
      </main>

      <Footer />
    </>
  );
}
