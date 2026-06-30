"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Gamepad2, PenTool } from 'lucide-react';

export default function MobileNav({ activeSection }: { activeSection: string }) {
  const tabs = [
    { id: 'materi', label: 'Materi', icon: BookOpen },
    { id: 'aktivitas', label: 'Games', icon: Gamepad2 },
    { id: 'evaluasi', label: 'Evaluasi', icon: PenTool },
  ];

  return (
    <div className="mobile-nav-container">
      <motion.div 
        className="mobile-nav-bar"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
      >
        {tabs.map((tab) => {
          const isActive = activeSection === tab.id;
          const Icon = tab.icon;
          return (
            <a 
              key={tab.id} 
              href={`#${tab.id}`} 
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="mobile-nav-icon-wrapper">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-pill" 
                    className="mobile-nav-pill-bg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
              <span className="mobile-nav-label">{tab.label}</span>
            </a>
          );
        })}
      </motion.div>
    </div>
  );
}
