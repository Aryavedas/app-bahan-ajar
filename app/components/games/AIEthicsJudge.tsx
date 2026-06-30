"use client";
import React, { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Gavel, Scale, ThumbsUp, ThumbsDown, Info, Play, RotateCcw, CheckCircle2, XCircle, ArrowRight, Target } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { useGlobalScore } from '../../hooks/useGlobalScore';

interface CaseData {
  desc: string;
  isEthical: boolean;
  reason: string;
  principle: string;
}

const cases: CaseData[] = [
  { desc: 'Menggunakan ChatGPT untuk menulis seluruh skripsi tanpa menyebutkannya.', isEthical: false, reason: 'Plagiarisme digital — melanggar integritas akademik.', principle: 'Akuntabilitas' },
  { desc: 'Menggunakan AI untuk brainstorming kerangka artikel, lalu mengembangkannya sendiri.', isEthical: true, reason: 'AI sebagai alat bantu berpikir, bukan pengganti penulis.', principle: 'Transparansi' },
  { desc: 'Membuat deepfake wajah teman untuk bahan lelucon di grup kampus.', isEthical: false, reason: 'Melanggar privasi dan berpotensi mencemarkan nama baik.', principle: 'Privasi' },
  { desc: 'Perusahaan menggunakan AI memilah CV, tapi seleksi akhir tetap oleh manusia.', isEthical: true, reason: 'Menerapkan prinsip Human Oversight dengan benar.', principle: 'Human Oversight' },
  { desc: 'Menyebarkan artikel berita hasil AI ke media sosial tanpa memverifikasi isinya.', isEthical: false, reason: 'Risiko halusinasi AI — menyebarkan hoaks tanpa verifikasi.', principle: 'Akuntabilitas' },
  { desc: 'Guru menggunakan AI untuk membuat variasi soal ujian yang lebih beragam.', isEthical: true, reason: 'Penggunaan kreatif AI untuk meningkatkan kualitas pendidikan.', principle: 'Keadilan' }
];

interface VerdictRecord {
  caseIndex: number;
  playerChoice: boolean;
  correct: boolean;
}

type GamePhase = 'intro' | 'swipe' | 'verdict' | 'gameover';

