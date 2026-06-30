"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Question = {
  id: number;
  text: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
};

const questions: Question[] = [
  {
    id: 1,
    text: 'Prinsip etika AI yang menekankan kemampuan menjelaskan cara kerja dan keputusan AI secara terbuka kepada pengguna disebut...',
    options: [
      { id: 'A', text: 'Akuntabilitas' },
      { id: 'B', text: 'Keadilan' },
      { id: 'C', text: 'Transparansi' },
      { id: 'D', text: 'Privasi' }
    ],
    correctId: 'C',
    explanation: 'Transparansi berarti sistem AI harus dapat dijelaskan cara kerjanya kepada pengguna dan pihak yang terdampak. Tanpa transparansi, pengguna tidak bisa mempertanyakan atau mengoreksi keputusan AI yang salah.'
  },
  {
    id: 2,
    text: 'Algoritma rekrutmen yang secara konsisten memberikan nilai lebih rendah kepada pelamar perempuan dibandingkan laki-laki dengan kualifikasi setara merupakan contoh dari...',
    options: [
      { id: 'A', text: 'Filter Bubble' },
      { id: 'B', text: 'Hallucination AI' },
      { id: 'C', text: 'Bias Algoritma' },
      { id: 'D', text: 'Deepfake' }
    ],
    correctId: 'C',
    explanation: 'Bias algoritma terjadi ketika sistem AI mereproduksi ketidakadilan yang sudah ada dalam data pelatihannya. Ini kasus nyata yang terjadi pada sistem rekrutmen Amazon tahun 2018.'
  },
  {
    id: 3,
    text: 'Manakah tindakan yang PALING mencerminkan penggunaan AI secara etis dalam konteks akademik?',
    options: [
      { id: 'A', text: 'Menggunakan AI untuk menulis seluruh laporan dan mengumpulkannya tanpa keterangan' },
      { id: 'B', text: 'Menghindari penggunaan AI sama sekali karena dianggap curang' },
      { id: 'C', text: 'Menggunakan AI sebagai alat bantu brainstorming dan mencantumkan penggunaannya secara transparan' },
      { id: 'D', text: 'C adalah jawaban yang benar' }
    ],
    correctId: 'D',
    explanation: 'Penggunaan AI secara etis bukan tentang menghindari AI, tapi tentang jujur mengenai cara penggunaannya. Transparansi adalah kuncinya. (Pilihan C merepresentasikan tindakan ini).'
  },
  {
    id: 4,
    text: '"Filter bubble" yang disebabkan algoritma AI berpotensi menimbulkan dampak sosial berupa...',
    options: [
      { id: 'A', text: 'Peningkatan kecepatan akses informasi' },
      { id: 'B', text: 'Polarisasi pandangan dan penyempitan perspektif' },
      { id: 'C', text: 'Meningkatnya keamanan data pengguna' },
      { id: 'D', text: 'Berkurangnya iklan yang tidak relevan' }
    ],
    correctId: 'B',
    explanation: 'Filter bubble membuat pengguna hanya terpapar informasi yang memperkuat pandangan mereka yang sudah ada. Dalam jangka panjang, ini memicu polarisasi dan melemahkan kemampuan berdialog dengan perspektif berbeda.'
  },
  {
    id: 5,
    text: 'Fenomena ketika model AI menghasilkan informasi yang terdengar sangat meyakinkan dan detail, namun ternyata tidak akurat atau bahkan sepenuhnya fiktif, disebut...',
    options: [
      { id: 'A', text: 'Bias Algoritma' },
      { id: 'B', text: 'Filter Bubble' },
      { id: 'C', text: 'Deepfake' },
      { id: 'D', text: 'Hallucination AI' }
    ],
    correctId: 'D',
    explanation: 'AI hallucination adalah risiko serius dalam penggunaan model bahasa besar (LLM) seperti ChatGPT. Inilah mengapa setiap output AI perlu diverifikasi dengan sumber primer sebelum dipercaya atau disebarkan.'
  },
  {
    id: 6,
    text: 'Prinsip "Human Oversight" dalam kerangka etika AI menekankan bahwa...',
    options: [
      { id: 'A', text: 'AI tidak boleh digunakan untuk mengambil keputusan apapun yang menyangkut manusia' },
      { id: 'B', text: 'Hanya pemerintah yang boleh mengembangkan sistem AI' },
      { id: 'C', text: 'Manusia harus selalu memiliki kemampuan untuk memantau, mengoreksi, dan menghentikan sistem AI' },
      { id: 'D', text: 'Pengguna tidak perlu memahami cara kerja AI selama hasilnya bagus' }
    ],
    correctId: 'C',
    explanation: 'Human oversight bukan berarti AI tidak berguna. Ini berarti AI selalu beroperasi di bawah kendali dan tanggung jawab manusia, bukan sebaliknya.'
  },
  {
    id: 7,
    text: 'Seorang mahasiswa menemukan video yang terlihat nyata di media sosial, menampilkan seorang pejabat membuat pernyataan kontroversial. Tindakan PALING bijak sebelum menyebarkannya adalah...',
    options: [
      { id: 'A', text: 'Langsung membagikannya karena videonya terlihat sangat nyata' },
      { id: 'B', text: 'Membagikannya hanya ke teman dekat karena tidak terlalu banyak orang yang tahu' },
      { id: 'C', text: 'Tidak membagikannya sama sekali karena semua video di internet tidak bisa dipercaya' },
      { id: 'D', text: 'Memverifikasi keaslian video melalui sumber berita terpercaya sebelum mengambil tindakan apapun' }
    ],
    correctId: 'D',
    explanation: 'Deepfake semakin sulit dibedakan dari video asli. Memverifikasi informasi sebelum menyebarkannya adalah bentuk tanggung jawab digital yang paling dasar dan paling penting.'
  }
];

