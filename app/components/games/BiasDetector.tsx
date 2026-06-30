"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trophy, AlertTriangle, CheckCircle, Play, Info, RotateCcw, Target } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { useGlobalScore } from '../../hooks/useGlobalScore';

interface Statement {
  text: string;
  isBias: boolean;
  reason: string;
}

interface AnswerRecord {
  statement: Statement;
  playerAnswer: boolean; // true = said bias, false = said fair
  isCorrect: boolean;
}

const statements: Statement[] = [
  { text: 'AI rekrutmen memprioritaskan CV pelamar laki-laki untuk posisi teknik.', isBias: true, reason: 'Ini bias gender. AI dilatih dari data historis di mana laki-laki mendominasi bidang teknik.' },
  { text: 'AI menilai kelayakan pinjaman berdasarkan ras dan kode pos pemohon.', isBias: true, reason: 'Bias rasial. Menggunakan ras atau lokasi sebagai faktor penilaian adalah diskriminasi.' },
  { text: 'AI medis menggunakan data representatif dari berbagai kelompok demografi untuk diagnosis.', isBias: false, reason: 'Data representatif dari semua demografi mengurangi risiko bias dan menghasilkan diagnosis yang adil.' },
  { text: 'AI menargetkan iklan pekerjaan bergaji tinggi hanya kepada pengguna pria usia 25-40.', isBias: true, reason: 'Diskriminasi gender dan usia. Semua orang berhak melihat peluang kerja yang sama.' },
  { text: 'Sistem pengenalan wajah gagal mengenali wajah orang berkulit gelap.', isBias: true, reason: 'Dataset pelatihan tidak cukup merepresentasikan keberagaman warna kulit.' },
  { text: 'AI rekomendasi berita menyajikan artikel dari berbagai sudut pandang politik.', isBias: false, reason: 'Menyajikan keberagaman perspektif menghindari filter bubble dan mendorong pemikiran kritis.' },
  { text: 'Chatbot layanan kesehatan merespons dalam bahasa Inggris saja meskipun digunakan global.', isBias: true, reason: 'Bias bahasa. Membatasi akses layanan kesehatan hanya untuk penutur bahasa Inggris.' },
  { text: 'AI moderasi konten menerapkan standar yang sama untuk semua pengguna tanpa memandang asal negara.', isBias: false, reason: 'Standar universal tanpa diskriminasi geografis adalah pendekatan yang adil.' },
];

const INITIAL_TIME = 20;

