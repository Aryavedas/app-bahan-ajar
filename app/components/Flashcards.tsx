"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

type Flashcard = {
  id: number;
  term: string;
  definition: string;
};

const defaultCards: Flashcard[] = [
  { id: 1, term: 'Algoritma', definition: 'Sekumpulan instruksi logis yang diikuti komputer untuk menyelesaikan tugas tertentu secara otomatis' },
  { id: 2, term: 'Bias AI', definition: 'Kecenderungan sistem AI menghasilkan keputusan yang tidak adil karena data pelatihan yang tidak representatif' },
  { id: 3, term: 'Deepfake', definition: 'Konten media (video/audio/gambar) yang dimanipulasi menggunakan AI sehingga tampak nyata namun palsu' },
  { id: 4, term: 'Transparansi AI', definition: 'Kemampuan untuk menjelaskan bagaimana AI mengambil keputusan secara terbuka dan dapat dipahami' },
  { id: 5, term: 'Filter Bubble', definition: 'Kondisi ketika algoritma terus menyajikan konten sesuai preferensi lama, mempersempit wawasan pengguna' },
  { id: 6, term: 'Akuntabilitas', definition: 'Tanggung jawab pihak yang mengembangkan atau menggunakan AI atas dampak yang ditimbulkannya' },
  { id: 7, term: 'Machine Learning', definition: 'Kemampuan mesin untuk belajar dari data dan meningkatkan performa tanpa diprogram ulang secara eksplisit' },
  { id: 8, term: 'Privasi Data', definition: 'Hak individu untuk mengontrol bagaimana informasi pribadi mereka dikumpulkan, disimpan, dan digunakan' },
  { id: 9, term: 'Hallucination AI', definition: 'Fenomena ketika AI menghasilkan informasi yang terdengar meyakinkan namun tidak akurat atau sepenuhnya fiktif' },
  { id: 10, term: 'Human Oversight', definition: 'Pengawasan aktif manusia terhadap sistem AI untuk memastikan keputusan AI tetap sesuai nilai kemanusiaan' }
];

export default function Flashcards() {
  const [cards, setCards] = useState<Flashcard[]>(defaultCards);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const handleFlip = (id: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards({}); // Reset flips on shuffle
  };

  // Stagger animation container
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  return (
    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <p className="body-md">Klik kartu untuk membalik dan melihat definisinya.</p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="button-outline" 
          onClick={handleShuffle}
        >
          Acak Kartu
        </motion.button>
      </div>
      
      <motion.div 
        className="flashcard-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        <AnimatePresence mode="popLayout">
          {cards.map(card => {
            const isFlipped = flippedCards[card.id] || false;
            
            return (
              <motion.div 
                key={card.id} 
                layout
                variants={itemVariants}
                className="flashcard"
                onClick={() => handleFlip(card.id)}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                style={{ cursor: 'pointer', perspective: '1000px' }}
              >
                <motion.div
                  className="flashcard-inner"
                  initial={false}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  style={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: '200px', 
                    transformStyle: 'preserve-3d' 
                  }}
                >
                  {/* Front */}
                  <div className="flashcard-front" style={{ 
                    backfaceVisibility: 'hidden', 
                    position: 'absolute', 
                    width: '100%', 
                    height: '100%'
                  }}>
                    <h3 className="title-md">{card.term}</h3>
                  </div>
                  
                  {/* Back */}
                  <div className="flashcard-back" style={{ 
                    backfaceVisibility: 'hidden', 
                    position: 'absolute', 
                    width: '100%', 
                    height: '100%', 
                    transform: 'rotateY(180deg)'
                  }}>
                    <p className="body-sm">{card.definition}</p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
