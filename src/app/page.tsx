import Link from "next/link";
import "./landing.css";

/* ═══════════════════════════════════════════════════════
   MAIN PAGE — IT4You AI ERP Landing
   ═══════════════════════════════════════════════════════ */

export default function Home() {
  return (
    <div className="landing-page">
      {/* ─── Header ─────────────────────────────────── */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link href="/" className="landing-logo">
            <img src="/it4you-landing-logo.jpeg" alt="IT4You" />
          </Link>

          <nav>
            <Link href="/login" className="btn-login">
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Hero ───────────────────────────────────── */}
      <section className="landing-hero">
        {/* Background image layer */}
        <div className="landing-hero-bg" />

        <div className="landing-content">
          {/* Top area: text on left + robot on right */}
          <div className="landing-hero-top">
            {/* Hero text */}
            <div className="landing-hero-text">
              <h1>
                Converse com seu{" "}
                <span className="hl-blue">analista de IA</span> e{" "}
                <strong className="hl-green">descubra</strong>
                <br />
                insights do seu ERP em segundos.
              </h1>

              <p className="landing-subtitle">
                Pergunte como &ldquo;qual o lucro do mês?&rdquo; ou
                &ldquo;quais clientes ainda estão devendo?&rdquo; e receba
                instantâneas com gráficos claros.
              </p>

              <Link href="/login" className="landing-main-btn">
                Conversar <span>com meu Analista de IA</span> →
              </Link>
            </div>

            {/* Robot — side by side with text */}
            <div className="landing-robot-wrapper">
              <img
                src="/robot-assistant.png"
                alt="MIA – Assistente de IA IT4You"
              />
            </div>
          </div>

          {/* ── Dashboard preview cards ── */}
          <div className="landing-dashboard">
            {/* Card 1 — Financial Overview */}
            <div className="landing-card">
              <div className="landing-question">
                <span className="landing-question-icon">💬</span>
                Qual o lucro do mês?
              </div>
              <img
                className="landing-card-chart"
                src="/card-financial.png"
                alt="Financial Overview — R$ 820,400"
              />
            </div>

            {/* Card 2 — Clientes Inadimplentes */}
            <div className="landing-card">
              <div className="landing-question">
                <span className="landing-question-icon">💬</span>
                Quais clientes inadimplentes?
              </div>
              <img
                className="landing-card-chart"
                src="/card-clientes.png"
                alt="Clientes inadimplentes — Total R$ 233,530"
              />
            </div>

            {/* Card 3 — Produtos com mais saída */}
            <div className="landing-card">
              <div className="landing-question">
                <span className="landing-question-icon">💬</span>
                Quais produtos têm mais saída?
              </div>
              <img
                className="landing-card-chart"
                src="/card-produtos.png"
                alt="Produtos com mais saída — Total R$ 270,870"
              />
            </div>
          </div>

          {/* ── Feature cards ── */}
          <div className="landing-features">
            <div className="landing-feature">
              <div className="landing-feature-icon">💬</div>
              <h3>Pergunte o que quiser</h3>
              <p>
                Pergunte como &ldquo;Qual foi o lucro de ontem?&rdquo; ou
                &ldquo;Temos peças X no estoque?&rdquo;, e a IA responde
                instantaneamente com a informação correta.
              </p>
            </div>

            <div className="landing-feature">
              <div className="landing-feature-icon">🗄️</div>
              <h3>Conectado ao seu ERP</h3>
              <p>
                Acesse seus dados em tempo real, sem precisar gerar relatórios ou
                fazer integrações complexas. Funciona diretamente com seu ERP.
              </p>
            </div>

            <div className="landing-feature">
              <div className="landing-feature-icon">🛡️</div>
              <h3>Confiável e seguro</h3>
              <p>
                Cada empresa vê apenas seus dados, e totalmente seguro. Os dados
                não se misturam com outras organizações.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
