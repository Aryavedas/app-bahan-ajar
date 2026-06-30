"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, CheckCircle2, AlertTriangle, ShieldCheck, Play, RotateCcw, ArrowRight, Target, Award, CircleDot } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { useGlobalScore } from '../../hooks/useGlobalScore';

interface OptionData {
  text: string;
  score: number;
  feedback: string;
}

interface ScenarioData {
  situation: string;
  principle: string;
  options: OptionData[];
}

const scenarios: ScenarioData[] = [
  {
    situation: 'Kamu ingin meminta bantuan AI untuk tugas esai Perang Dunia 2.',
    principle: 'Integritas Akademik',
    options: [
      { text: 'Buatkan esai 10 halaman lengkap tentang Perang Dunia 2.', score: 0, feedback: 'Plagiarisme penuh — kamu kehilangan esensi belajar.' },
      { text: 'Buatkan outline dan poin utama agar saya bisa mengembangkannya sendiri.', score: 100, feedback: 'Sangat etis! AI sebagai asisten brainstorming.' },
      { text: 'Tuliskan pendahuluan dan kesimpulan esai ini untuk saya.', score: 30, feedback: 'Kurang etis — porsi besar masih ditulis AI.' }
    ]
  },
  {
    situation: 'Kamu butuh foto profil LinkedIn tapi tidak punya foto formal.',
    principle: 'Privasi & Identitas',
    options: [
      { text: 'Generate foto wajahku memakai jas di kantor.', score: 80, feedback: 'Cukup wajar asalkan representasi tidak jauh dari realita.' },
      { text: 'Ambil foto temanku dan edit wajahnya jadi wajahku.', score: 0, feedback: 'Melanggar privasi dan hak cipta foto temanmu!' },
      { text: 'Generate ilustrasi avatar profesional yang merepresentasikan bidangku.', score: 100, feedback: 'Sangat aman dan kreatif — tidak memanipulasi identitas.' }
    ]
  },
  {
    situation: 'Kamu menemukan artikel kesehatan hasil AI dan ingin share ke grup keluarga.',
    principle: 'Akurasi (Framework PAPA)',
    options: [
      { text: 'Langsung forward dengan caption "Info penting!"', score: 0, feedback: 'Bahaya halusinasi AI! Info kesehatan harus diverifikasi.' },
      { text: 'Tanya AI lain apakah artikel ini benar, lalu forward.', score: 40, feedback: 'AI memverifikasi AI = risiko bias berulang.' },
      { text: 'Cek jurnal medis resmi untuk konfirmasi sebelum membagikan.', score: 100, feedback: 'Sempurna! Prinsip akurasi PAPA dengan human oversight.' }
    ]
  },
  {
    situation: 'Dosenmu memperbolehkan penggunaan AI untuk riset. Kamu ingin menulis paper.',
    principle: 'Transparansi',
    options: [
      { text: 'Gunakan AI untuk menulis paper lalu submit langsung.', score: 10, feedback: 'Tidak mencantumkan penggunaan AI melanggar transparansi.' },
      { text: 'Gunakan AI untuk riset data, tulis sendiri, cantumkan AI di metodologi.', score: 100, feedback: 'Sempurna! Transparan, jujur, dan menunjukkan kemampuan sendiri.' },
      { text: 'Gunakan AI untuk draft awal, edit sendiri, tanpa menyebut AI.', score: 30, feedback: 'Kurang transparan — dosen berhak tahu tools yang kamu gunakan.' }
    ]
  }
];

interface AnswerRecord {
  scenarioIndex: number;
  selectedOptionIndex: number;
  score: number;
}

type GamePhase = 'intro' | 'question' | 'result' | 'gameover';

const getScoreColor = (score: number): string => {
  if (score === 100) return 'var(--color-semantic-success)';
  if (score >= 70) return '#22c55e';
  if (score >= 30) return '#f59e0b';
  return 'var(--color-semantic-error)';
};

const getScoreLabel = (score: number): string => {
  if (score === 100) return 'Terbaik';
  if (score >= 70) return 'Baik';
  if (score >= 30) return 'Kurang';
  return 'Buruk';
};

