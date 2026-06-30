"use client";
import React, { useState, useEffect } from 'react';
import { useGlobalScore } from './hooks/useGlobalScore';
import { motion } from 'framer-motion';
import Flashcards from './components/Flashcards';
import InteractiveCaseStudy from './components/InteractiveCaseStudy';
import EvaluationQuiz from './components/EvaluationQuiz';
import MobileNav from './components/MobileNav';
import { ArrowRight } from 'lucide-react';
import BiasDetector from './components/games/BiasDetector';
import DeepfakeOrReal from './components/games/DeepfakeOrReal';
import AIEthicsJudge from './components/games/AIEthicsJudge';
import PrivacyDefender from './components/games/PrivacyDefender';
import PromptResponsibility from './components/games/PromptResponsibility';

// Smoother and deeper reveal animation
function Reveal({ children, delay = 0, yOffset = 50, className = '', style = {} }: { children: React.ReactNode, delay?: number, yOffset?: number, className?: string, style?: React.CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

const SwipeHint = () => (
  <div className="swipe-hint">
    <span className="caption" style={{ color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginBottom: '8px' }}>
      Geser ke samping <ArrowRight size={14} style={{ animation: 'bounceRight 1.5s infinite' }} />
    </span>
  </div>
);

export default function Home() {
  const [activeSection, setActiveSection] = useState("");
  const { globalScore } = useGlobalScore();

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "";
      
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.scrollY >= sectionTop - 150) {
          current = section.getAttribute("id") || "";
        }
      });
      
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // setTimeout allows DOM to render before first check
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  let statusInfo = { text: "📚 Main Game Biar Dapat Point", color: "var(--color-muted)", bg: "var(--color-surface-strong)" };
  if (globalScore >= 700) {
    statusInfo = { text: "🎓 Sangat Paham (Siap Evaluasi!)", color: "#15803d", bg: "#dcfce7" };
  } else if (globalScore >= 300) {
    statusInfo = { text: "👍 Cukup Paham", color: "#b45309", bg: "#fef3c7" };
  } else if (globalScore > 0) {
    statusInfo = { text: "📚 Butuh Belajar Lagi", color: "#b91c1c", bg: "#fee2e2" };
  }

  return (
    <>
      <nav className="top-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <motion.div 
            key={globalScore}
            initial={{ scale: 1.2, color: 'var(--color-semantic-success)' }}
            animate={{ scale: 1, color: 'var(--color-ink)' }}
            className="badge-pill"
            style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-surface-strong)' }}
          >
            <span style={{ fontSize: '20px' }}>🏆</span> {globalScore.toLocaleString()} PTS
          </motion.div>

          <motion.div 
            key={statusInfo.text}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="badge-pill hidden-mobile"
            style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', color: statusInfo.color, backgroundColor: statusInfo.bg }}
          >
            {statusInfo.text}
          </motion.div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center' }}>
          <a href="#materi" className={`nav-link hidden-mobile ${activeSection === 'materi' ? 'active' : ''}`}>Materi</a>
          <a href="#aktivitas" className={`nav-link hidden-mobile ${activeSection === 'aktivitas' ? 'active' : ''}`}>Games</a>
          <a href="#evaluasi" className={`nav-link hidden-mobile ${activeSection === 'evaluasi' ? 'active' : ''}`}>Evaluasi</a>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#evaluasi" 
            className="button-primary"
          >
            Mulai Belajar
          </motion.a>
        </div>
      </nav>

      {/* SECTION 1 - HALAMAN PEMBUKA */}
      <header className="hero-band" style={{ minHeight: '90vh', justifyContent: 'center' }}>
        <motion.div 
          className="hero-orb"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.8, 0.4],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <div className="hero-content">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="badge-pill" 
            style={{ marginBottom: 'var(--spacing-base)' }}
          >
            Topik Pembelajaran Modul
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="display-mega"
            style={{ maxWidth: '800px' }}
          >
            Pemanfaatan AI Secara Etis
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="body-md" 
            style={{ maxWidth: '700px', fontSize: '20px', color: 'var(--color-muted)', marginTop: 'var(--spacing-md)' }}
          >
            Pahami cara kerja AI, sadari risiko yang menyertainya, dan belajarlah menggunakannya secara bertanggung jawab. Teknologi ini sudah menjadi bagian dari kehidupan kita—sekarang saatnya menggunakannya dengan bijak.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hero-ctas"
            style={{ marginTop: 'var(--spacing-xl)' }}
          >
            <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="#materi" className="button-primary" style={{ padding: '16px 32px', height: 'auto', fontSize: '16px' }}>Pelajari Materi</motion.a>
            <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="#aktivitas" className="button-outline" style={{ padding: '16px 32px', height: 'auto', fontSize: '16px' }}>Coba Aktivitas</motion.a>
          </motion.div>
        </div>
      </header>

      {/* Tujuan Pembelajaran */}
      <section className="section-alt">
        <div className="section-alt-inner">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xxl)' }}>
              <h2 className="display-md">Tujuan Pembelajaran</h2>
              <p className="body-md" style={{ color: 'var(--color-muted)', marginTop: 'var(--spacing-xs)' }}>Setelah menyelesaikan modul ini, mahasiswa mampu:</p>
            </div>
          </Reveal>
          
          <SwipeHint />
          <div className="bento-grid swipeable-grid">
            {[
              "Menjelaskan konsep dasar kecerdasan buatan (AI) dan prinsip etika yang menyertainya",
              "Mengidentifikasi potensi risiko dan dampak sosial dari penggunaan AI yang tidak etis",
              "Mengevaluasi kasus nyata penggunaan AI berdasarkan kerangka etika digital",
              "Menerapkan panduan pemanfaatan AI yang bertanggung jawab dalam kehidupan sehari-hari"
            ].map((text, i) => (
              <Reveal key={i} delay={i * 0.1} className="bento-col-6 bento-mobile-12">
                <motion.div 
                  className="feature-card"
                  style={{ height: '100%', padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}
                  whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
                >
                  <div style={{ fontSize: '36px', fontWeight: 300, color: 'var(--color-muted-soft)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>0{i+1}</div>
                  <p className="body-md" style={{ fontSize: '18px', fontWeight: 500 }}>{text}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2 - MATERI PEMBELAJARAN */}
      <main>
        {/* Sub-topik A */}
        <section id="materi" className="section">
          <Reveal>
            <div className="section-header" style={{ maxWidth: '800px', margin: '0 auto var(--spacing-xxl)', textAlign: 'center' }}>
              <div className="badge-pill" style={{ marginBottom: 'var(--spacing-md)' }}>Sub-topik A</div>
              <h2 className="display-lg">Apa Itu AI & Prinsip Etika AI</h2>
              <p className="body-md" style={{ marginTop: 'var(--spacing-lg)', fontSize: '18px' }}>
                Kecerdasan Buatan (AI) adalah kemampuan mesin meniru fungsi kognitif manusia. AI bekerja dengan mempelajari pola dari data besar untuk membuat prediksi atau keputusan.
              </p>
            </div>
          </Reveal>
          
          <div className="bento-grid">
            {/* Asymmetrical Bento Grid */}
            <Reveal delay={0.1} className="bento-col-7 bento-mobile-12">
              <motion.div className="feature-card" style={{ backgroundColor: 'var(--color-canvas-soft)', padding: 'var(--spacing-xl)', height: '100%' }}>
                <h3 className="display-sm" style={{ marginBottom: 'var(--spacing-md)' }}>AI bukan sekadar alat netral</h3>
                <p className="body-md" style={{ marginBottom: 'var(--spacing-md)' }}>
                  Setiap sistem AI dibuat oleh manusia, menggunakan data yang dipilih manusia, untuk tujuan manusia. Artinya: nilai-nilai, bias, dan ketidakadilan manusia bisa ikut terbawa ke dalam AI.
                </p>
                <p className="body-md">
                  Inilah mengapa dunia membutuhkan <strong>Etika AI</strong> — seperangkat prinsip yang memandu bagaimana AI seharusnya dikembangkan dan digunakan secara bertanggung jawab.
                </p>
              </motion.div>
            </Reveal>

            <Reveal delay={0.2} className="bento-col-5 bento-mobile-12">
              <motion.div className="feature-card" style={{ padding: 'var(--spacing-xl)', height: '100%' }}>
                <h3 className="title-md" style={{ marginBottom: 'var(--spacing-lg)' }}>Contoh AI Sehari-hari</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-sm)' }}>
                  <div style={{ padding: 'var(--spacing-base)', backgroundColor: 'var(--color-canvas-soft)', borderRadius: 'var(--rounded-md)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, minWidth: '100px' }}>Google Maps</div>
                    <div className="body-sm" style={{ color: 'var(--color-muted)' }}>Memprediksi kemacetan</div>
                  </div>
                  <div style={{ padding: 'var(--spacing-base)', backgroundColor: 'var(--color-canvas-soft)', borderRadius: 'var(--rounded-md)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, minWidth: '100px' }}>Spotify</div>
                    <div className="body-sm" style={{ color: 'var(--color-muted)' }}>Rekomendasi mood</div>
                  </div>
                  <div style={{ padding: 'var(--spacing-base)', backgroundColor: 'var(--color-canvas-soft)', borderRadius: 'var(--rounded-md)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, minWidth: '100px' }}>TikTok</div>
                    <div className="body-sm" style={{ color: 'var(--color-muted)' }}>Kurasi konten</div>
                  </div>
                </div>
              </motion.div>
            </Reveal>

            <Reveal delay={0.3} className="bento-col-12">
              <div style={{ marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-md)' }}>
                <h3 className="display-md" style={{ textAlign: 'center' }}>5 Prinsip Etika AI (UNESCO)</h3>
              </div>
            </Reveal>

          </div>
          
          <SwipeHint />
          <div className="bento-grid swipeable-grid">
            {/* 3 cards across */}
            {[
              { title: 'Transparansi', desc: 'Sistem AI harus bisa dijelaskan cara kerjanya. Pengguna berhak tahu mengapa AI membuat keputusan tertentu.' },
              { title: 'Akuntabilitas', desc: 'Ada pihak yang bertanggung jawab atas dampak dari keputusan AI, baik pengembang maupun penggunanya.' },
              { title: 'Keadilan (Fairness)', desc: 'AI tidak boleh diskriminatif. Hasilnya harus adil untuk semua kelompok orang tanpa terkecuali.' }
            ].map((item, i) => (
              <Reveal key={i} delay={0.1 + (i * 0.1)} className="bento-col-4 bento-mobile-12">
                <motion.div className="feature-card" style={{ padding: 'var(--spacing-lg)', height: '100%', borderTop: '4px solid var(--color-ink)' }}>
                  <h4 className="title-md" style={{ marginBottom: 'var(--spacing-sm)' }}>{item.title}</h4>
                  <p className="body-sm" style={{ color: 'var(--color-muted)' }}>{item.desc}</p>
                </motion.div>
              </Reveal>
            ))}

            {/* 2 cards across */}
            <Reveal delay={0.4} className="bento-col-6 bento-mobile-12">
              <motion.div className="feature-card" style={{ padding: 'var(--spacing-lg)', height: '100%', borderTop: '4px solid var(--color-ink)' }}>
                <h4 className="title-md" style={{ marginBottom: 'var(--spacing-sm)' }}>Privasi</h4>
                <p className="body-sm" style={{ color: 'var(--color-muted)' }}>AI tidak boleh mengumpulkan atau menyalahgunakan data pribadi pengguna tanpa izin yang jelas.</p>
              </motion.div>
            </Reveal>

            <Reveal delay={0.5} className="bento-col-6 bento-mobile-12">
              <motion.div className="feature-card" style={{ padding: 'var(--spacing-xl)', height: '100%', backgroundColor: 'var(--color-canvas-deep)', color: 'var(--color-on-dark)' }}>
                <h4 className="display-sm" style={{ color: 'var(--color-on-dark)', marginBottom: 'var(--spacing-sm)' }}>Human Oversight</h4>
                <p className="body-sm" style={{ color: 'var(--color-on-dark-soft)' }}>Manusia harus selalu memiliki kendali dan kemampuan untuk memantau, mengoreksi, atau menghentikan sistem AI kapan pun diperlukan.</p>
              </motion.div>
            </Reveal>
          </div>
        </section>

        {/* Sub-topik B */}
        <section className="section-alt">
          <div className="section-alt-inner">
            <Reveal>
              <div className="section-header" style={{ maxWidth: '800px', margin: '0 auto var(--spacing-xxl)', textAlign: 'center' }}>
                <div className="badge-pill" style={{ marginBottom: 'var(--spacing-md)' }}>Sub-topik B</div>
                <h2 className="display-lg">Risiko & Dampak Sosial</h2>
                <p className="body-md" style={{ marginTop: 'var(--spacing-lg)', fontSize: '18px' }}>
                  Ketika AI dikembangkan atau digunakan tanpa mempertimbangkan etika, dampaknya bisa sangat merugikan—bahkan berbahaya bagi tatanan sosial.
                </p>
              </div>
            </Reveal>
            
            <SwipeHint />
            <div className="bento-grid swipeable-grid">
              <Reveal delay={0.1} className="bento-col-6 bento-mobile-12">
                <motion.div className="feature-card" style={{ padding: 'var(--spacing-xl)', height: '100%' }}>
                  <div className="badge-pill" style={{ marginBottom: 'var(--spacing-md)' }}>Risiko 1</div>
                  <h3 className="display-sm" style={{ marginBottom: 'var(--spacing-base)' }}>Bias Algoritma</h3>
                  <p className="body-md" style={{ color: 'var(--color-muted)', marginBottom: 'var(--spacing-lg)' }}>
                    Terjadi ketika AI mereproduksi ketidakadilan karena data pelatihan yang tidak representatif atau mencerminkan prasangka historis.
                  </p>
                  <div style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-canvas-soft)', borderRadius: 'var(--rounded-lg)', borderLeft: '4px solid var(--color-ink)' }}>
                    <p className="body-sm"><strong>Kasus nyata:</strong> Pada 2018, Amazon menonaktifkan alat rekrutmen AI-nya karena sistematis menolak CV pelamar perempuan akibat data pelatihan masa lalu yang didominasi laki-laki.</p>
                  </div>
                </motion.div>
              </Reveal>
              
              <Reveal delay={0.2} className="bento-col-6 bento-mobile-12">
                <motion.div className="feature-card" style={{ padding: 'var(--spacing-xl)', height: '100%' }}>
                  <div className="badge-pill" style={{ marginBottom: 'var(--spacing-md)' }}>Risiko 2</div>
                  <h3 className="display-sm" style={{ marginBottom: 'var(--spacing-base)' }}>Deepfake</h3>
                  <p className="body-md" style={{ color: 'var(--color-muted)', marginBottom: 'var(--spacing-lg)' }}>
                    Manipulasi media oleh AI sehingga konten tampak sangat nyata, membuat seseorang terlihat melakukan sesuatu yang fiktif.
                  </p>
                  <div style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-canvas-soft)', borderRadius: 'var(--rounded-lg)', borderLeft: '4px solid var(--color-semantic-error)' }}>
                    <p className="body-sm"><strong>Dampak serius:</strong> Dapat merusak reputasi secara permanen, menimbulkan trauma psikologis, menyebarkan disinformasi pemilu, hingga penipuan berbasis identitas suara/wajah.</p>
                  </div>
                </motion.div>
              </Reveal>
              
              {/* Asymmetrical bottom row */}
              <Reveal delay={0.3} className="bento-col-7 bento-mobile-12">
                <motion.div className="feature-card" style={{ padding: 'var(--spacing-xl)', height: '100%' }}>
                  <div className="badge-pill" style={{ marginBottom: 'var(--spacing-md)' }}>Risiko 3</div>
                  <h3 className="display-sm" style={{ marginBottom: 'var(--spacing-base)' }}>Pelanggaran Privasi</h3>
                  <p className="body-md" style={{ color: 'var(--color-muted)', marginBottom: 'var(--spacing-lg)' }}>
                    Sistem AI memakan data massal. Masalah fatal terjadi bila data dikumpulkan tanpa izin dan disalahgunakan.
                  </p>
                  <div style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-canvas-soft)', borderRadius: 'var(--rounded-lg)', borderLeft: '4px solid var(--color-ink)' }}>
                    <p className="body-sm"><strong>Kasus nyata:</strong> Cambridge Analytica mengeksploitasi 87 juta data Facebook untuk manipulasi opini pemilih pada Pemilu AS 2016.</p>
                  </div>
                </motion.div>
              </Reveal>
              
              <Reveal delay={0.4} className="bento-col-5 bento-mobile-12">
                <motion.div className="feature-card" style={{ padding: 'var(--spacing-xl)', height: '100%' }}>
                  <div className="badge-pill" style={{ marginBottom: 'var(--spacing-md)' }}>Risiko 4</div>
                  <h3 className="display-sm" style={{ marginBottom: 'var(--spacing-base)' }}>Filter Bubble</h3>
                  <p className="body-md" style={{ color: 'var(--color-muted)', marginBottom: 'var(--spacing-lg)' }}>
                    Algoritma mengisolasi pengguna dengan hanya menyajikan konten yang disukai, menghilangkan paparan terhadap perspektif luar.
                  </p>
                  <div style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-canvas-soft)', borderRadius: 'var(--rounded-lg)', borderLeft: '4px solid var(--color-ink)' }}>
                    <p className="body-sm"><strong>Dampak serius:</strong> Polarisasi masyarakat memburuk, hilangnya pemikiran kritis.</p>
                  </div>
                </motion.div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Sub-topik C */}
        <section className="section">
          <Reveal>
            <div className="section-header" style={{ maxWidth: '800px', margin: '0 auto var(--spacing-xxl)', textAlign: 'center' }}>
              <div className="badge-pill" style={{ marginBottom: 'var(--spacing-md)' }}>Sub-topik C</div>
              <h2 className="display-lg">Penggunaan Bertanggung Jawab</h2>
              <p className="body-md" style={{ marginTop: 'var(--spacing-lg)', fontSize: '18px' }}>
                Memahami risiko AI bukan berarti menghindarinya. Ini adalah panduan praktis untuk memanfaatkannya dengan aman.
              </p>
            </div>
          </Reveal>

          <SwipeHint />
          <div className="bento-grid swipeable-grid">
            <Reveal delay={0.1} className="bento-col-6 bento-mobile-12">
              <motion.div className="feature-card" style={{ backgroundColor: 'var(--color-canvas-deep)', color: 'var(--color-on-dark)', padding: 'var(--spacing-xl)', height: '100%' }}>
                <h3 className="display-sm" style={{ color: 'var(--color-on-dark)', marginBottom: 'var(--spacing-lg)' }}>Framework PAPA</h3>
                <p className="body-md" style={{ color: 'var(--color-on-dark-soft)', marginBottom: 'var(--spacing-lg)' }}>Evaluasi 4 hal ini sebelum menyebarkan konten hasil AI:</p>
                <div style={{ display: 'grid', gap: 'var(--spacing-base)' }}>
                  <div style={{ padding: 'var(--spacing-base)', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--rounded-md)' }}>
                    <strong style={{ display: 'block', fontSize: '18px', marginBottom: '4px' }}>P — Privacy</strong>
                    <span style={{ color: 'var(--color-on-dark-soft)' }}>Apakah ada data pribadi orang? Apakah sudah izin?</span>
                  </div>
                  <div style={{ padding: 'var(--spacing-base)', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--rounded-md)' }}>
                    <strong style={{ display: 'block', fontSize: '18px', marginBottom: '4px' }}>A — Accuracy</strong>
                    <span style={{ color: 'var(--color-on-dark-soft)' }}>Apakah informasinya akurat dan sudah diverifikasi?</span>
                  </div>
                  <div style={{ padding: 'var(--spacing-base)', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--rounded-md)' }}>
                    <strong style={{ display: 'block', fontSize: '18px', marginBottom: '4px' }}>P — Property</strong>
                    <span style={{ color: 'var(--color-on-dark-soft)' }}>Apakah menghormati hak cipta kreator asli?</span>
                  </div>
                  <div style={{ padding: 'var(--spacing-base)', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--rounded-md)' }}>
                    <strong style={{ display: 'block', fontSize: '18px', marginBottom: '4px' }}>A — Accessibility</strong>
                    <span style={{ color: 'var(--color-on-dark-soft)' }}>Apakah penggunaannya adil bagi semua kelompok?</span>
                  </div>
                </div>
              </motion.div>
            </Reveal>

            <Reveal delay={0.2} className="bento-col-6 bento-mobile-12">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', height: '100%' }}>
                <motion.div className="feature-card" style={{ padding: 'var(--spacing-xl)', flexGrow: 1 }}>
                  <h3 className="title-md" style={{ color: 'var(--color-semantic-success)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                    Etis (Boleh Dilakukan)
                  </h3>
                  <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }} className="body-md text-muted">
                    <li>Alat bantu untuk memahami konsep sulit</li>
                    <li><em>Brainstorming</em> kerangka pemikiran awal</li>
                    <li>Memeriksa tata bahasa / terjemahan</li>
                    <li>Dicantumkan secara transparan di metodologi/referensi</li>
                  </ul>
                </motion.div>

                <motion.div className="feature-card" style={{ padding: 'var(--spacing-xl)', flexGrow: 1 }}>
                  <h3 className="title-md" style={{ color: 'var(--color-semantic-error)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✗</div>
                    Tidak Etis (Dilarang)
                  </h3>
                  <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }} className="body-md text-muted">
                    <li>Plagiasi karya AI seluruhnya seolah buatan sendiri</li>
                    <li>Menjawab ujian / kuis secara diam-diam</li>
                    <li>Menyebarkan informasi tanpa verifikasi fakta (halusinasi AI)</li>
                    <li>Membuat konten merugikan orang lain</li>
                  </ul>
                </motion.div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* SECTION 3 - AKTIVITAS INTERAKTIF */}
        <section id="aktivitas" className="section-alt">
          <div className="section-alt-inner">
            <Reveal>
              <div className="section-header" style={{ maxWidth: '800px', margin: '0 auto var(--spacing-xxl)', textAlign: 'center' }}>
                <h2 className="display-lg">Arcade Etika AI (Interaktif)</h2>
                <p className="body-md" style={{ marginTop: 'var(--spacing-lg)', fontSize: '18px' }}>
                  Uji dan perdalam pemahamanmu melalui simulasi, mini-games, dan *flashcard* berikut.
                </p>
              </div>
            </Reveal>

            <div style={{ marginBottom: 'var(--spacing-section)' }}>
              <Reveal delay={0.1}>
                <h3 className="display-md" style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>Mini Games</h3>
              </Reveal>
              <div className="bento-grid">
                <Reveal delay={0.1} className="bento-col-6 bento-mobile-12"><BiasDetector /></Reveal>
                <Reveal delay={0.2} className="bento-col-6 bento-mobile-12"><DeepfakeOrReal /></Reveal>
                <Reveal delay={0.3} className="bento-col-12 bento-mobile-12"><AIEthicsJudge /></Reveal>
                <Reveal delay={0.4} className="bento-col-12 bento-mobile-12" style={{ display: 'flex', justifyContent: 'center' }}><PrivacyDefender /></Reveal>
                <Reveal delay={0.5} className="bento-col-12 bento-mobile-12"><PromptResponsibility /></Reveal>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-section)' }}>
              <Reveal delay={0.1}>
                <h3 className="display-md" style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>Kosakata Etika Digital</h3>
              </Reveal>
              <Flashcards />
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <Reveal delay={0.1}>
                <h3 className="display-md" style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>Studi Kasus AI</h3>
              </Reveal>
              <InteractiveCaseStudy />
            </div>
          </div>
        </section>

        {/* SECTION 4 - EVALUASI */}
        <section id="evaluasi" className="section">
          <Reveal>
            <div className="section-header" style={{ maxWidth: '800px', margin: '0 auto var(--spacing-xxl)', textAlign: 'center' }}>
              <h2 className="display-lg">Evaluasi Pembelajaran</h2>
              <p className="body-md" style={{ marginTop: 'var(--spacing-lg)', fontSize: '18px' }}>
                Pilih satu jawaban yang paling tepat. Tes ini akan menguji kerangka berpikir etismu.
              </p>
            </div>
          </Reveal>
          
          <EvaluationQuiz />
        </section>
      </main>

      {/* SECTION 5 - REFERENSI & FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xxl)' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h3 className="display-sm" style={{ marginBottom: 'var(--spacing-base)' }}>Pemanfaatan AI Secara Etis</h3>
              <p className="body-md" style={{ color: 'var(--color-muted)' }}>Mata Kuliah Literasi Dasar<br/>Universitas Muhammadiyah Surakarta</p>
              <div style={{ marginTop: 'var(--spacing-xl)' }}>
                <motion.a 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  href="#materi" 
                  className="button-outline" 
                  style={{ borderColor: 'var(--color-hairline-strong)', color: 'var(--color-body)' }}
                >
                  Kembali ke Atas
                </motion.a>
              </div>
            </div>
            
            <div style={{ flex: '2 1 500px' }}>
              <h4 className="caption-uppercase" style={{ marginBottom: 'var(--spacing-lg)' }}>Referensi Utama</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '16px', listStyleType: 'decimal' }} className="body-md text-muted">
                <li>UNESCO. (2021). <em>Recommendation on the Ethics of Artificial Intelligence</em>.</li>
                <li>European Commission. (2019). <em>Ethics Guidelines for Trustworthy AI</em>.</li>
                <li>Jobin, A., Ienca, M., & Vayena, E. (2019). The global landscape of AI ethics guidelines. <em>Nature Machine Intelligence</em>.</li>
                <li>Partnership on AI. (2023). <em>Responsible Practices for Synthetic Media</em>.</li>
                <li>OECD. (2023). <em>OECD AI Principles</em>.</li>
              </ul>
            </div>
          </div>
          <div style={{ paddingTop: 'var(--spacing-xl)', marginTop: 'var(--spacing-xl)', borderTop: '1px solid var(--color-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="body-sm" style={{ color: 'var(--color-muted-soft)' }}>&copy; {new Date().getFullYear()} Bahan Ajar Digital UMS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Mobile Nav */}
      <MobileNav activeSection={activeSection} />

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1024px) {
          .bento-col-7, .bento-col-6, .bento-col-5, .bento-col-4, .bento-col-3 {
            grid-column: span 6;
          }
        }
        @media (max-width: 768px) {
          .hidden-mobile { display: none; }
          .bento-mobile-12 { grid-column: span 12 !important; }
        }
      `}} />
    </>
  );
}