export default function BiasDetector() {
  const { playSound } = useSound();
  const { addScore } = useGlobalScore();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'explanation' | 'gameover'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean; reason: string; label: string } | null>(null);

  const handleGameOver = useCallback(() => {
    playSound('gameover');
    setPhase('gameover');
  }, [playSound]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === 'playing') {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft <= 0) {
      handleGameOver();
    }
  }, [timeLeft, phase, handleGameOver]);

  const startGame = () => {
    playSound('click');
    setPhase('playing');
    setScore(0);
    setCurrentIndex(0);
    setTimeLeft(INITIAL_TIME);
    setAnswers([]);
    setLastFeedback(null);
  };

  const handleAnswer = (answerIsBias: boolean) => {
    if (phase !== 'playing') return;
    const current = statements[currentIndex];
    const isCorrect = current.isBias === answerIsBias;

    if (isCorrect) {
      playSound('correct');
      addScore(10);
    } else {
      playSound('wrong');
    }

    const record: AnswerRecord = { statement: current, playerAnswer: answerIsBias, isCorrect };
    setAnswers(prev => [...prev, record]);

    if (isCorrect) {
      setScore(prev => prev + 100);
      setTimeLeft(prev => prev + 2);
    } else {
      setTimeLeft(prev => Math.max(0, prev - 3));
    }

    setLastFeedback({
      isCorrect,
      reason: current.reason,
      label: current.isBias ? 'Bias' : 'Adil',
    });
    setPhase('explanation');

    setTimeout(() => {
      if (currentIndex + 1 < statements.length) {
        setCurrentIndex(prev => prev + 1);
        setPhase('playing');
        setLastFeedback(null);
      } else {
        handleGameOver();
      }
    }, 2000);
  };

  /* ── Progress Dots ── */
  const ProgressDots = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: 'var(--spacing-base)' }}>
      {statements.map((_, i) => {
        let bg = 'var(--color-hairline)';
        if (i < answers.length) {
          bg = answers[i].isCorrect ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)';
        } else if (i === currentIndex && (phase === 'playing' || phase === 'explanation')) {
          bg = 'var(--color-primary)';
        }
        return (
          <motion.div
            key={i}
            initial={false}
            animate={{ scale: i === currentIndex ? 1.3 : 1, backgroundColor: bg }}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              transition: 'background-color 0.3s',
            }}
          />
        );
      })}
    </div>
  );

  /* ── INTRO SCREEN ── */
  if (phase === 'intro') {
    return (
      <div className="feature-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-card)' }}>
        <div style={{ padding: 'var(--spacing-xl)', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-md)', color: 'var(--color-semantic-error)' }}>
            <AlertTriangle size={32} />
          </div>
          <h3 className="display-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>Bias Detector</h3>

          {/* Tujuan Badge */}
          <div className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--spacing-lg)', backgroundColor: 'rgba(99, 102, 241, 0.08)', color: 'var(--color-primary)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '6px 14px', borderRadius: 'var(--rounded-pill)', fontSize: '13px', fontWeight: 600 }}>
            <Target size={14} />
            Latih kemampuanmu mengenali bias algoritma AI
          </div>

          <div style={{ backgroundColor: 'var(--color-canvas-soft)', padding: 'var(--spacing-base)', borderRadius: 'var(--rounded-md)', textAlign: 'left', marginBottom: 'var(--spacing-lg)', border: '1px solid var(--color-hairline)', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600 }}>
              <Info size={16} /> Cara Bermain:
            </div>
            <ul className="body-sm" style={{ paddingLeft: '20px', color: 'var(--color-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Baca pernyataan AI yang muncul di layar.</li>
              <li>Pilih apakah AI tersebut <b>Beresiko Bias</b> atau <b>Adil</b>.</li>
              <li>Lihat penjelasan setelah setiap jawaban!</li>
              <li>Waktu terbatas! Benar = +2 detik. Salah = -3 detik.</li>
            </ul>
          </div>

          <button className="button-primary" onClick={startGame} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Play size={18} fill="currentColor" /> Mulai Scan
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
            <Trophy size={40} color="var(--color-primary)" style={{ marginBottom: 'var(--spacing-sm)' }} />
            <h3 className="display-sm" style={{ marginBottom: '4px' }}>Scan Selesai</h3>
            <p className="display-md" style={{ color: 'var(--color-primary)', marginBottom: '4px' }}>{score} PTS</p>
            <p className="body-sm" style={{ color: 'var(--color-muted)' }}>
              {correctCount}/{answers.length} jawaban benar
            </p>
          </div>

          {/* Recap */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <p className="caption-uppercase" style={{ color: 'var(--color-muted)', marginBottom: '2px' }}>Rekap Jawaban</p>
            {answers.map((a, i) => (
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
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                  {a.isCorrect
                    ? <CheckCircle size={16} color="var(--color-semantic-success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    : <AlertTriangle size={16} color="var(--color-semantic-error)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  }
                  <p className="body-sm" style={{ fontWeight: 600, lineHeight: 1.4, flex: 1 }}>{a.statement.text}</p>
                </div>
                <div style={{ marginLeft: '24px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span className="caption" style={{
                      padding: '2px 8px', borderRadius: 'var(--rounded-pill)', fontSize: '11px', fontWeight: 600,
                      backgroundColor: a.statement.isBias ? 'rgba(220, 38, 38, 0.1)' : 'rgba(22, 163, 74, 0.1)',
                      color: a.statement.isBias ? 'var(--color-semantic-error)' : 'var(--color-semantic-success)',
                    }}>
                      Jawaban: {a.statement.isBias ? 'Bias' : 'Adil'}
                    </span>
                    <span className="caption" style={{
                      padding: '2px 8px', borderRadius: 'var(--rounded-pill)', fontSize: '11px', fontWeight: 600,
                      backgroundColor: 'var(--color-canvas-soft)', color: 'var(--color-muted)',
                    }}>
                      Kamu: {a.playerAnswer ? 'Bias' : 'Adil'}
                    </span>
                  </div>
                  <p className="caption" style={{ color: 'var(--color-muted)', lineHeight: 1.4 }}>{a.statement.reason}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <button className="button-outline" onClick={startGame} style={{ width: '100%', marginTop: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <RotateCcw size={16} /> Ulangi Scan
          </button>
        </div>
      </div>
    );
  }

  /* ── PLAYING / EXPLANATION ── */
  const isTimerCritical = timeLeft <= 5;

  return (
    <div className="feature-card" style={{ padding: 'var(--spacing-xl)', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-card)' }}>
      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <Trophy size={18} color="var(--color-primary)" /> {score}
        </div>
        <motion.div
          animate={isTimerCritical ? {
            scale: [1, 1.12, 1],
            x: [0, -2, 2, -2, 0],
          } : {}}
          transition={isTimerCritical ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } : {}}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700,
            color: isTimerCritical ? 'var(--color-semantic-error)' : 'inherit',
            padding: '4px 10px',
            borderRadius: 'var(--rounded-pill)',
            backgroundColor: isTimerCritical ? 'rgba(220, 38, 38, 0.08)' : 'transparent',
          }}
        >
          <Clock size={18} /> 00:{timeLeft.toString().padStart(2, '0')}
        </motion.div>
      </div>

      {/* Progress Dots */}
      <ProgressDots />

      {/* Timer Bar */}
      <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--color-canvas-soft)', borderRadius: '3px', overflow: 'hidden', marginBottom: 'var(--spacing-lg)' }}>
        <motion.div
          animate={{
            width: `${(timeLeft / INITIAL_TIME) * 100}%`,
            backgroundColor: isTimerCritical ? 'var(--color-semantic-error)' : 'var(--color-primary)',
          }}
          transition={{ duration: 0.8, ease: 'linear' }}
          style={{ height: '100%', borderRadius: '3px' }}
        />
      </div>

      {/* Statement / Explanation Card */}
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <AnimatePresence mode="wait">
          {phase === 'playing' && (
            <motion.div
              key={`q-${currentIndex}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              style={{
                backgroundColor: 'var(--color-canvas-soft)',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--rounded-lg)',
                border: '1px solid var(--color-hairline)',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <div className="caption-uppercase" style={{ color: 'var(--color-muted)', marginBottom: 'var(--spacing-sm)' }}>
                Kasus {currentIndex + 1} / {statements.length}
              </div>
              <h4 className="title-md" style={{ lineHeight: 1.5 }}>
                &ldquo;{statements[currentIndex].text}&rdquo;
              </h4>
            </motion.div>
          )}

          {phase === 'explanation' && lastFeedback && (
            <motion.div
              key={`exp-${currentIndex}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              style={{
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--rounded-lg)',
                border: `2px solid ${lastFeedback.isCorrect ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)'}`,
                backgroundColor: lastFeedback.isCorrect ? 'rgba(22, 163, 74, 0.06)' : 'rgba(220, 38, 38, 0.06)',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                style={{ marginBottom: 'var(--spacing-sm)' }}
              >
                {lastFeedback.isCorrect
                  ? <CheckCircle size={36} color="var(--color-semantic-success)" />
                  : <AlertTriangle size={36} color="var(--color-semantic-error)" />
                }
              </motion.div>
              <p className="body-strong" style={{
                marginBottom: '6px',
                color: lastFeedback.isCorrect ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)',
              }}>
                {lastFeedback.isCorrect ? 'Benar!' : 'Salah!'} — {lastFeedback.label}
              </p>
              <p className="body-sm" style={{ color: 'var(--color-muted)', lineHeight: 1.5 }}>
                {lastFeedback.reason}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 'var(--spacing-base)', marginTop: 'var(--spacing-lg)', opacity: phase === 'explanation' ? 0.4 : 1, pointerEvents: phase === 'explanation' ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(220, 38, 38, 0.06)' }}
          whileTap={{ scale: 0.96 }}
          className="button-outline"
          style={{
            flex: 1,
            borderColor: 'var(--color-semantic-error)', color: 'var(--color-semantic-error)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '14px',
          }}
          onClick={() => handleAnswer(true)}
        >
          <AlertTriangle size={22} />
          <span style={{ fontWeight: 600 }}>Bias</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(22, 163, 74, 0.06)' }}
          whileTap={{ scale: 0.96 }}
          className="button-outline"
          style={{
            flex: 1,
            borderColor: 'var(--color-semantic-success)', color: 'var(--color-semantic-success)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '14px',
          }}
          onClick={() => handleAnswer(false)}
        >
          <CheckCircle size={22} />
          <span style={{ fontWeight: 600 }}>Adil</span>
        </motion.button>
      </div>
    </div>
  );
}