export default function AIEthicsJudge() {
  const { playSound } = useSound();
  const { addScore } = useGlobalScore();
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [verdicts, setVerdicts] = useState<VerdictRecord[]>([]);
  const [lastPlayerChoice, setLastPlayerChoice] = useState(false);

  // Motion values for swipe
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const cardOpacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);

  // Swipe direction indicators
  const noOpacity = useTransform(x, [-120, -50, 0], [1, 0.3, 0]);
  const yesOpacity = useTransform(x, [0, 50, 120], [0, 0.3, 1]);

  const startGame = () => {
    playSound('click');
    setPhase('swipe');
    setScore(0);
    setCurrentIndex(0);
    setVerdicts([]);
  };

  const handleDecision = useCallback((judgedEthical: boolean) => {
    const current = cases[currentIndex];
    x.set(0);

    const isCorrect = current.isEthical === judgedEthical;
    if (isCorrect) {
      setScore(prev => prev + 10);
      addScore(10);
      playSound('correct');
    } else {
      playSound('wrong');
    }

    setLastPlayerChoice(judgedEthical);
    setVerdicts(prev => [...prev, {
      caseIndex: currentIndex,
      playerChoice: judgedEthical,
      correct: isCorrect
    }]);

    // Show verdict screen
    setPhase('verdict');
  }, [currentIndex, x]);

  const handleNextAfterVerdict = () => {
    if (currentIndex + 1 < cases.length) {
      playSound('click');
      setCurrentIndex(prev => prev + 1);
      setPhase('swipe');
    } else {
      const finalCorrectCount = verdicts.filter(v => v.correct).length;
      if (finalCorrectCount >= cases.length / 2) {
        playSound('win');
      } else {
        playSound('gameover');
      }
      setPhase('gameover');
    }
  };

  const handleSwipeEnd = (_event: any, info: any) => {
    const threshold = 100;
    if (info.offset.x < -threshold) {
      handleDecision(false);
    } else if (info.offset.x > threshold) {
      handleDecision(true);
    } else {
      x.set(0);
    }
  };

  // --- Progress Dots ---
  const ProgressDots = () => (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: 'var(--spacing-md)' }}>
      {cases.map((_, i) => {
        const verdict = verdicts.find(v => v.caseIndex === i);
        let bg = 'var(--color-hairline)';
        if (verdict) {
          bg = verdict.correct ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)';
        } else if (i === currentIndex && phase === 'swipe') {
          bg = 'var(--color-primary)';
        }
        return (
          <div
            key={i}
            style={{
              width: i === currentIndex && phase === 'swipe' ? '24px' : '8px',
              height: '8px',
              borderRadius: 'var(--rounded-pill)',
              backgroundColor: bg,
              transition: 'all 0.3s ease'
            }}
          />
        );
      })}
    </div>
  );

  // ============ INTRO SCREEN ============
  if (phase === 'intro') {
    return (
      <div className="feature-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-card)' }}>
        <div style={{ padding: 'var(--spacing-xl)', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-canvas-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-md)', color: 'var(--color-ink)' }}>
            <Scale size={32} />
          </div>
          <h3 className="display-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>AI Ethics Judge</h3>

          {/* Tujuan Badge */}
          <div className="badge-pill" style={{ marginBottom: 'var(--spacing-lg)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Target size={14} />
            Uji kemampuanmu menilai etika penggunaan AI
          </div>

          <div style={{ backgroundColor: 'var(--color-canvas-soft)', padding: 'var(--spacing-base)', borderRadius: 'var(--rounded-md)', textAlign: 'left', marginBottom: 'var(--spacing-lg)', border: '1px solid var(--color-hairline)', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600 }}>
              <Info size={16} /> Peran Anda: Hakim Etika
            </div>
            <ul className="body-sm" style={{ paddingLeft: '20px', color: 'var(--color-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Baca 6 berkas kasus penggunaan AI.</li>
              <li>Geser kartu ke <b>Kanan</b> jika dinilai <b>Etis</b>.</li>
              <li>Geser kartu ke <b>Kiri</b> jika dinilai <b>Tidak Etis</b>.</li>
              <li>Atau gunakan tombol di bawah kartu.</li>
              <li>Setiap vonis benar bernilai <b>10 poin</b>.</li>
            </ul>
          </div>

          <button className="button-primary" onClick={startGame} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Gavel size={18} /> Mulai Mengadili
          </button>
        </div>
      </div>
    );
  }

  // ============ VERDICT RESULT SCREEN ============
  if (phase === 'verdict') {
    const currentCase = cases[currentIndex];
    const latestVerdict = verdicts[verdicts.length - 1];
    const isCorrect = latestVerdict?.correct ?? false;

    return (
      <div className="feature-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-card)' }}>
        <div style={{ padding: 'var(--spacing-xl)', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <ProgressDots />

          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key="verdict-result"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                style={{ textAlign: 'center', width: '100%' }}
              >
                {/* Verdict Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1, damping: 12 }}
                  style={{ marginBottom: 'var(--spacing-md)' }}
                >
                  {isCorrect ? (
                    <CheckCircle2 size={56} color="var(--color-semantic-success)" />
                  ) : (
                    <XCircle size={56} color="var(--color-semantic-error)" />
                  )}
                </motion.div>

                {/* Verdict Title */}
                <motion.h3
                  className="display-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{
                    marginBottom: 'var(--spacing-sm)',
                    color: isCorrect ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)'
                  }}
                >
                  {isCorrect ? 'Vonis Tepat!' : 'Vonis Keliru!'}
                </motion.h3>

                {/* Player's choice vs correct answer */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ marginBottom: 'var(--spacing-md)' }}
                >
                  <div className="caption" style={{ color: 'var(--color-muted)', marginBottom: '4px' }}>
                    Jawaban kamu: <b style={{ color: lastPlayerChoice ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)' }}>{lastPlayerChoice ? 'Etis' : 'Tidak Etis'}</b>
                    {' · '}
                    Jawaban benar: <b style={{ color: currentCase.isEthical ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)' }}>{currentCase.isEthical ? 'Etis' : 'Tidak Etis'}</b>
                  </div>
                </motion.div>

                {/* Explanation Card */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    backgroundColor: 'var(--color-canvas-soft)',
                    border: '1px solid var(--color-hairline)',
                    borderRadius: 'var(--rounded-lg)',
                    padding: 'var(--spacing-base)',
                    textAlign: 'left',
                    marginBottom: 'var(--spacing-md)'
                  }}
                >
                  <div className="caption-uppercase" style={{ color: 'var(--color-muted)', marginBottom: '6px' }}>
                    Penjelasan
                  </div>
                  <p className="body-md" style={{ marginBottom: 'var(--spacing-sm)' }}>
                    {currentCase.reason}
                  </p>
                  <div className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Scale size={12} />
                    {currentCase.principle}
                  </div>
                </motion.div>

                {/* Score indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="body-strong"
                  style={{ marginBottom: 'var(--spacing-lg)', color: isCorrect ? 'var(--color-semantic-success)' : 'var(--color-muted)' }}
                >
                  {isCorrect ? '+10 Poin' : '+0 Poin'}
                </motion.div>

                {/* Next button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    className="button-primary"
                    onClick={handleNextAfterVerdict}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    {currentIndex + 1 < cases.length ? (
                      <>Kasus Berikutnya <ArrowRight size={16} /></>
                    ) : (
                      <>Lihat Hasil Akhir <ArrowRight size={16} /></>
                    )}
                  </button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // ============ GAME OVER SCREEN ============
  if (phase === 'gameover') {
    const maxScore = cases.length * 10;
    const correctCount = verdicts.filter(v => v.correct).length;

    let title = 'Hakim Etika Sempurna! 🌟';
    let subtitle = 'Anda sangat menjunjung tinggi etika AI.';
    if (correctCount < 3) {
      title = 'Masih Perlu Belajar ⚠️';
      subtitle = 'Mari pelajari prinsip etika AI lebih dalam.';
    } else if (correctCount < 5) {
      title = 'Hakim yang Baik 👍';
      subtitle = 'Pemahaman etika Anda sudah cukup, tapi masih bisa lebih tajam!';
    } else if (correctCount < cases.length) {
      title = 'Hampir Sempurna! 🎯';
      subtitle = 'Sedikit lagi menuju vonis sempurna!';
    }

    return (
      <div className="feature-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-card)' }}>
        <div style={{ padding: 'var(--spacing-xl)', flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <Gavel size={40} color="var(--color-primary)" style={{ marginBottom: 'var(--spacing-sm)' }} />
            <h3 className="display-sm" style={{ marginBottom: '4px' }}>{title}</h3>
            <p className="display-md" style={{ color: 'var(--color-primary)', marginBottom: '4px' }}>{score} / {maxScore}</p>
            <p className="body-sm" style={{ color: 'var(--color-muted)' }}>{subtitle}</p>
          </div>

          {/* Detailed Verdict Recap */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
            <div className="caption-uppercase" style={{ color: 'var(--color-muted)', marginBottom: '2px' }}>
              Rekap Vonis
            </div>
            {verdicts.map((v, i) => {
              const c = cases[v.caseIndex];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-sm)',
                    backgroundColor: v.correct ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.06)',
                    border: `1px solid ${v.correct ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`,
                    borderRadius: 'var(--rounded-md)',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ flexShrink: 0, marginTop: '2px' }}>
                    {v.correct ? <CheckCircle2 size={16} color="var(--color-semantic-success)" /> : <XCircle size={16} color="var(--color-semantic-error)" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="body-sm" style={{ marginBottom: '4px' }}>{c.desc}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                      <span className="caption" style={{ color: 'var(--color-muted)' }}>
                        {c.isEthical ? '✅ Etis' : '❌ Tidak Etis'}
                      </span>
                      <span className="caption" style={{ color: 'var(--color-muted)' }}>·</span>
                      <span className="caption" style={{ color: 'var(--color-muted)' }}>{c.principle}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Retry Button */}
          <button className="button-outline" onClick={startGame} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
            <RotateCcw size={16} /> Sidang Ulang
          </button>
        </div>
      </div>
    );
  }

  // ============ SWIPE SCREEN ============
  const currentCase = cases[currentIndex];

  return (
    <div className="feature-card" style={{ padding: 'var(--spacing-xl)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', position: 'relative', backgroundColor: 'var(--color-surface-card)' }}>
      {/* Top Bar: Progress + Score */}
      <div style={{ alignSelf: 'stretch', marginBottom: 'var(--spacing-sm)' }}>
        <ProgressDots />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="body-strong" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={18} /> {score} Poin
          </div>
          <div className="caption" style={{ color: 'var(--color-muted)' }}>Kasus {currentIndex + 1} / {cases.length}</div>
        </div>
      </div>

      {/* Swipe Area */}
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%', maxWidth: '500px' }}>
        {/* Swipe Direction Indicators */}
        <motion.div style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          opacity: noOpacity, color: 'var(--color-semantic-error)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 0, gap: '4px'
        }}>
          <ThumbsDown size={28} />
          <span className="caption" style={{ fontWeight: 700 }}>TIDAK ETIS</span>
        </motion.div>
        <motion.div style={{
          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
          opacity: yesOpacity, color: 'var(--color-semantic-success)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 0, gap: '4px'
        }}>
          <ThumbsUp size={28} />
          <span className="caption" style={{ fontWeight: 700 }}>ETIS</span>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ x, rotate, opacity: cardOpacity, zIndex: 10, cursor: 'grab', width: '100%' }}
            onDragEnd={handleSwipeEnd}
            whileTap={{ cursor: 'grabbing' }}
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.2 } }}
          >
            <div
              style={{
                width: '100%',
                minHeight: '240px',
                display: 'flex',
                flexDirection: 'column',
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--color-surface-card)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                border: '1px solid var(--color-hairline)',
                borderRadius: 'var(--rounded-xl)',
                position: 'relative'
              }}
            >
              {/* Case number + Principle tag */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)', gap: '8px', flexWrap: 'wrap' }}>
                <div className="caption-uppercase" style={{
                  padding: '4px 10px',
                  backgroundColor: 'var(--color-canvas-soft)',
                  borderRadius: 'var(--rounded-pill)',
                  color: 'var(--color-muted)',
                  fontWeight: 600,
                  fontSize: '11px',
                  letterSpacing: '0.5px'
                }}>
                  KASUS #{currentIndex + 1}
                </div>
                <div className="badge-pill" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                  <Scale size={11} />
                  {currentCase.principle}
                </div>
              </div>

              {/* Case Description */}
              <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p className="body-md" style={{ textAlign: 'center', lineHeight: 1.6 }}>
                  {currentCase.desc}
                </p>
              </div>

              {/* Swipe hint */}
              <div className="caption" style={{ textAlign: 'center', color: 'var(--color-muted)', marginTop: 'var(--spacing-sm)', opacity: 0.6 }}>
                ← Geser untuk memutuskan →
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fallback Buttons */}
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)', width: '100%', maxWidth: '500px' }}>
        <button
          className="button-outline"
          style={{
            flex: 1,
            borderColor: 'var(--color-semantic-error)',
            color: 'var(--color-semantic-error)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={() => handleDecision(false)}
        >
          <ThumbsDown size={16} /> Tidak Etis
        </button>
        <button
          className="button-outline"
          style={{
            flex: 1,
            borderColor: 'var(--color-semantic-success)',
            color: 'var(--color-semantic-success)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={() => handleDecision(true)}
        >
          <ThumbsUp size={16} /> Etis
        </button>
      </div>
    </div>
  );
}
