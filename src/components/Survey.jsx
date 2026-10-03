"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { release } from "@/data/release";

/*
  Survey — ten tap-to-answer questions for the people trying CutShot. It
  replaced the free-text feedback form on 2026-10-03: a box asking "what broke?"
  gets left empty, while ten questions you answer by tapping get finished.

  ---------------------------------------------------------------------------
  How this reaches Netlify
  ---------------------------------------------------------------------------
  Same trick the feedback form used. Netlify only registers a form its
  build-time crawler can see in static HTML, and it cannot see a React-rendered
  one, so public/__forms.html holds a hidden copy of these field names. This
  component POSTs to that same path as urlencoded data.

  Every `name` in `questions` below, plus form-name, bot-field, comments,
  appVersion and userAgent, MUST also appear in public/__forms.html. A field
  missing there is dropped from the submission without any error.

  The site also needs "form detection" switched on in Netlify (Site
  configuration → Forms). With it off, nothing is registered and every
  submission is lost, which is what happened to the old feedback form.

  ---------------------------------------------------------------------------
  Answers
  ---------------------------------------------------------------------------
  Every question is optional, because someone who skips one they have no view
  on still gives us the other nine. The only rule is that a submission must
  carry at least one answer. Answers are sent as their visible text, not as
  codes, so the Netlify dashboard reads like the questions did.
*/

/* Netlify's endpoint for this form: the static file it crawled at build. */
const FORM_ENDPOINT = "/__forms.html";
const FORM_NAME = "survey";

const COMMENTS_MAX = 2000;

/* The 1-to-10 scale, as the strings the boxes show and the form sends. */
const scaleOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

/*
  The questions, in the order they are shown.
  type "single" — one answer, drawn as radio buttons.
  type "multi"  — any number of answers, drawn as checkboxes.
  type "scale"  — one number from 1 to 10.
  Only name features the app really has: the site never promises more.
*/
const questions = [
  {
    name: "install",
    title: "How easy was CutShot to install?",
    type: "single",
    options: ["Easy", "Took a couple of tries", "Hard", "I could not install it"],
  },
  {
    name: "intuitive",
    title: "Did you find the app intuitive?",
    type: "single",
    options: ["Yes, straight away", "After a few minutes", "Not really"],
  },
  {
    name: "shotsFound",
    title: "How many of your shots did it find?",
    type: "single",
    options: ["Almost all", "Most", "About half", "Only a few"],
  },
  {
    name: "strokeTypes",
    title: "Did it name your strokes right — forehand, backhand, serve?",
    type: "single",
    options: ["Almost always", "Mostly", "Often wrong"],
  },
  {
    name: "serveSpeed",
    title: "Did you try the serve speed?",
    type: "single",
    options: [
      "Yes, the numbers looked right",
      "Yes, but the numbers looked off",
      "I could not get it to work",
      "I did not try it",
    ],
  },
  {
    name: "analysisTime",
    title: "How did the analysis time feel?",
    type: "single",
    options: ["Fine", "Slow, but worth the wait", "Too slow"],
  },
  {
    name: "featuresUsed",
    title: "Which parts did you use?",
    hint: "Pick all that apply.",
    type: "multi",
    options: [
      "Automatic shot detection",
      "Marking shots by hand",
      "Serve speed",
      "Exporting clips",
      "Colour themes",
    ],
  },
  {
    name: "recommend",
    title: "How likely are you to recommend CutShot to a friend?",
    hint: "1 is not at all, 10 is definitely.",
    type: "scale",
    options: scaleOptions,
  },
  {
    name: "wouldPay",
    title: "Would you pay for a product like this?",
    type: "single",
    options: ["Yes", "Maybe", "No"],
  },
  {
    name: "fairPrice",
    title: "What would feel like a fair one-off price?",
    type: "single",
    options: ["Under £10", "£10–£25", "£25–£50", "Over £50"],
  },
];

/**
 * True when a question has an answer: a non-empty string for single and
 * scale questions, a non-empty list for multi questions.
 *
 * @param {string|string[]|undefined} answer
 * @returns {boolean}
 */
function isAnswered(answer) {
  if (Array.isArray(answer)) return answer.length > 0;
  return typeof answer === "string" && answer !== "";
}