export default function EvaluationQuiz() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (questionId: number, optionId: string) => {
    if (submitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = () => {
    let currentScore = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctId) {
        currentScore += 1;
      }
    });
    setScore(currentScore);
    setSubmitted(true);
  };

  const allAnswered = questions.every(q => answers[q.id]);

  return (
    <div className="quiz-container">
      {questions.map((q, idx) => {
        const isAnswered = answers[q.id];
        return (
          <motion.div 
            key={q.id} 
            className="quiz-question"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <h3 className="title-md" style={{ marginBottom: 'var(--spacing-lg)' }}>
              {idx + 1}. {q.text}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              {q.options.map(opt => {
                let className = "quiz-option";
                if (answers[q.id] === opt.id) {
                  className += " selected";
                }
                if (submitted) {
                  if (opt.id === q.correctId) {
                    className += " correct";
                  } else if (answers[q.id] === opt.id) {
                    className += " incorrect";
                  }
                }
                
                return (
                  <motion.button
                    key={opt.id}
                    layout
                    whileHover={!submitted ? { scale: 1.01, backgroundColor: 'var(--color-surface-strong)' } : {}}
                    whileTap={!submitted ? { scale: 0.99 } : {}}
                    className={className}
                    onClick={() => handleSelect(q.id, opt.id)}
                    disabled={submitted}
                    style={{ opacity: submitted && opt.id !== q.correctId && opt.id !== answers[q.id] ? 0.5 : 1 }}
                  >
                    <span style={{ fontWeight: 600, marginRight: '12px' }}>{opt.id}</span>
                    {opt.text}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {submitted && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
                  className="case-result" 
                  style={{ 
                    borderLeftColor: answers[q.id] === q.correctId ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)',
                    overflow: 'hidden'
                  }}
                >
                  <h4 className="title-sm" style={{ marginBottom: '8px' }}>
                    {answers[q.id] === q.correctId ? 'Benar!' : 'Salah!'}
                  </h4>
                  <p className="body-md">{q.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xxl)' }}>
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.button 
              key="submit-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: allAnswered ? 1 : 0.5 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={allAnswered ? { scale: 1.05 } : {}}
              whileTap={allAnswered ? { scale: 0.95 } : {}}
              className="button-primary" 
              onClick={handleSubmit}
              disabled={!allAnswered}
              style={{ cursor: allAnswered ? 'pointer' : 'not-allowed' }}
            >
              Lihat Hasil
            </motion.button>
          ) : (
            <motion.div 
              key="result-panel"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{ padding: 'var(--spacing-xl)', backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-xl)', border: '1px solid var(--color-hairline)' }}
            >
              <h2 className="display-sm" style={{ marginBottom: 'var(--spacing-base)' }}>Hasil Evaluasi</h2>
              <motion.p 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
                className="display-xl" 
                style={{ color: 'var(--color-primary)' }}
              >
                {score} / {questions.length}
              </motion.p>
              <p className="body-md" style={{ marginTop: 'var(--spacing-base)' }}>
                {score === questions.length ? 'Luar biasa! Kamu telah menguasai materi etika AI dengan sempurna.' : 
                 score >= 5 ? 'Kerja bagus! Pemahamanmu tentang etika AI sudah cukup baik.' :
                 'Terus belajar! Mari pelajari kembali materi di atas untuk memperdalam pemahamanmu.'}
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="button-outline" 
                style={{ marginTop: 'var(--spacing-lg)' }}
                onClick={() => {
                  setSubmitted(false);
                  setAnswers({});
                  setScore(0);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Coba Lagi
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
