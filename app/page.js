"use client";

import { useEffect, useState } from "react";

// Public anon key (safe to ship to the browser); env vars override it on Vercel.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tdiwozgrrzpmzubulfcq.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaXdvemdycnpwbXp1YnVsZmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzA5ODEsImV4cCI6MjA5MTk0Njk4MX0.fTBwKhRfaPq9fNQdt3rau2qkr2NZNBixNiH217lXS28";

// ─── Illustrative workpaper rows ──────────────────────────────────────────────
const ROWS = [
  { date: "09/02", desc: "HOME DEPOT #4471", amt: "−412.18", cat: "Materials & supplies", conf: 97 },
  { date: "09/03", desc: "SHELL OIL 5520", amt: "−86.40", cat: "Vehicle: fuel", conf: 96 },
  { date: "09/05", desc: "STRIPE TRANSFER", amt: "2,850.00", cat: "Landscaping revenue", conf: 99, inflow: true },
  {
    date: "09/08",
    desc: "AMAZON MKTPLACE PMTS",
    amt: "−219.99",
    cat: "Office supplies?",
    conf: 61,
    flag: true,
    note: "Mixed order. Ask client which items are personal.",
  },
  { date: "09/11", desc: "JOHN DEERE FINANCIAL", amt: "−1,240.00", cat: "Equipment loan payment", conf: 93 },
  { date: "09/15", desc: "VERIZON WIRELESS", amt: "−164.22", cat: "Phone & internet", conf: 95 },
  {
    date: "09/19",
    desc: "VENMO J. RUIZ",
    amt: "−600.00",
    cat: "Contract labor?",
    conf: 74,
    flag: true,
    note: "New contractor. Collect a W-9 before year-end.",
  },
  { date: "09/24", desc: "AUTOZONE 2210", amt: "−312.65", cat: "Vehicle: repairs", conf: 94 },
];

function Tick() {
  return (
    <svg className="mark mark-tick" viewBox="0 0 26 26" aria-hidden="true">
      <path d="M5 14.5 L10.5 20 L21.5 6.5" />
    </svg>
  );
}

function Flag() {
  return (
    <svg className="mark mark-flag" viewBox="0 0 26 26" aria-hidden="true">
      <ellipse cx="13" cy="13" rx="11" ry="10" transform="rotate(-8 13 13)" />
      <path d="M13 7.5 L13 14.5 M13 18.5 L13 18.6" />
    </svg>
  );
}

function Workpaper() {
  const [play, setPlay] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPlay(true), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <figure className={`workpaper-zone ${play ? "play" : ""}`}>
      <div className="sheet" role="table" aria-label="Example workpaper: September bank transactions categorized by Revela and reviewed by a CPA">
        <div className="sheet-head">
          <dl>
            <div>
              <dt>Client</dt>
              <dd>Martinez Landscaping LLC</dd>
            </div>
            <div>
              <dt>Account</dt>
              <dd>Business checking (CSV)</dd>
            </div>
            <div>
              <dt>Period</dt>
              <dd>September 2026</dd>
            </div>
          </dl>
          <dl className="signoff">
            <div>
              <dt>Prepared by</dt>
              <dd>Revela</dd>
            </div>
            <div>
              <dt>Reviewed by</dt>
              <dd className="signoff-cell">
                <span className="signoff-pending">Awaiting CPA</span>
                <span className="signoff-value signoff-signed">
                  <svg className="mark mark-tick" viewBox="0 0 26 26" aria-hidden="true" style={{ width: 18, height: 18 }}>
                    <path d="M5 14.5 L10.5 20 L21.5 6.5" style={{ strokeDashoffset: 0 }} />
                  </svg>
                  CPA, 6 approved
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <ul className="ledger">
          <li className="row row-head" aria-hidden="true">
            <span className="c-date">Date</span>
            <span className="c-desc">Bank description</span>
            <span className="c-amt">Amount</span>
            <span className="c-cat">Category</span>
            <span className="c-conf">Confidence</span>
            <span className="c-rev">Review</span>
            <span className="c-note">Notes</span>
          </li>
          {ROWS.map((r, i) => (
            <li key={r.desc} className="row" style={{ "--i": i }}>
              <span className="c-date num">{r.date}</span>
              <span className="c-desc">{r.desc}</span>
              <span className={`c-amt num ${r.inflow ? "amt-in" : ""}`}>{r.amt}</span>
              <span className={`c-cat anim-cat ${r.flag ? "cat-pending" : ""}`}>{r.cat}</span>
              <span className={`c-conf anim-conf conf ${r.conf < 80 ? "conf-low" : ""}`}>
                <span className="num">{r.conf}%</span>
                <span className="conf-bar" aria-hidden="true">
                  <span className="conf-fill" style={{ width: `${r.conf}%` }} />
                </span>
              </span>
              <span className="c-rev" aria-label={r.flag ? "Flagged for follow-up" : "Approved"}>
                {r.flag ? <Flag /> : <Tick />}
              </span>
              <span className="c-note">{r.note ? <p className="margin-note">{r.note}</p> : null}</span>
            </li>
          ))}
        </ul>
      </div>

      <aside className="slip" aria-label="Example advisory insight">
        <div>
          <h3>For the client conversation</h3>
          <p>
            Vehicle costs are running about $1,100 a month. A mileage log would let you compare the
            actual-expense method against the standard rate before Q4 estimates.
          </p>
        </div>
        <div className="slip-impact">
          <span>Estimated tax difference</span>
          <strong className="num">$1,900/yr</strong>
        </div>
      </aside>
      <figcaption className="illustrative">Illustrative example. Client name and figures are invented.</figcaption>
    </figure>
  );
}