export default function Survey() {
  /* One entry per answered question, keyed by its `name`. */
  const [answers, setAnswers] = useState({});
  const [comments, setComments] = useState("");
  const [botField, setBotField] = useState("");
  const [userAgent, setUserAgent] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  /* Two kinds of message: "you have not answered anything yet" (the visitor's
     to fix) and "the send failed" (ours, so it offers the email fallback). */
  const [emptyError, setEmptyError] = useState("");
  const [sendError, setSendError] = useState("");

  /* Read after mount, never during render, so the first client render matches
     the server HTML exactly. */
  useEffect(() => {
    if (typeof navigator !== "undefined") setUserAgent(navigator.userAgent || "");
  }, []);

  // Single and scale questions: the tapped option replaces any earlier answer.
  function chooseOne(questionName, option) {
    setAnswers((previous) => ({ ...previous, [questionName]: option }));
    setEmptyError("");
  }

  // Multi questions: tapping an option adds it, tapping it again removes it.
  function toggleOption(questionName, option) {
    setAnswers((previous) => {
      const current = previous[questionName] || [];
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...previous, [questionName]: next };
    });
    setEmptyError("");
  }

  // Whether an option box is currently ticked, for either kind of question.
  function isChosen(question, option) {
    const answer = answers[question.name];
    if (question.type === "multi") return Array.isArray(answer) && answer.includes(option);
    return answer === option;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    /* Honeypot. Only a bot fills in a field no person can see: pretend it
       worked and send nothing. */
    if (botField.trim() !== "") {
      setSubmitted(true);
      return;
    }

    const trimmedComments = comments.trim();
    const answeredCount = questions.filter((question) => isAnswered(answers[question.name])).length;

    // An empty submission tells us nothing, so ask for at least one tap.
    if (answeredCount === 0 && trimmedComments === "") {
      setEmptyError("Tap at least one answer before sending.");
      return;
    }

    setSubmitting(true);
    setSendError("");

    try {
      const body = new URLSearchParams({
        "form-name": FORM_NAME,
        "bot-field": "",
        comments: trimmedComments,
        appVersion: release.version,
        userAgent,
      });

      // One field per question. Unanswered ones go as empty strings, and the
      // ticks of a multi question go as one comma-separated line.
      questions.forEach((question) => {
        const answer = answers[question.name];
        const value = Array.isArray(answer) ? answer.join(", ") : answer || "";
        body.append(question.name, value);
      });

      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error(`The form returned ${response.status}.`);
      }

      setSubmitted(true);
    } catch (submitError) {
      setSendError(
        submitError instanceof Error && submitError.message
          ? submitError.message
          : "The form could not be sent.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="home__section home__survey" aria-labelledby="survey-title">
      {/* Decorative brand mark in the bottom corner, as on the old feedback form. */}
      <div className="home__survey-watermark" aria-hidden="true">
        <Image
          className="home__watermark-image"
          src="/cutshot-mark.svg"
          alt=""
          width={1024}
          height={1024}
        />
      </div>

      <div className="home__container home__container--narrow home__survey-inner">
        <div className="home__section-head">
          <p className="home__eyebrow">Survey</p>
          <h1 id="survey-title" className="home__section-title">
            Ten quick questions
          </h1>
          <p className="home__lede">
            Tap the answers that fit. Every question is optional, no name is
            needed, and it takes about two minutes. This is how CutShot decides
            what to fix next.
          </p>
        </div>

        {submitted ? (
          <div className="home__survey-success" role="status">
            <h2 className="home__survey-success-title">Thank you — that came through.</h2>
            <p className="home__survey-success-body">
              I read every one of these. If something else comes to mind, email me
              at{" "}
              <a className="home__link" href={`mailto:${release.trial.contact}`}>
                {release.trial.contact}
              </a>
              .
            </p>
          </div>
        ) : (
          <form
            className="home__survey-form"
            name={FORM_NAME}
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Netlify keys the submission off this. */}
            <input type="hidden" name="form-name" value={FORM_NAME} readOnly />

            {/* Honeypot: off-screen, out of the tab order, hidden from screen
                readers. Only a bot ever fills this in. */}
            <div className="home__visually-hidden" aria-hidden="true">
              <label htmlFor="survey-bot-field">Leave this field empty</label>
              <input
                id="survey-bot-field"
                name="bot-field"
                type="text"
                value={botField}
                onChange={(event) => setBotField(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <ol className="home__survey-list">
              {questions.map((question, questionIndex) => (
                <li key={question.name} className="home__survey-question">
                  {/* A fieldset + legend is what makes a screen reader announce
                      the question before each option. */}
                  <fieldset className="home__survey-fieldset">
                    <legend className="home__survey-legend">
                      <span className="home__survey-number home__numeric">
                        {String(questionIndex + 1).padStart(2, "0")}
                      </span>
                      {question.title}
                    </legend>

                    {question.hint ? (
                      <p className="home__survey-hint">{question.hint}</p>
                    ) : null}

                    <div
                      className={
                        question.type === "scale"
                          ? "home__survey-options home__survey-options--scale"
                          : "home__survey-options"
                      }
                    >
                      {question.options.map((option) => {
                        const chosen = isChosen(question, option);

                        return (
                          <label
                            key={option}
                            className={
                              chosen
                                ? "home__survey-option home__survey-option--chosen"
                                : "home__survey-option"
                            }
                          >
                            {/* The real input stays in the page for keyboards
                                and screen readers; the box around it is what
                                people see and tap. */}
                            <input
                              className="home__visually-hidden home__survey-input"
                              type={question.type === "multi" ? "checkbox" : "radio"}
                              name={question.name}
                              value={option}
                              checked={chosen}
                              onChange={() =>
                                question.type === "multi"
                                  ? toggleOption(question.name, option)
                                  : chooseOne(question.name, option)
                              }
                            />
                            {option}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </li>
              ))}
            </ol>

            <div className="home__survey-comments">
              <label className="home__survey-legend" htmlFor="survey-comments">
                Anything else?{" "}
                <span className="home__survey-optional">optional</span>
              </label>
              <textarea
                className="home__textarea"
                id="survey-comments"
                name="comments"
                rows={4}
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                maxLength={COMMENTS_MAX}
              />
            </div>

            {/* Context I would otherwise have to ask for. */}
            <input type="hidden" name="appVersion" value={release.version} readOnly />
            <input type="hidden" name="userAgent" value={userAgent} readOnly />

            <div className="home__survey-actions">
              <button className="home__btn home__survey-submit" type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Send answers"}
              </button>

              {/* Always in the page so a screen reader is already listening
                  when an error appears. A failed send is never a dead end. */}
              <p className="home__form-error" role="status" aria-live="polite">
                {emptyError ? (
                  <span className="home__form-error-text">{emptyError}</span>
                ) : null}
                {sendError ? (
                  <>
                    <span className="home__form-error-text">
                      That did not send. {sendError}
                    </span>{" "}
                    <span>
                      Your answers are still here, so you can try again, or email{" "}
                      <a className="home__link" href={`mailto:${release.trial.contact}`}>
                        {release.trial.contact}
                      </a>
                      .
                    </span>
                  </>
                ) : null}
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
