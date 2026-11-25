import Link from "next/link";

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar"><span className="mark">A</span><span>Agent Operations</span><span className="badge">SIMULATION ONLY</span></header>
      <section className="hero">
        <p className="eyebrow">CONTROL PLANE · v0.1</p>
        <h1>Business automation,<br />with the brakes on.</h1>
        <p className="intro">A deployable foundation for coordinating specialized agents. Financial operations are simulations only; no exchange, mining pool, or wallet is connected.</p>
        <div className="actions"><Link className="button" href="/api/health">Check service health <span>↗</span></Link><Link className="text-link" href="/api/agents">View agent roster</Link></div>
      </section>
      <section className="grid" aria-label="System capabilities">
        <article className="card"><span className="number">01</span><h2>Orchestrate</h2><p>35 configured agent roles across six departments, exposed through a read-only roster endpoint.</p></article>
        <article className="card"><span className="number">02</span><h2>Simulate</h2><p>Protected trade and mining simulation endpoint. Requests are logged; no financial action is performed.</p></article>
        <article className="card"><span className="number">03</span><h2>Accept payments</h2><p>Optional Stripe Checkout uses a server-configured Price ID. Keep Stripe in test mode while validating.</p></article>
      </section>
      <section className="notice"><strong>Safety boundary</strong><p>Live trading, mining, custody, wallet signing, and withdrawals are not implemented. Do not put wallet seed phrases, private keys, or exchange credentials in this service.</p></section>
      <footer>Built for controlled evaluation · <a href="https://vercel.com/docs" target="_blank" rel="noreferrer">Vercel deployment docs ↗</a></footer>
    </main>
  );
}