// ─── Pilot request form ───────────────────────────────────────────────────────
function PilotForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid work email so we can reach you.");
      return;
    }
    setStatus("sending");
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { error: dbError } = await supabase.from("waitlist").insert([{ name, email }]);
      if (dbError) throw dbError;
      setStatus("sent");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError("Your request didn't go through. Check your connection and try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="form-done" role="status">
        <h3>Pilot request received</h3>
        <p>We'll reach out at {email} to schedule a walkthrough with your own client data.</p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="pilot-name">Your name and firm</label>
        <input
          id="pilot-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder="Dana Lee, Lee & Associates CPA"
        />
      </div>
      <div className="field">
        <label htmlFor="pilot-email">Work email</label>
        <input
          id="pilot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "pilot-error" : undefined}
        />
      </div>
      {error ? (
        <p id="pilot-error" className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending request…" : "Request a pilot"}
      </button>
    </form>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 22 22" aria-hidden="true">
      <rect x="1" y="1" width="20" height="20" rx="4" fill="#13302a" />
      <path d="M6 11.5 L9.5 15 L16 7" stroke="#f5f7f2" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    title: "Upload the bank CSV",
    body: "The bookkeeper exports the month's statement from the bank and drops it in. Any bank, no feeds to maintain.",
    who: "Bookkeeper",
  },
  {
    title: "Revela categorizes every line",
    body: "Each transaction gets a category, a confidence score, and the reasoning behind it, using the client's own chart of accounts and history.",
    who: "Revela",
  },
  {
    title: "The CPA signs off",
    body: "High-confidence entries are approved in bulk. Anything uncertain or tax-sensitive is flagged with a note so it gets a second look.",
    who: "CPA",
  },
  {
    title: "Approved entries post to QuickBooks",
    body: "Categories write back to QuickBooks Online, or to QuickBooks Desktop through the Web Connector. Nothing posts without approval.",
    who: "QuickBooks",
  },
  {
    title: "Clean books become advice",
    body: "Revela reads the reviewed ledger for deductions, entity and payroll questions, and revenue trends, then sizes each opportunity in dollars.",
    who: "Tax advisor",
  },
];

const VIEWS = [
  {
    title: "Bookkeeper",
    for: "Does the monthly work",
    items: [
      "Upload a CSV and see every line categorized in minutes",
      "A review queue sorted by confidence, lowest first",
      "QuickBooks sync status for each client",
    ],
  },
  {
    title: "CPA",
    for: "Signs off on the books",
    items: [
      "Bulk approve high-confidence entries in one pass",
      "Tax-risk flags with the reason attached",
      "Workload across every bookkeeper and client",
    ],
  },
  {
    title: "Tax advisor",
    for: "Turns books into recommendations",
    items: [
      "Opportunities per client, each with an estimated dollar impact",
      "An impact calculator for what-if conversations",
      "Notes ready to bring into the client meeting",
    ],
  },
  {
    title: "Client",
    for: "Sees what changed and why",
    items: [
      "What was categorized this month",
      "The tax impact of recommended changes",
      "Clear next actions, in plain language",
    ],
  },
];

const CONTROLS = [
  {
    title: "Nothing touches the books without approval",
    body: "Revela proposes. A person on your team approves before any entry writes back to QuickBooks.",
  },
  {
    title: "Every decision is on the record",
    body: "Each categorization logs the category, confidence, reasoning, and who approved or changed it, so you can answer for any entry later.",
  },
  {
    title: "Credentials stay encrypted",
    body: "QuickBooks connections use Intuit's production OAuth, and tokens are encrypted at rest. No plaintext keys.",
  },
  {
    title: "Each firm's data is walled off",
    body: "Bookkeepers, CPAs, advisors, and clients only see the clients they're assigned to.",
  },
];

export default function Home() {
  return (
    <>
      <header className="wrap nav">
        <a className="wordmark" href="#top" aria-label="Revela home">
          <Logo />
          Revela
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a className="nav-hide" href="#how">How it works</a>
          <a className="nav-hide" href="#views">For your team</a>
          <a className="nav-hide" href="#pricing">Pricing</a>
          <a className="btn btn-primary btn-small" href="#pilot">Request a pilot</a>
        </nav>
      </header>

      <main id="top">
        <section className="wrap hero">
          <h1>Clean books in. Client advice out.</h1>
          <p className="hero-lede">
            Revela categorizes your clients' bank transactions, routes them for CPA sign-off, writes
            them back to QuickBooks, then reads the clean ledger for tax savings and growth worth
            bringing to the client.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#pilot">Request a pilot</a>
            <a className="btn btn-secondary" href="#how">See how review works</a>
          </div>
          <p className="hero-note">Works with QuickBooks Online and QuickBooks Desktop.</p>
          <Workpaper />
        </section>

        <section id="how" className="section">
          <div className="wrap">
            <div className="section-intro">
              <h2>How a client's month closes</h2>
              <p>
                The workflow your bookkeepers already know, with the categorizing done for them and a
                CPA's sign-off built in.
              </p>
            </div>
            <ol className="route">
              {STEPS.map((s, i) => (
                <li key={s.title} className="route-step">
                  <span className="route-n num">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <span className="route-who">
                    Handled by
                    <strong>{s.who}</strong>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="views" className="section">
          <div className="wrap">
            <div className="section-intro">
              <h2>One ledger, four seats at the table</h2>
              <p>
                Everyone works from the same reviewed books. Each role sees the part of the job that's
                theirs.
              </p>
            </div>
            <div className="views">
              {VIEWS.map((v) => (
                <div key={v.title} className="view">
                  <h3>{v.title}</h3>
                  <p className="view-for">{v.for}</p>
                  <ul>
                    {v.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="controls" className="section">
          <div className="wrap controls-layout">
            <div className="section-intro">
              <h2>Controls your firm can stand behind</h2>
              <p>
                Your name is on the return. Revela is built so you can show how every number got
                there.
              </p>
            </div>
            <ul className="controls">
              {CONTROLS.map((c) => (
                <li key={c.title}>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="pricing" className="section">
          <div className="wrap">
            <div className="section-intro">
              <h2>Pricing</h2>
              <p>Start with one bookkeeper, or bring the whole practice.</p>
            </div>
            <div className="plans">
              <div className="plan">
                <h3>Bookkeeper</h3>
                <p className="plan-for">For an independent bookkeeping practice</p>
                <p className="price num">
                  $199<small>/month</small>
                </p>
                <p className="price-note">Billed monthly</p>
                <ul>
                  <li>CSV upload for any bank</li>
                  <li>Categorization with confidence scores</li>
                  <li>Review queue and audit trail</li>
                  <li>Write-back to QuickBooks Online or Desktop</li>
                </ul>
                <a className="btn btn-secondary" href="#pilot">Request a pilot</a>
              </div>
              <div className="plan plan-firm">
                <h3>Firm</h3>
                <p className="plan-for">For CPA and tax firms with multiple bookkeepers</p>
                <p className="price num">
                  $2,000<small>/month and up</small>
                </p>
                <p className="price-note">Priced by monthly transaction volume</p>
                <ul>
                  <li>Everything in Bookkeeper, for your whole team</li>
                  <li>CPA dashboard with bulk approval and tax-risk flags</li>
                  <li>Tax and growth insights per client</li>
                  <li>Client portal showing impact and next actions</li>
                </ul>
                <a className="btn btn-primary" href="#pilot">Talk to us about your volume</a>
              </div>
            </div>
          </div>
        </section>

        <section id="pilot" className="section">
          <div className="wrap pilot">
            <div className="section-intro">
              <h2>Run a pilot on your own clients</h2>
              <p>
                Revela is in a private pilot with an established tax and bookkeeping practice. We're
                opening a few more seats for boutique firms. Bring one month of a real client's bank
                CSV and compare it against how your team does it today.
              </p>
            </div>
            <PilotForm />
          </div>
        </section>
      </main>

      <footer className="wrap footer">
        <p>© 2026 Revela</p>
        <p>Built in Northern Virginia for bookkeepers and CPAs.</p>
      </footer>
    </>
  );
}
