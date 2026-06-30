"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ShieldAlert, ScanFace, Flame, Info, Play, RotateCcw, Target, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { useGlobalScore } from '../../hooks/useGlobalScore';

interface Scenario {
  desc: string;
  isDeepfake: boolean;
  explanation: string;
  clue: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
}

interface AnswerRecord {
  scenario: Scenario;
  playerSaidDeepfake: boolean;
  isCorrect: boolean;
}

const scenarios: Scenario[] = [
  { desc: 'Video Presiden memukul meja dan menyatakan perang — hanya muncul di satu grup WhatsApp.', isDeepfake: true, explanation: 'Pernyataan resmi sebesar itu pasti diliput media besar.', clue: 'Tidak ada media resmi yang meliput.', difficulty: 'Mudah' },
  { desc: 'Wawancara selebriti di stasiun TV nasional secara live membahas film barunya.', isDeepfake: false, explanation: 'Siaran langsung dari stasiun TV resmi sangat sulit dipalsukan.', clue: 'Sumber: stasiun TV nasional terverifikasi.', difficulty: 'Mudah' },
  { desc: 'Video viral TikTok memperlihatkan tokoh agama menari di klub malam, wajah sedikit blur.', isDeepfake: true, explanation: 'Wajah blur, gerakan kaku, dan konteks tidak biasa = ciri deepfake.', clue: 'Wajah blur dan konteks sangat tidak biasa.', difficulty: 'Sedang' },
  { desc: 'Rekaman suara CEO meminta transfer uang mendadak tanpa prosedur standar.', isDeepfake: true, explanation: 'Voice cloning AI sangat umum untuk penipuan korporat.', clue: 'Permintaan di luar prosedur dan sangat mendesak.', difficulty: 'Sedang' },
  { desc: 'Postingan Instagram resmi artis (centang biru) sedang liburan bersama keluarga.', isDeepfake: false, explanation: 'Sumber resmi bercentang biru dengan aktivitas normal.', clue: 'Akun terverifikasi dengan konten wajar.', difficulty: 'Mudah' },
  { desc: 'Video YouTube 2 menit seorang politisi mengaku korupsi — diunggah akun anonim.', isDeepfake: true, explanation: 'Pengakuan mengejutkan dari akun anonim tanpa verifikasi media.', clue: 'Akun anonim, tidak ada konfirmasi media.', difficulty: 'Sulit' },
];

const difficultyConfig: Record<string, { color: string; bg: string }> = {
  Mudah: { color: 'var(--color-semantic-success)', bg: 'rgba(22, 163, 74, 0.1)' },
  Sedang: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  Sulit: { color: 'var(--color-semantic-error)', bg: 'rgba(220, 38, 38, 0.1)' },
};

