import FilmingCamera from "@/components/motion/FilmingCamera";

/**
 * FilmingGuide — how to film so the analyser can read the video.
 *
 * Server component. Short and friendly: the near-player limit is stated as what
 * it is — how the analyser works — rather than dressed up as advice.
 *
 * <FilmingCamera> is the one pinned scene on the page. It shows the camera
 * position the first tip describes and nothing the tips do not already say;
 * with JavaScript off, or reduced motion on, the advice below is unchanged.
 */

/*
  The camera position changed on 2026-10-01, when serve speed shipped. It used
  to be chest height; serve speed finds the court from its lines and the net,
  and a camera at 2 m or lower sees the far half hidden behind the net. The
  app's best development camera sat about 3 m up and 6.5–7 m behind the
  baseline — the back fence — so that is the spot the guide now asks for.
*/
const tips = [
  {
    term: "Put the phone up high, behind the court",
    detail:
      "Centred behind the baseline and about 3 m up — the top of the back fence is usually right. Check that all four corners of the court are in frame, and the whole near player. A fence clamp or a tall tripod both work; it only has to stay still.",
  },
  {
    term: "Record at 60 fps",
    detail:
      "Serve speed is built for 60 frames per second: a fast serve travels almost a metre between two frames at 60 fps, and twice that at 30. On an iPhone: Settings → Camera → Record Video → 1080p at 60 fps.",
  },
  {
    term: "Only the near player is analysed",
    detail:
      "This is how the analyser works rather than a preference: it follows the player closest to the camera. So film the person you want to study from behind, and keep them the nearest body in the shot.",
  },
  {
    term: "H.264 MP4 is the safe format",
    detail: "It plays everywhere and imports without any fuss.",
  },
  {
    term: "iPhone video may not play",
    detail:
      "iPhones record HEVC .mov by default, and those files may not play in CutShot. Set Settings → Camera → Formats to “Most Compatible” before you film, or convert the file to H.264 MP4 afterwards.",
  },
];

export default function FilmingGuide() {
  return (
    <section className="home__section home__guide" aria-labelledby="home-guide-title">
      <div className="home__container home__container--narrow">
        <div className="home__section-head">
          <p className="home__eyebrow">Before you film</p>
          <h2 id="home-guide-title" className="home__section-title">
            Filming that the analyser can read
          </h2>
          <p className="home__lede">
            A minute of setup at the court makes everything afterwards easier.
          </p>
        </div>

        <FilmingCamera />

        <dl className="home__guide-list">
          {tips.map((tip) => (
            <div key={tip.term} className="home__guide-item">
              <dt className="home__guide-term">{tip.term}</dt>
              <dd className="home__guide-detail">{tip.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