export default function PromptResponsibility() {
  const { playSound } = useSound();
  const { addScore } = useGlobalScore();
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(-1);

  const maxScore = scenarios.reduce((sum, s) => sum + Math.max(...s.options.map(o => o.score)), 0);

  const startGame = () => {
    playSound('click');
    setPhase('question');
    setTotalScore(0);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOptionIndex(-1);
  };

  const handleSelect = (optIndex: number) => {
    const opt = scenarios[currentIndex].options[optIndex];
    const bestScore = Math.max(...scenarios[currentIndex].options.map(o => o.score));
    if (opt.score === bestScore) {
      playSound('correct');
    } else {
      playSound('wrong');
    }
    setSelectedOptionIndex(optIndex);
    setTotalScore(prev => prev + opt.score);
    if (opt.score > 0) addScore(opt.score);
    setAnswers(prev => [...prev, {
      scenarioIndex: currentIndex,
      selectedOptionIndex: optIndex,
      score: opt.score
    }]);
    setPhase('result');
  };

  const handleNext = () => {
    setSelectedOptionIndex(-1);
    if (currentIndex + 1 < scenarios.length) {
      playSound('click');
      setCurrentIndex(prev => prev + 1);
      setPhase('question');
    } else {
      const halfScore = maxScore / 2;
      if (totalScore >= halfScore) {
        playSound('win');
      } else {
        playSound('gameover');
      }
      setPhase('gameover');
    }
  };

  // --- Progress Bar ---
  const ProgressBar = () => {
    const progress = phase === 'gameover' ? 100 : ((currentIndex + (phase === 'result' ? 1 : 0)) / scenarios.length) * 100;
    return (
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div className="caption" style={{ color: 'var(--color-muted)' }}>
            Skenario {Math.min(currentIndex + 1, scenarios.length)} / {scenarios.length}
          </div>
          <div className="body-strong" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={14} /> {totalScore} Poin
          </div>
        </div>
        <div style={{
          width: '100%', height: '6px',
          backgroundColor: 'var(--color-canvas-soft)',
          borderRadius: 'var(--rounded-pill)',
          overflow: 'hidden'
        }}>
          <motion.div
            style={{
              height: '100%',
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--rounded-pill)'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  };

  // ============ INTRO SCREEN ============
  if (phase === 'intro') {
    return (
      <div className="feature-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-card)' }}>
        <div style={{ padding: 'var(--spacing-xl)', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-md)', color: 'var(--color-semantic-success)' }}>
            <MessageSquare size={32} />
          </div>
          <h3 className="display-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>Prompt Responsibility</h3>

          {/* Tujuan Badge */}
          <div className="badge-pill" style={{ marginBottom: 'var(--spacing-lg)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Target size={14} />
            Pilih prompt AI paling bertanggung jawab dalam setiap situasi
          </div>

          <div style={{ backgroundColor: 'var(--color-canvas-soft)', padding: 'var(--spacing-base)', borderRadius: 'var(--rounded-md)', textAlign: 'left', marginBottom: 'var(--spacing-lg)', border: '1px solid var(--color-hairline)', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 600 }}>
              <ShieldCheck size={16} /> Cara Bermain
            </div>
            <ul className="body-sm" style={{ paddingLeft: '20px', color: 'var(--color-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Baca skenario situasi penggunaan AI.</li>
              <li>Pilih prompt/tindakan yang paling bertanggung jawab.</li>
              <li>Setiap pilihan memiliki skor etika <b>0–100</b>.</li>
              <li>Raih skor maksimal <b>{maxScore}</b> untuk membuktikan integritasmu.</li>
            </ul>
          </div>

          <button className="button-primary" onClick={startGame} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Play size={18} fill="currentColor" /> Mulai Simulasi
          </button>
        </div>
      </div>
    );
  }

  // ============ GAME OVER SCREEN ============
  if (phase === 'gameover') {
    let title = 'Ahli Etika AI 🌟';
    let subtitle = 'Kamu sangat memahami tanggung jawab dalam menggunakan AI.';
    if (totalScore < 150) {
      title = 'Masih Perlu Belajar ⚠️';
      subtitle = 'Mari pelajari prinsip etika AI lebih dalam.';
    } else if (totalScore < 300) {
      title = 'Pengguna yang Baik 👍';
      subtitle = 'Pemahamanmu cukup baik, tapi masih bisa ditingkatkan!';
    } else if (totalScore < maxScore) {
      title = 'Hampir Sempurna! 🎯';
      subtitle = 'Sedikit lagi menuju skor sempurna!';
    }

    return (
      <div className="feature-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-card)' }}>
        <div style={{ padding: 'var(--spacing-xl)', flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <MessageSquare size={40} color="var(--color-primary)" style={{ marginBottom: 'var(--spacing-sm)' }} />
            <h3 className="display-sm" style={{ marginBottom: '4px' }}>{title}</h3>
            <p className="display-md" style={{ color: 'var(--color-primary)', marginBottom: '4px' }}>{totalScore} / {maxScore}</p>
            <p className="body-sm" style={{ color: 'var(--color-muted)' }}>{subtitle}</p>
          </div>

          {/* Detailed Recap */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div className="caption-uppercase" style={{ color: 'var(--color-muted)' }}>
              Rekap Skenario
            </div>
            {answers.map((ans, i) => {
              const scenario = scenarios[ans.scenarioIndex];
              const chosenOpt = scenario.options[ans.selectedOptionIndex];
              const bestScore = Math.max(...scenario.options.map(o => o.score));
              const isPerfect = ans.score === bestScore;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    padding: 'var(--spacing-base)',
                    backgroundColor: isPerfect ? 'rgba(22,163,74,0.05)' : 'rgba(220,38,38,0.04)',
                    border: `1px solid ${isPerfect ? 'rgba(22,163,74,0.15)' : 'var(--color-hairline)'}`,
                    borderRadius: 'var(--rounded-lg)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '8px' }}>
                    <p className="body-sm" style={{ fontWeight: 600, flex: 1 }}>{scenario.situation}</p>
                    <span className="caption" style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--rounded-pill)',
                      backgroundColor: getScoreColor(ans.score),
                      color: '#fff',
                      fontWeight: 600,
                      flexShrink: 0,
                      fontSize: '11px'
                    }}>
                      +{ans.score}
                    </span>
                  </div>
                  <p className="caption" style={{ color: 'var(--color-muted)', marginBottom: '4px' }}>
                    Pilihan: {chosenOpt.text}
                  </p>
                  <p className="caption" style={{ color: getScoreColor(ans.score) }}>
                    {chosenOpt.feedback}
                  </p>
                  <div className="badge-pill" style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                    <ShieldCheck size={11} />
                    {scenario.principle}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Retry */}
          <button className="button-outline" onClick={startGame} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
            <RotateCcw size={16} /> Evaluasi Ulang
          </button>
        </div>
      </div>
    );
  }

  const current = scenarios[currentIndex];

  // ============ RESULT SCREEN (after selection) ============
  if (phase === 'result') {
    const chosenOpt = current.options[selectedOptionIndex];
    // Sort options by score descending for ranking display
    const rankedOptions = [...current.options]
      .map((opt, idx) => ({ ...opt, originalIndex: idx }))
      .sort((a, b) => b.score - a.score);

    return (
      <div className="feature-card" style={{ padding: 'var(--spacing-xl)', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-card)' }}>
        <ProgressBar />

        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key="result-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
            >
              {/* Score Display */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}
              >
                <div style={{ marginBottom: '4px' }}>
                  {chosenOpt.score === 100 ? (
                    <CheckCircle2 size={40} color="var(--color-semantic-success)" />
                  ) : chosenOpt.score >= 30 ? (
                    <AlertTriangle size={40} color="#f59e0b" />
                  ) : (
                    <AlertTriangle size={40} color="var(--color-semantic-error)" />
                  )}
                </div>
                <h4 className="title-md" style={{ color: getScoreColor(chosenOpt.score), marginBottom: '2px' }}>
                  +{chosenOpt.score} Poin
                </h4>
                <p className="body-sm" style={{ color: 'var(--color-muted)' }}>{chosenOpt.feedback}</p>
              </motion.div>

              {/* Principle */}
              <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>
                <div className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} />
                  {current.principle}
                </div>
              </div>

              {/* All Options Ranking */}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div className="caption-uppercase" style={{ color: 'var(--color-muted)', marginBottom: 'var(--spacing-sm)' }}>
                  Peringkat Semua Pilihan
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {rankedOptions.map((opt, rank) => {
                    const isChosen = opt.originalIndex === selectedOptionIndex;
                    return (
                      <motion.div
                        key={opt.originalIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: rank * 0.1 }}
                        style={{
                          padding: 'var(--spacing-sm)',
                          borderRadius: 'var(--rounded-md)',
                          border: `1.5px solid ${isChosen ? getScoreColor(opt.score) : 'var(--color-hairline)'}`,
                          backgroundColor: isChosen ? `${getScoreColor(opt.score)}08` : 'transparent',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                            <div style={{
                              width: '20px', height: '20px', borderRadius: '50%',
                              backgroundColor: getScoreColor(opt.score),
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '11px', fontWeight: 700, flexShrink: 0
                            }}>
                              {rank + 1}
                            </div>
                            <p className="body-sm" style={{ flex: 1 }}>{opt.text}</p>
                          </div>
                          <span className="caption" style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--rounded-pill)',
                            backgroundColor: getScoreColor(opt.score),
                            color: '#fff',
                            fontWeight: 600,
                            flexShrink: 0,
                            fontSize: '11px'
                          }}>
                            {opt.score} pts
                          </span>
                        </div>
                        <p className="caption" style={{ color: 'var(--color-muted)', paddingLeft: '26px' }}>
                          {opt.feedback}
                        </p>
                        {isChosen && (
                          <div className="caption" style={{
                            position: 'absolute', top: '-8px', right: '8px',
                            padding: '1px 8px',
                            backgroundColor: getScoreColor(opt.score),
                            color: '#fff',
                            borderRadius: 'var(--rounded-pill)',
                            fontWeight: 600,
                            fontSize: '10px'
                          }}>
                            Pilihanmu
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Next Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ marginTop: 'auto' }}
              >
                <button
                  className="button-primary"
                  onClick={handleNext}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {currentIndex + 1 < scenarios.length ? (
                    <>Skenario Berikutnya <ArrowRight size={16} /></>
                  ) : (
                    <>Lihat Hasil Akhir <ArrowRight size={16} /></>
                  )}
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ============ QUESTION SCREEN ============
  return (
    <div className="feature-card" style={{ padding: 'var(--spacing-xl)', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-card)' }}>
      <ProgressBar />

      <AnimatePresence mode="wait">
        <motion.div
          key={`q-${currentIndex}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
        >
          {/* Chat bubble representation */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-ink))',
              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px'
            }}>
              🤖
            </div>
            <div style={{
              backgroundColor: 'var(--color-canvas-soft)',
              padding: 'var(--spacing-base)',
              borderRadius: '4px var(--rounded-lg) var(--rounded-lg) var(--rounded-lg)',
              border: '1px solid var(--color-hairline)',
              flex: 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '8px', flexWrap: 'wrap' }}>
                <span className="caption-uppercase" style={{ color: 'var(--color-muted)' }}>
                  Situasi
                </span>
                <div className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                  <CircleDot size={11} />
                  {current.principle}
                </div>
              </div>
              <p className="title-md" style={{ lineHeight: 1.5 }}>
                {current.situation}
              </p>
            </div>
          </div>

          <p className="body-sm" style={{ color: 'var(--color-muted)', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={14} /> Pilih respons yang paling bertanggung jawab:
          </p>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {current.options.map((opt, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(idx)}
                style={{
                  padding: 'var(--spacing-base)',
                  backgroundColor: 'var(--color-surface-card)',
                  border: '1.5px solid var(--color-hairline)',
                  borderRadius: 'var(--rounded-md)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  transition: 'border-color 0.2s ease'
                }}
                className="body-md"
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  border: '2px solid var(--color-hairline)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: '1px',
                  fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)'
                }}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span>{opt.text}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
