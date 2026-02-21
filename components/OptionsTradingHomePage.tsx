import React, { useState } from 'react';

interface OptionsTradingHomePageProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onPrimaryCtaClick?: () => void;
}

const faqItems = [
  {
    question: 'How do I learn how to trade?',
    answer:
      'Start with a demo account, explore tutorials, and practice with small virtual amounts before risking real funds.',
  },
  {
    question: 'How long does withdrawal take?',
    answer:
      'Most withdrawals are processed within minutes to several hours, depending on method and verification status.',
  },
  {
    question: 'Can I trade on mobile?',
    answer:
      'Yes. You can use the web platform in a browser or trade via the mobile app.',
  },
  {
    question: 'Minimum deposit?',
    answer: 'The minimum deposit to start real trading is 10 USD.',
  },
  {
    question: 'Are there withdrawal fees?',
    answer:
      'Withdrawal fees depend on the payment provider. Always review the fee breakdown before confirming a payout.',
  },
];

const OptionsTradingHomePage: React.FC<OptionsTradingHomePageProps> = ({
  onLoginClick,
  onSignupClick,
  onPrimaryCtaClick,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col scroll-smooth">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/40">
              <span className="text-lg font-black text-slate-950">GX</span>
            </div>
            <div className="hidden flex-col text-xs font-semibold text-slate-300 sm:flex">
              <span className="text-sm font-black tracking-tight text-white">GeminiX</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/80">Options Trading</span>
            </div>
          </div>

          {/* Center nav */}
          <nav className="hidden items-center space-x-8 text-xs font-medium text-slate-300 md:flex">
            <a href="#demo" className="hover:text-emerald-300 transition-colors">
              Demo account
            </a>
            <a href="#about" className="hover:text-emerald-300 transition-colors">
              About us
            </a>
            <a href="#faq" className="hover:text-emerald-300 transition-colors">
              FAQ
            </a>
            <a href="#blog" className="hover:text-emerald-300 transition-colors">
              Blog
            </a>
          </nav>

          {/* Right actions */}
          <div className="hidden items-center space-x-3 text-xs md:flex">
            <button
              className="rounded-full border border-slate-500/60 px-4 py-1.5 font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300 transition-colors"
              onClick={onLoginClick}
            >
              Log in
            </button>
            <button
              className="rounded-full bg-emerald-500 px-4 py-1.5 font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 transition-transform hover:-translate-y-0.5"
              onClick={onSignupClick}
            >
              Sign up
            </button>
            <button className="inline-flex items-center space-x-1 rounded-full border border-slate-600/70 bg-slate-900/60 px-3 py-1.5 font-semibold text-slate-200 text-[11px]">
              <span>EN</span>
              <i className="fa-solid fa-chevron-down text-[9px]" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section id="home" className="relative overflow-hidden border-b border-slate-800/80">
          {/* Background chart pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.16),_transparent_55%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,_rgba(15,23,42,0.8)_1px,_transparent_1px),linear-gradient(to_bottom,_rgba(15,23,42,0.8)_1px,_transparent_1px)] bg-[size:80px_80px] mix-blend-soft-light" />
          </div>

          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-10 sm:px-6 lg:flex-row lg:py-16">
            {/* Hero content */}
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <p className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-200">
                <span className="mr-2 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Innovative options platform
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                Innovative platform for smart investments
              </h1>
              <p className="max-w-xl text-sm sm:text-base text-slate-200 mx-auto lg:mx-0">
                Sign up and get <span className="font-semibold text-emerald-300">10,000 USD</span> to your demo account
                to learn how to trade.
              </p>

              <div className="space-y-3 sm:space-y-2">
                <button
                  className="w-full sm:w-auto rounded-full bg-emerald-500 px-6 py-2.5 text-xs font-black uppercase tracking-[0.25em] text-slate-950 shadow-xl shadow-emerald-500/40 transition-transform hover:-translate-y-0.5 hover:bg-emerald-400"
                  onClick={onPrimaryCtaClick}
                >
                  Create a free account
                </button>
                <p className="text-[11px] text-slate-300">
                  Minimum deposit for real trading is <span className="font-semibold text-emerald-300">10 USD</span>.
                </p>
              </div>
            </div>

            {/* Platform preview */}
            <div className="mt-8 flex-1 w-full max-w-xl lg:mt-0">
              <div className="relative rounded-3xl border border-sky-500/20 bg-slate-900/70 p-4 shadow-[0_25px_70px_rgba(15,23,42,1)] backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between text-[11px] text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold">EUR / USD</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-emerald-300">OTC</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">87% payout</span>
                  </div>
                </div>

                <div className="h-40 rounded-2xl bg-slate-950/80 p-2 ring-1 ring-slate-800">
                  <div className="flex h-full items-end space-x-1">
                    {[10, 18, 14, 24, 20, 30, 26, 32, 22, 28, 24, 34].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-sky-500/60 via-emerald-400/70 to-emerald-200/90"
                        style={{ height: `${h * 2.5}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                  <div className="rounded-2xl bg-slate-900/90 p-3 ring-1 ring-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Demo balance</span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-300">USD</span>
                    </div>
                    <p className="mt-1 text-lg font-bold tracking-tight text-white">10,000.00</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/90 p-3 ring-1 ring-slate-800">
                    <span className="text-slate-400">Next expiry</span>
                    <p className="mt-1 text-lg font-bold tracking-tight text-white">00:21</p>
                    <p className="mt-1 text-[10px] text-slate-500">Fixed return contract</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
                      <i className="fa-solid fa-arrow-trend-up" />
                    </span>
                    <div>
                      <p className="font-semibold">CALL</p>
                      <p className="text-[10px] text-slate-400">$50 / 1 min</p>
                    </div>
                  </div>
                  <button className="rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-50 hover:bg-slate-700">
                    View full terminal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="about" className="border-b border-slate-800/80 bg-slate-950/80 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Features of the platform</h2>
              <p className="mt-2 text-sm sm:text-base text-slate-400">
                We regularly improve our tools and infrastructure to make your trading comfortable and safe.
              </p>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'User-friendly interface',
                  desc: 'Access charts, order tickets and history in a few clicks.',
                  icon: 'fa-display',
                },
                {
                  title: 'Integrated signals',
                  desc: 'Signals designed to highlight potential high probability setups.',
                  icon: 'fa-wave-square',
                },
                {
                  title: 'Trading indicators',
                  desc: 'Combine indicators to test strategies on a safe demo balance.',
                  icon: 'fa-sliders',
                },
                {
                  title: 'Support 24/7',
                  desc: 'Get help from the support team whenever you need it.',
                  icon: 'fa-headset',
                },
                {
                  title: 'Bonus programs',
                  desc: 'Join tournaments, leaderboards and community events.',
                  icon: 'fa-gift',
                },
                {
                  title: 'Deposits & withdrawals',
                  desc: 'Fund and withdraw with popular, fast payment methods.',
                  icon: 'fa-wallet',
                },
              ].map((f) => (
                <article
                  key={f.title}
                  className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.95)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-1 hover:border-emerald-400/60 hover:bg-slate-900/90"
                >
                  <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                    <i className={`fa-solid ${f.icon}`} />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">{f.title}</h3>
                  <p className="mt-1 flex-1 text-xs sm:text-sm text-slate-400">{f.desc}</p>
                  <button className="mt-3 inline-flex items-center text-[11px] font-semibold text-emerald-300 group-hover:text-emerald-200">
                    Learn more
                    <i className="fa-solid fa-arrow-right ml-1 text-[9px]" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* DEMO CTA STRIP */}
        <section id="demo" className="border-b border-slate-800/80 bg-slate-950 py-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 shadow-[0_18px_40px_rgba(15,23,42,1)] sm:flex-row">
              <p className="text-sm sm:text-base font-medium text-slate-100 text-center sm:text-left">
                Trade on demo — no registration required. Open the terminal and test strategies in seconds.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                <button className="rounded-full bg-slate-900 px-5 py-2 font-black uppercase tracking-[0.2em] text-slate-50 ring-1 ring-slate-500 hover:bg-slate-800">
                  Try demo
                </button>
                <button className="rounded-full bg-emerald-500 px-5 py-2 font-black uppercase tracking-[0.2em] text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400">
                  Register account
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* HOW TRADING WORKS */}
        <section className="border-b border-slate-800/80 bg-slate-950/90 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-6 rounded-3xl bg-slate-900/80 p-6 shadow-[0_24px_60px_rgba(15,23,42,1)] backdrop-blur-xl lg:grid-cols-[1.1fr,1.2fr]">
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Grow your capital by making the right trading predictions
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-slate-400">
                    Follow a structured process to evaluate assets, read price action, and place disciplined trades with
                    defined risk.
                  </p>
                </div>
                <button className="mt-4 w-full sm:w-auto rounded-full bg-emerald-500 px-6 py-2.5 text-xs font-black uppercase tracking-[0.25em] text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400">
                  Try it for free
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    step: '1',
                    title: 'Select asset',
                    text: 'Choose from currencies, crypto, indices or commodities.',
                  },
                  {
                    step: '2',
                    title: 'Monitor chart',
                    text: 'Analyze trends, volatility, and key support/resistance levels.',
                  },
                  {
                    step: '3',
                    title: 'Place a trade',
                    text: 'Define direction, amount and time to expiry based on your view.',
                  },
                  {
                    step: '4',
                    title: 'Get result',
                    text: 'Receive a fixed payout when your forecast is correct.',
                  },
                ].map((s) => (
                  <div
                    key={s.step}
                    className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.9)]"
                  >
                    <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-black text-emerald-300">
                      {s.step}
                    </div>
                    <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-400">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="border-b border-slate-800/80 bg-slate-950 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">What people say about us</h2>
                <p className="mt-2 text-sm sm:text-base text-slate-400">
                  Traders share how they practice and refine their strategies using the demo environment.
                </p>
              </div>
              <button className="rounded-full border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-400 hover:text-emerald-300">
                View all reviews
              </button>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'Arif H.',
                  date: '02 Feb 2026',
                  earned: '$420.50',
                  rating: 5,
                  text: 'Great way to get comfortable with options-style payouts before investing real money.',
                },
                {
                  name: 'Maya R.',
                  date: '28 Jan 2026',
                  earned: '$1,120.00',
                  rating: 5,
                  text: 'The interface feels like a professional desk but stays friendly for beginners.',
                },
                {
                  name: 'Daniel C.',
                  date: '15 Jan 2026',
                  earned: '$260.75',
                  rating: 4,
                  text: 'Signals and indicators together helped me build a structured playbook.',
                },
              ].map((t) => (
                <article
                  key={t.name + t.date}
                  className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-[0_18px_45px_rgba(15,23,42,1)]"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div>
                      <p className="font-semibold text-slate-100">{t.name}</p>
                      <p className="text-slate-500">{t.date}</p>
                    </div>
                    <div className="text-[10px] text-yellow-300 flex items-center space-x-1">
                      <div>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <i
                            key={i}
                            className={`fa-solid fa-star ${i < t.rating ? 'text-yellow-300' : 'text-slate-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 font-semibold text-emerald-300">
                      Earned {t.earned}
                    </span>
                  </div>
                  <p className="mt-3 flex-1 text-xs sm:text-sm text-slate-200">"{t.text}"</p>
                  <button className="mt-3 inline-flex items-center text-[11px] font-semibold text-emerald-300 hover:text-emerald-200">
                    Read more
                    <i className="fa-solid fa-arrow-right ml-1 text-[9px]" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* MOBILE APP SECTION */}
        <section className="border-b border-slate-800/80 bg-slate-950/95 py-12 sm:py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 sm:px-6 lg:flex-row">
            <div className="flex-1 flex justify-center lg:justify-start">
              <div className="h-72 w-36 rounded-[2rem] border border-slate-700 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-4 shadow-[0_28px_70px_rgba(15,23,42,1)]">
                <div className="mb-3 flex items-center justify-between text-[10px] text-slate-300">
                  <span className="font-semibold">GeminiX App</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-300">Online</span>
                </div>
                <div className="h-40 rounded-2xl bg-slate-900/80 p-2">
                  <div className="flex h-full items-end space-x-1">
                    {[8, 14, 10, 18, 12, 20, 16].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-sky-500/60 via-emerald-400/70 to-emerald-200/90"
                        style={{ height: `${h * 4}%` }}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-slate-400">
                  Track favorite assets and manage positions from anywhere.
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-3 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Mobile app is always at your fingertips
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                Stay connected to the market with a responsive web app or native mobile experience.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 lg:justify-start text-xs">
                <button className="inline-flex items-center space-x-2 rounded-2xl bg-slate-900 px-4 py-2 font-semibold text-slate-100 ring-1 ring-slate-600 hover:bg-slate-800">
                  <i className="fa-brands fa-google-play text-lg" />
                  <span>Google Play</span>
                </button>
                <button className="inline-flex items-center space-x-2 rounded-2xl bg-slate-900 px-4 py-2 font-semibold text-slate-100 ring-1 ring-slate-600 hover:bg-slate-800">
                  <i className="fa-solid fa-globe text-lg" />
                  <span>Web App</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="border-b border-slate-800/80 bg-slate-950 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white text-center">
              Frequently asked questions
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400 text-center">
              Find quick answers to the most common questions from new traders.
            </p>

            <div className="mt-6 space-y-3">
              {faqItems.map((item, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={item.question}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-[0_18px_40px_rgba(15,23,42,1)]"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between text-left"
                      onClick={() => toggleFaq(index)}
                    >
                      <span className="text-sm font-semibold text-slate-100">{item.question}</span>
                      <span className="ml-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] text-slate-200">
                        {isOpen ? '-' : '+'}
                      </span>
                    </button>
                    {isOpen && <p className="mt-2 text-xs sm:text-sm text-slate-300">{item.answer}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950/95 text-slate-300">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500">
                  <span className="text-sm font-black text-slate-950">GX</span>
                </div>
                <span className="text-sm font-bold text-white">GeminiX</span>
              </div>
              <p className="text-xs text-slate-500">
                A simulated options-style trading interface created for practice and educational scenarios.
              </p>
              <div className="flex space-x-3 text-lg text-slate-400">
                <a href="#" className="hover:text-emerald-300">
                  <i className="fa-brands fa-x-twitter" />
                </a>
                <a href="#" className="hover:text-emerald-300">
                  <i className="fa-brands fa-facebook-f" />
                </a>
                <a href="#" className="hover:text-emerald-300">
                  <i className="fa-brands fa-telegram" />
                </a>
                <a href="#" className="hover:text-emerald-300">
                  <i className="fa-brands fa-instagram" />
                </a>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Company</h3>
              <a href="#about" className="block text-slate-300 hover:text-emerald-300">
                About us
              </a>
              <a href="#" className="block text-slate-300 hover:text-emerald-300">
                Contacts
              </a>
            </div>

            <div className="space-y-2 text-sm">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">More</h3>
              <a href="#demo" className="block text-slate-300 hover:text-emerald-300">
                Demo account
              </a>
              <a href="#" className="block text-slate-300 hover:text-emerald-300">
                Affiliate program
              </a>
              <a href="#app" className="block text-slate-300 hover:text-emerald-300">
                Download app
              </a>
            </div>

            <div className="space-y-2 text-sm">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Legal</h3>
              <a href="#" className="block text-slate-300 hover:text-emerald-300">
                Privacy policy
              </a>
              <a href="#" className="block text-slate-300 hover:text-emerald-300">
                Risk disclosure
              </a>
              <a href="#" className="block text-slate-300 hover:text-emerald-300">
                Terms &amp; conditions
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-4 text-[10px] leading-relaxed text-slate-500">
            <p className="mb-2 font-semibold text-slate-400">Risk warning</p>
            <p>
              Trading digital options and similar contracts involves a high level of risk and may not be suitable for
              all investors. You may lose all of your invested capital. Do not trade with funds you cannot afford to
              lose. Information on this page is provided for demonstration and educational purposes only and should not
              be considered investment advice.
            </p>
            <p className="mt-2">
              Availability of features and services may be restricted in certain jurisdictions due to legal or
              regulatory requirements. It is your responsibility to ensure that your use of the platform complies with
              local laws and regulations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OptionsTradingHomePage;
