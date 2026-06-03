import React, { useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioService } from '../services/audioService';

interface PlantCharacterProps {
  stage: number; // 0-2 (seed, sprout, plant)
  stats: {
    water: number;
    sun: number;
    love: number;
  };
}

export const PlantCharacter: React.FC<PlantCharacterProps> = ({ stage, stats }) => {
  const { water, sun, love } = stats;
  
  // Audio Feedback - Track previous values to play sounds only on change
  const prevStats = useRef(stats);
  
  useEffect(() => {
    if (stats.water > prevStats.current.water) {
      audioService.playWater();
    }
    if (stats.sun > prevStats.current.sun) {
      audioService.playSun();
    }
    if (stats.love > prevStats.current.love) {
      audioService.playLove();
    }
    prevStats.current = stats;
  }, [stats]);
  
  // Calculate derived states
  const happiness = (water + sun + love) / 3;
  
  // Specific thresholds
  const isEcstatic = happiness > 92;
  const isVeryHappy = happiness > 80 && !isEcstatic;
  const isHappy = happiness > 65 && !isVeryHappy && !isEcstatic;
  const isNeutral = happiness <= 65 && happiness > 45;
  const isSlightlySad = happiness <= 45 && happiness > 25;
  const isSad = happiness <= 25 && happiness > 10;
  const isExhausted = happiness <= 10;

  // Modifiers
  const isThirsty = water < 25;
  const isVeryThirsty = water < 10;
  const isDark = sun < 25;
  const isVeryDark = sun < 10;
  const isLoved = love > 80;
  const isNeglected = love < 20;

  // Visual adjustments
  const color = isThirsty ? '#A5D6A7' : '#4CAF50'; 
  const tomatoColor = isVeryThirsty || isVeryDark 
    ? '#9e3a3a' // Moribund red
    : isThirsty || isDark 
      ? '#D32F2F' // Stressed red
      : '#FF5252'; // Healthy red

  const PlantSVG = useMemo(() => {
    // Seed stage
    if (stage === 0) {
      return (
        <svg viewBox="0 0 100 100" className="w-48 h-48 drop-shadow-xl">
           <circle cx="50" cy="80" r="10" fill="#795548" />
           <path d="M50 80 Q 50 60 60 55" stroke="#8BC34A" strokeWidth="4" fill="none" />
           <path d="M60 55 Q 70 50 60 45 Q 50 50 60 55" fill="#8BC34A" />
        </svg>
      );
    } 
    
    // Mature Plant (Improved Pixel Tomatinho)
    const renderPixelFace = () => {
      return (
        <g transform="translate(100, 80) scale(1.5)">
          {/* Main Body Outline (Black Pixels) */}
          <path 
            d="M-32 -32 H32 V32 H-32 Z M-42 -22 H42 V22 H-42 Z M-22 -42 H22 V42 H-22 Z" 
            fill="black" 
          />
          {/* Main Body (Red Pixels - slightly inset) */}
          <path 
            d="M-28 -28 H28 V28 H-28 Z M-38 -18 H38 V18 H-38 Z M-18 -38 H18 V38 H-18 Z" 
            fill={tomatoColor} 
            className="transition-colors duration-1000"
          />
          
          {/* Shine highlight if sunny */}
          {sun > 50 && (
            <rect x="-24" y="-24" width="8" height="8" fill="white" fillOpacity={sun > 80 ? "0.5" : "0.3"} />
          )}

          {/* Blush */}
          <g opacity={isLoved ? 1 : 0.5}>
            <rect x="-30" y="8" width="12" height="6" fill="#F06292" />
            <rect x="18" y="8" width="12" height="6" fill="#F06292" />
          </g>

          {/* Eyes (Pixel Style - Reactive) */}
          <g>
            {isEcstatic ? (
              // Sparkle Eyes
              <>
                <path d="M-25 -5 h5 v-5 h5 v5 h5 v5 h-5 v5 h-5 v-5 h-5 z" fill="white" />
                <path d="M10 -5 h5 v-5 h5 v5 h5 v5 h-5 v5 h-5 v-5 h-5 z" fill="white" />
              </>
            ) : isExhausted ? (
              // X Pixel Eyes
              <g stroke="black" strokeWidth="3">
                <path d="M-24 -8 l10 10 M-24 2 l10 -10" />
                <path d="M14 -8 l10 10 M14 2 l10 -10" />
              </g>
            ) : isVeryDark || (isDark && isNeglected) ? (
              // Sleepy/Sleepy eyes (flat lines)
              <>
                <rect x="-24" y="-4" width="12" height="3" fill="black" />
                <rect x="12" y="-4" width="12" height="3" fill="black" />
              </>
            ) : isThirsty || isSad ? (
              // Droopy/Tired eyes
              <>
                <rect x="-24" y="-8" width="10" height="10" fill="black" />
                <rect x="-24" y="-8" width="10" height="3" fill="black" fillOpacity="0.5" />
                <rect x="-18" y="-2" width="3" height="4" fill="white" />
                
                <rect x="14" y="-8" width="10" height="10" fill="black" />
                <rect x="14" y="-8" width="10" height="3" fill="black" fillOpacity="0.5" />
                <rect x="20" y="-2" width="3" height="4" fill="white" />
              </>
            ) : (
                // Normal Kawaii Eyes
                <g>
                  <rect x="-24" y="-8" width="10" height="14" fill="black" />
                  <rect x="-18" y="0" width="4" height="6" fill="white" />
                  <rect x="14" y="-8" width="10" height="14" fill="black" />
                  <rect x="20" y="0" width="4" height="6" fill="white" />
                </g>
            )}
          </g>
          
          {/* Mouth (Reactive Shapes) */}
          <g transform="translate(0, 12)">
            {isEcstatic ? (
               // Huge open smile
               <rect x="-10" y="0" width="20" height="10" fill="black" />
            ) : isVeryHappy ? (
               // Happy "w" mouth
               <path d="M-10 0 v4 h5 v-4 h5 v4 h5 v-4" stroke="black" strokeWidth="3" fill="none" />
            ) : isSad || isThirsty || isExhausted ? (
               // Frown
               <path d="M-10 6 h20 M-10 6 v-4 M10 6 v-4" stroke="black" strokeWidth="3" fill="none" />
            ) : isNeutral ? (
               // Neutral straight
               <rect x="-8" y="2" width="16" height="3" fill="black" />
            ) : (
              // Standard "u" smile
              <path d="M-10 0 v6 h20 v-6" stroke="black" strokeWidth="3" fill="none" />
            )}
          </g>
          
          {/* Pixel Stem/Hat (From Image) */}
          <g transform="translate(0, -45)">
            {/* Outline */}
            <path d="M-6 -10 H6 V15 H-6 Z M-18 -5 H18 V5 H-18 Z" fill="black" />
            <path d="M-10 -15 H-4 V-10 H-10 Z M4 -15 H10 V-10 H4 Z" fill="black" />
            
            {/* Green part */}
            <path d="M-3 -7 H3 V12 H-3 Z M-15 -2 H15 V2 H-15 Z" fill="#7CB342" />
            <path d="M-8 -12 H-6 V-7 H-8 Z M6 -12 H8 V-7 H6 Z" fill="#7CB342" />
            
            {/* Center tip */}
            <rect x="-2" y="-18" width="4" height="8" fill="black" />
            <rect x="-1" y="-17" width="2" height="6" fill="#8BC34A" />
          </g>
        </g>
      );
    };

    return (
      <svg viewBox="0 0 200 200" className="w-64 h-64 drop-shadow-2xl overflow-visible">
        {/* Background Environmental Effects */}
        <AnimatePresence>
          <motion.g
            key="background-sun"
            className="pointer-events-none"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ 
              opacity: 0.8, 
              scale: 1
            }}
            transition={{ 
              opacity: { duration: 1 }
            }}
            style={{ originX: "165px", originY: "35px" }}
          >
            {/* Sun Rays Background */}
            {[...Array(12)].map((_, i) => (
              <line
                key={i}
                x1="165" y1="35"
                x2={165 + Math.cos((i * 30) * Math.PI / 180) * 22}
                y2={35 + Math.sin((i * 30) * Math.PI / 180) * 22}
                stroke="#FFD54F"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
              />
            ))}
            <circle cx="165" cy="35" r="12" fill="#FFF176" opacity="0.6" />
          </motion.g>

          {water > 70 && (
            <motion.g 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="rain-effect"
            >
              {[...Array(6)].map((_, i) => (
                <motion.line
                  key={i}
                  x1={20 + i * 30}
                  y1={-50}
                  x2={10 + i * 30}
                  y2={-30}
                  stroke="#4FC3F7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={{ y: [0, 250], x: [0, -50] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.8 + Math.random() * 0.4, 
                    delay: i * 0.1,
                    ease: "linear"
                  }}
                />
              ))}
            </motion.g>
          )}
          {/* Rain Effect Logic */}
        </AnimatePresence>

        {/* Animated Plant Parts */}
        <motion.g
          animate={isExhausted ? { rotate: [0, 2, -2, 0] } : (isEcstatic || isVeryHappy ? { 
            y: [0, -12, 0],
            scaleY: [1, 1.05, 1],
            scaleX: [1, 0.95, 1]
          } : isSad || isThirsty ? { rotate: 3 } : { rotate: 0 })}
          transition={{ 
            repeat: Infinity, 
            duration: isEcstatic ? 1 : 2,
            ease: "easeInOut"
          }}
          style={{ originX: "100px", originY: "80px" }}
        >
          {/* Fruit (Face) */}
          {renderPixelFace()}
        </motion.g>
      </svg>
    );
  }, [stage, water, sun, love, isHappy, isVeryHappy, isEcstatic, isSad, isExhausted, isNeutral, isSlightlySad, isThirsty, isVeryThirsty, isDark, isVeryDark, isLoved, isNeglected, color, tomatoColor]);

  return (
    <div className="flex justify-center items-end h-72 pb-8 relative z-10">
      {PlantSVG}
      
      <AnimatePresence>
        {isThirsty && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-10 right-10 bg-white p-3 rounded-xl rounded-bl-none shadow-lg"
          >
              <motion.span 
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-2xl block"
              >
                💦
              </motion.span>
          </motion.div>
        )}
        {isNeglected && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-16 left-10 bg-white p-3 rounded-xl rounded-br-none shadow-lg"
          >
              <motion.span 
                animate={{ x: [-1, 1, -1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-2xl block grayscale opacity-70"
              >
                ☁️
              </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
