"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../hooks/useSound';

type Choice = {
  id: string;
  text: string;
  type: 'correct' | 'incorrect' | 'warning';
  explanation: string;
  label: string;
};

type CaseStudy = {
  id: number;
  title: string;
  narrative: string;
  choices: Choice[];
};

const caseStudies: CaseStudy[] = [
  {
    id: 1,
    title: 'Skenario 1: Tugas Kuliah & ChatGPT',
    narrative: 'Kamu mendapat tugas esai 1.500 kata tentang dampak media sosial terhadap kesehatan mental. Deadline besok pagi dan kamu belum mulai. Kamu membuka ChatGPT dan meminta AI menulis seluruh esai tersebut. Hasilnya bagus dan terlihat sangat meyakinkan. Kamu mempertimbangkan pilihan berikut:',
    choices: [
      {
        id: 'A',
        text: 'Langsung kumpulkan esai buatan AI tanpa perubahan dan tanpa keterangan apapun',
        type: 'incorrect',
        label: 'Tidak Etis ✗',
        explanation: 'Mengumpulkan karya AI sepenuhnya sebagai milik sendiri adalah bentuk plagiarisme akademik. Ini melanggar integritas akademik, bisa berujung pada sanksi dari universitas, dan yang lebih penting: kamu tidak mendapat pembelajaran apapun dari tugas tersebut.'
      },
      {
        id: 'B',
        text: 'Gunakan esai AI sebagai kerangka, kembangkan dengan pikiranmu sendiri, dan cantumkan penggunaan AI di bagian referensi',
        type: 'correct',
        label: 'Paling Etis ✓',
        explanation: 'Ini adalah cara yang tepat. AI digunakan sebagai alat bantu, bukan pengganti berpikir. Kamu tetap mengembangkan ide secara mandiri, dan transparansi tentang penggunaan AI justru menunjukkan integritas akademikmu.'
      },
      {
        id: 'C',
        text: 'Tulis ulang esai AI dengan kata-katamu sendiri tanpa menyebutkan bahwa sumber idenya dari AI',
        type: 'warning',
        label: 'Abu-abu ⚠',
        explanation: 'Kamu menghindari deteksi plagiarisme, tapi tetap tidak jujur tentang proses berpikirmu. Ide utama tetap bukan milikmu. Ini masih termasuk bentuk ketidakjujuran akademik yang samar.'
      }
    ]
  },
  {
    id: 2,
    title: 'Skenario 2: Foto Deepfake & Tekanan Sosial',
    narrative: 'Temanmu menemukan aplikasi AI yang bisa menghasilkan foto realistis seseorang dalam situasi yang tidak pernah terjadi. Dia mengajak kamu "iseng" membuat foto deepfake salah satu dosen kampus dalam situasi memalukan, lalu menyebarkannya di grup WhatsApp angkatan sebagai lelucon.',
    choices: [
      {
        id: 'A',
        text: 'Ikut membuat dan menyebarkan foto tersebut karena hanya bercanda dan tidak serius',
        type: 'incorrect',
        label: 'Sangat Tidak Etis & Ilegal ✗',
        explanation: 'Membuat dan menyebarkan deepfake tanpa persetujuan korban adalah pelanggaran serius. Di Indonesia, tindakan ini dapat dijerat UU ITE (Pasal 27 ayat 3 tentang pencemaran nama baik). Selain konsekuensi hukum, ini menyebabkan kerusakan reputasi nyata dan trauma psikologis pada korban.'
      },
      {
        id: 'B',
        text: 'Menolak, menjelaskan kepada teman bahwa tindakan itu berbahaya dan melanggar hukum',
        type: 'correct',
        label: 'Sangat Etis ✓',
        explanation: 'Menolak dan mengedukasi teman adalah bentuk keberanian digital (digital courage). Kamu tidak hanya melindungi diri sendiri, tapi juga mencegah orang lain dari tindakan yang bisa merusak hidup mereka sendiri dan korbannya.'
      },
      {
        id: 'C',
        text: 'Menolak ikut membuat, tapi diam saja dan tidak mengatakan apapun kepada teman',
        type: 'warning',
        label: 'Kurang Etis ⚠',
        explanation: 'Menolak ikut adalah langkah yang benar, tapi diam berarti membiarkan teman mengambil risiko besar sendirian. Dalam etika digital, kita punya tanggung jawab untuk saling mengingatkan di lingkungan sekitar kita.'
      }
    ]
  }
];

export default function InteractiveCaseStudy() {
  const { playSound } = useSound();
  const [selections, setSelections] = useState<Record<number, string | null>>({});

  const handleSelect = (scenarioId: number, choiceId: string) => {
    const scenario = caseStudies.find(s => s.id === scenarioId);
    const choice = scenario?.choices.find(c => c.id === choiceId);
    
    if (choice) {
      if (choice.type === 'correct') playSound('correct');
      else if (choice.type === 'incorrect') playSound('wrong');
      else if (choice.type === 'warning') playSound('warning');
    }

    setSelections(prev => ({
      ...prev,
      [scenarioId]: choiceId
    }));
  };

  const handleReset = (scenarioId: number) => {
    playSound('click');
    setSelections(prev => ({
      ...prev,
      [scenarioId]: null
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
      {caseStudies.map((scenario, index) => {
        const selectedChoiceId = selections[scenario.id];
        const selectedChoice = scenario.choices.find(c => c.id === selectedChoiceId);

        return (
          <motion.div 
            key={scenario.id} 
            className="case-study"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <h3 className="title-md" style={{ marginBottom: 'var(--spacing-base)' }}>{scenario.title}</h3>
            <p className="body-md" style={{ marginBottom: 'var(--spacing-lg)' }}>{scenario.narrative}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
              <AnimatePresence mode="wait">
                {scenario.choices.map(choice => (
                  <motion.button
                    key={choice.id}
                    layout
                    whileHover={!selectedChoiceId ? { scale: 1.01, backgroundColor: 'var(--color-surface-strong)' } : {}}
                    whileTap={!selectedChoiceId ? { scale: 0.99 } : {}}
                    className={`case-choice ${selectedChoiceId === choice.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(scenario.id, choice.id)}
                    disabled={selectedChoiceId !== null && selectedChoiceId !== undefined}
                    style={{ 
                      textAlign: 'left', 
                      width: '100%', 
                      opacity: selectedChoiceId && selectedChoiceId !== choice.id ? 0.5 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <span style={{ fontWeight: 600, marginRight: '8px' }}>{choice.id}</span>
                    <span className="body-md">{choice.text}</span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {selectedChoice && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 'var(--spacing-lg)' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className={`case-result ${selectedChoice.type}`}
                  style={{ overflow: 'hidden' }}
                >
                  <h4 className="title-sm" style={{ marginBottom: '8px' }}>{selectedChoice.label}</h4>
                  <p className="body-md">{selectedChoice.explanation}</p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="button-outline" 
                    style={{ marginTop: '16px' }}
                    onClick={() => handleReset(scenario.id)}
                  >
                    Coba Ulang Skenario Ini
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