export default function DeepfakeOrReal() {
  const { playSound } = useSound();
  const { addScore } = useGlobalScore();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result' | 'gameover'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [showClue, setShowClue] = useState(false);
  const [clueTimerId, setClueTimerId] = useState<NodeJS.Timeout | null>(null);

  const current = scenarios[currentIndex];

  // Clue timer: show clue after 3 seconds if still on playing phase
  useEffect(() => {
    if (phase === 'playing') {
      setShowClue(false);
      const id = setTimeout(() => setShowClue(true), 3000);
      setClueTimerId(id);
      return () => clearTimeout(id);
    } else {
      if (clueTimerId) clearTimeout(clueTimerId);
      setShowClue(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIndex]);

  const startGame = () => {
    playSound('click');
    setPhase('playing');
    setScore(0);
    setStreak(0);
    setCurrentIndex(0);
    setAnswers([]);
    setLastCorrect(null);
    setShowClue(false);
  };

  const handleAnswer = (guessIsDeepfake: boolean) => {
    if (phase !== 'playing') return;
    const isCorrect = guessIsDeepfake === current.isDeepfake;

    if (isCorrect) {
      playSound('correct');
    } else {
      playSound('wrong');
    }

    let newStreak = streak;
    if (isCorrect) {
      newStreak = streak + 1;
      setStreak(newStreak);
      const pointsEarned = 10 * newStreak;
      setScore(prev => prev + pointsEarned);
      addScore(pointsEarned);
    } else {
      newStreak = 0;
      setStreak(0);
    }

    setAnswers(prev => [...prev, { scenario: current, playerSaidDeepfake: guessIsDeepfake, isCorrect }]);
    setLastCorrect(isCorrect);
    setPhase('result');
  };

  const nextRound = () => {
    if (currentIndex + 1 < scenarios.length) {
      setCurrentIndex(prev => prev + 1);
      setPhase('playing');
      setLastCorrect(null);
    } else {
      playSound('gameover');
      setPhase('gameover');
    }
  };

  /* ── Progress Dots ── */
  const ProgressDots = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: 'var(--spacing-base)' }}>
      {scenarios.map((_, i) => {
        let bg = 'var(--color-hairline)';
        if (i < answers.length) {
          bg = answers[i].isCorrect ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)';
        } else if (i === currentIndex && (phase === 'playing' || phase === 'result')) {
          bg = 'var(--color-primary)';
        }
        return (
          <motion.div
            key={i}
            initial={false}
            animate={{ scale: i === currentIndex ? 1.3 : 1, backgroundColor: bg }}
            style={{ width: 8, height: 8, borderRadius: '50%', transition: 'background-color 0.3s' }}
          />
        );
      })}
    </div>
  );

  /* ── Streak Badge ── */
  const StreakBadge = () => {
    const multiplier = streak > 0 ? streak : 1;
    const isHot = streak >= 2;
    return (
      <motion.div
        animate={isHot ? { scale: [1, 1.15, 1] } : {}}
        transition={isHot ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } : {}}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 12px',
          borderRadius: 'var(--rounded-pill)',
          backgroundColor: isHot ? 'rgba(249, 115, 22, 0.12)' : 'var(--color-canvas-soft)',
          border: isHot ? '1.5px solid rgba(249, 115, 22, 0.3)' : '1px solid var(--color-hairline)',
          fontWeight: 700,
          fontSize: '14px',
          color: isHot ? '#ea580c' : 'var(--color-muted)',
        }}
      >
        <Flame size={16} fill={isHot ? '#ea580c' : 'none'} color={isHot ? '#ea580c' : 'var(--color-muted)'} />
        x{multiplier}
      </motion.div>
    );
  };

  /* ── INTRO SCREEN ── */
  if (phase === 'intro') {
    return (
      <div className="feature-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-card)' }}>
        <div style={{ padding: 'var(--spacing-xl)', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-canvas-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-md)', color: 'var(--color-ink)' }}>
            <ScanFace size={32} />
          </div>
          <h3 className="display-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>Deepfake or Real?</h3>

          {/* Tujuan Badge */}
          <div className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--spacing-lg)', backgroundColor: 'rgba(99, 102, 241, 0.08)', color: 'var(--color-primary)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '6px 14px', borderRadius: 'var(--rounded-pill)', fontSize: '13px', fontWeight: 600 }}>
            <Target size={14} />
            Asah kemampuanmu membedakan konten asli dan manipulasi AI
          </div>

          <div style={{ backgroundColor: 'var(--color-canvas-soft)', padding: 'var(--spacing-base)', borderRadius: 'var(--rounded-md)', textAlign: 'left', marginBottom: 'var(--spacing-lg)', border: '1px solid var(--color-hairline)', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600 }}>
              <Info size={16} /> Objektif Forensik:
            </div>
            <ul className="body-sm" style={{ paddingLeft: '20px', color: 'var(--color-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Analisis skenario digital yang diberikan.</li>
              <li>Tentukan apakah itu konten <b>Asli (Real)</b> atau <b>Manipulasi (Deepfake)</b>.</li>
              <li>Perhatikan petunjuk (clue) yang muncul!</li>
              <li>Jawab benar berturut-turut untuk <b>Streak Multiplier (🔥)</b>!</li>
            </ul>
          </div>

          <button className="button-primary" onClick={startGame} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Play size={18} fill="currentColor" /> Mulai Investigasi
          </button>
        </div>
      </div>
    );
  }

  /* ── GAME OVER / RECAP ── */
  if (phase === 'gameover') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    return (
      <div className="feature-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-card)' }}>
        <div style={{ padding: 'var(--spacing-xl)', overflowY: 'auto', flexGrow: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <ShieldAlert size={40} color="var(--color-primary)" style={{ marginBottom: 'var(--spacing-sm)' }} />
            <h3 className="display-sm" style={{ marginBottom: '4px' }}>Investigasi Selesai</h3>
            <p className="display-md" style={{ color: 'var(--color-primary)', marginBottom: '4px' }}>{score} PTS</p>
            <p className="body-sm" style={{ color: 'var(--color-muted)' }}>
              {correctCount}/{answers.length} jawaban benar
            </p>
          </div>

          {/* Recap Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <p className="caption-uppercase" style={{ color: 'var(--color-muted)', marginBottom: '2px' }}>Rekap Investigasi</p>
            {answers.map((a, i) => {
              const dc = difficultyConfig[a.scenario.difficulty];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    padding: 'var(--spacing-base)',
                    borderRadius: 'var(--rounded-md)',
                    border: `2px solid ${a.isCorrect ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)'}`,
                    backgroundColor: a.isCorrect ? 'rgba(22, 163, 74, 0.04)' : 'rgba(220, 38, 38, 0.04)',
                  }}
                >
                  {/* Header: icon + difficulty */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {a.isCorrect
                        ? <CheckCircle size={16} color="var(--color-semantic-success)" />
                        : <AlertTriangle size={16} color="var(--color-semantic-error)" />
                      }
                      <span className="caption" style={{ fontWeight: 600, color: a.isCorrect ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)' }}>
                        {a.isCorrect ? 'Benar' : 'Salah'}
                      </span>
                    </div>
                    <span className="caption" style={{ padding: '2px 8px', borderRadius: 'var(--rounded-pill)', fontSize: '11px', fontWeight: 600, backgroundColor: dc.bg, color: dc.color }}>{a.scenario.difficulty}</span>
                  </div>

                  <p className="body-sm" style={{ lineHeight: 1.4, marginBottom: '6px' }}>{a.scenario.desc}</p>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span className="caption" style={{
                      padding: '2px 8px', borderRadius: 'var(--rounded-pill)', fontSize: '11px', fontWeight: 600,
                      backgroundColor: a.scenario.isDeepfake ? 'rgba(220, 38, 38, 0.1)' : 'rgba(22, 163, 74, 0.1)',
                      color: a.scenario.isDeepfake ? 'var(--color-semantic-error)' : 'var(--color-semantic-success)',
                    }}>
                      Fakta: {a.scenario.isDeepfake ? 'Deepfake' : 'Asli'}
                    </span>
                    <span className="caption" style={{
                      padding: '2px 8px', borderRadius: 'var(--rounded-pill)', fontSize: '11px', fontWeight: 600,
                      backgroundColor: 'var(--color-canvas-soft)', color: 'var(--color-muted)',
                    }}>
                      Kamu: {a.playerSaidDeepfake ? 'Deepfake' : 'Asli'}
                    </span>
                  </div>

                  <p className="caption" style={{ color: 'var(--color-muted)', lineHeight: 1.4 }}>{a.scenario.explanation}</p>
                </motion.div>
              );
            })}
          </div>

          <button className="button-outline" onClick={startGame} style={{ width: '100%', marginTop: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <RotateCcw size={16} /> Main Lagi
          </button>
        </div>
      </div>
    );
  }

  /* ── PLAYING / RESULT ── */
  const dc = difficultyConfig[current.difficulty];

  return (
    <div className="feature-card" style={{ padding: 'var(--spacing-xl)', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-card)' }}>
      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
        <div className="body-strong" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Skor: {score}
        </div>
        <StreakBadge />
      </div>

      {/* Progress Dots */}
      <ProgressDots />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {phase === 'playing' && (
          <motion.div
            key={`play-${currentIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            {/* Scenario Card */}
            <div style={{ backgroundColor: 'var(--color-canvas-soft)', padding: 'var(--spacing-lg)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', marginBottom: 'var(--spacing-base)', textAlign: 'center', position: 'relative' }}>
              {/* Difficulty Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                <span className="caption-uppercase" style={{ color: 'var(--color-muted)' }}>Kasus {currentIndex + 1}/{scenarios.length}</span>
                <span className="caption" style={{ padding: '2px 10px', borderRadius: 'var(--rounded-pill)', fontSize: '11px', fontWeight: 700, backgroundColor: dc.bg, color: dc.color }}>{current.difficulty}</span>
              </div>
              <Camera size={24} color="var(--color-muted)" style={{ margin: '0 auto var(--spacing-sm)' }} />
              <p className="body-md" style={{ fontSize: '16px', lineHeight: 1.5 }}>{current.desc}</p>
            </div>

            {/* Clue Hint */}
            <AnimatePresence>
              {showClue && (
                <motion.div
                  initial={{ opacity: 0, y: 8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: 'var(--spacing-sm) var(--spacing-base)',
                    borderRadius: 'var(--rounded-md)',
                    backgroundColor: 'rgba(99, 102, 241, 0.06)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    marginBottom: 'var(--spacing-base)',
                  }}
                >
                  <Eye size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                  <p className="caption" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                    Petunjuk: {current.clue}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 'var(--spacing-base)', marginTop: 'auto' }}>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                className="button-primary"
                style={{ flex: 1, backgroundColor: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '14px' }}
                onClick={() => handleAnswer(true)}
              >
                <ScanFace size={22} />
                <span style={{ fontWeight: 600 }}>Deepfake</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                className="button-primary"
                style={{ flex: 1, backgroundColor: '#16a34a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '14px' }}
                onClick={() => handleAnswer(false)}
              >
                <Camera size={22} />
                <span style={{ fontWeight: 600 }}>Asli (Real)</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div
            key={`result-${currentIndex}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
              backgroundColor: 'var(--color-canvas-soft)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--rounded-lg)',
              border: `2px solid ${lastCorrect ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)'}`,
            }}
          >
            {/* Correct/Wrong Badge */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-base)' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                {lastCorrect
                  ? <CheckCircle size={44} color="var(--color-semantic-success)" />
                  : <AlertTriangle size={44} color="var(--color-semantic-error)" />
                }
              </motion.div>
              <p className="display-sm" style={{
                marginTop: '8px',
                color: lastCorrect ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)',
              }}>
                {lastCorrect ? 'Benar!' : 'Salah!'}
              </p>
            </div>

            {/* Fact */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-base)' }}>
              <span className="caption" style={{
                display: 'inline-block',
                padding: '3px 12px', borderRadius: 'var(--rounded-pill)',
                fontWeight: 700, fontSize: '12px',
                backgroundColor: current.isDeepfake ? 'rgba(220, 38, 38, 0.1)' : 'rgba(22, 163, 74, 0.1)',
                color: current.isDeepfake ? 'var(--color-semantic-error)' : 'var(--color-semantic-success)',
                marginBottom: '8px',
              }}>
                {current.isDeepfake ? '🤖 Deepfake' : '✅ Konten Asli'}
              </span>
              <p className="body-sm" style={{ color: 'var(--color-muted)', lineHeight: 1.5, marginTop: '8px' }}>
                {current.explanation}
              </p>
            </div>

            {/* Clue they should have noticed */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: 'var(--spacing-sm) var(--spacing-base)',
              borderRadius: 'var(--rounded-md)',
              backgroundColor: 'rgba(99, 102, 241, 0.06)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              marginBottom: 'var(--spacing-lg)',
            }}>
              <Eye size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              <p className="caption" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                Petunjuk: {current.clue}
              </p>
            </div>

            <button className="button-primary" onClick={nextRound} style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentIndex + 1 < scenarios.length ? 'Kasus Berikutnya →' : 'Lihat Hasil'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
