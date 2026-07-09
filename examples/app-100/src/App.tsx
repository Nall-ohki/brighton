import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import './App.css';

type Character = {
  id: string;
  name: string;
  cliche: string;
  emoji: string;
  assignedDialect: string | null;
  speechText: string | null;
};

type Dialect = {
  id: string;
  name: string;
  phonetic: string;
  speechText: string;
};

const INITIAL_CHARACTERS: Character[] = [
  { id: 'c1', name: 'Dwarf', cliche: 'Scottish', emoji: '🪓', assignedDialect: null, speechText: null },
  { id: 'c2', name: 'Elf', cliche: 'RP English', emoji: '🏹', assignedDialect: null, speechText: null },
  { id: 'c3', name: 'Orc', cliche: 'Cockney', emoji: '🐗', assignedDialect: null, speechText: null },
  { id: 'c4', name: 'Halfling', cliche: 'West Country', emoji: '🦶', assignedDialect: null, speechText: null },
];

const DIALECTS: Dialect[] = [
  { id: 'd1', name: 'Appalachian', phonetic: '/ˌæp.əˈlætʃ.ən/', speechText: "Well, I reckon that dragon's fixin' to cause a heap of trouble yonder." },
  { id: 'd2', name: 'Scouse', phonetic: '/skaʊs/', speechText: "Alright la, that dragon's out of order, proper boss though." },
  { id: 'd3', name: 'Cajun', phonetic: '/ˈkeɪ.dʒən/', speechText: "Laissez les bons temps rouler, that dragon's a big gumbo, cher." },
  { id: 'd4', name: 'Māori', phonetic: '/ˈmaʊ.ri/', speechText: "Kia ora bro, that taniwha is looking mean as!" },
];

const CLICHES = ['[skɒt.ɪʃ] Scottish', '[ɑːˈpiː] RP English', '[ˈkɒk.ni] Cockney', '[wɛst ˈkʌn.tri] West Country', '[ˈrʌʃ.ən] Russian', '[ˈaɪ.rɪʃ] Irish'];

const FallingCliches = () => {
  const [cards, setCards] = useState<{ id: number; text: string; left: string; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const newCards = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      text: CLICHES[Math.floor(Math.random() * CLICHES.length)],
      left: `${Math.random() * 90}%`,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 5,
    }));
    setCards(newCards);
  }, []);

  return (
    <div className="falling-layer">
      {cards.map(card => (
        <motion.div
          key={card.id}
          className="cliche-card"
          style={{ left: card.left, top: '-50px' }}
          animate={{ top: '110vh' }}
          transition={{
            duration: card.duration,
            delay: card.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {card.text}
        </motion.div>
      ))}
    </div>
  );
};

export default function App() {
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [availableDialects, setAvailableDialects] = useState<Dialect[]>(DIALECTS);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [win, setWin] = useState(false);

  const stereotypePercentage = ((characters.filter(c => !c.assignedDialect).length) / INITIAL_CHARACTERS.length) * 100;

  useEffect(() => {
    if (stereotypePercentage === 0 && !win) {
      setWin(true);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#c5a059', '#8b0000', '#e6d5b8'] });
    }
  }, [stereotypePercentage, win]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, dialect: Dialect) => {
    const dropPoint = { x: info.point.x, y: info.point.y };
    
    let droppedOnCharIndex = -1;
    for (let i = 0; i < slotRefs.current.length; i++) {
      const el = slotRefs.current[i];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (dropPoint.x >= rect.left && dropPoint.x <= rect.right &&
            dropPoint.y >= rect.top && dropPoint.y <= rect.bottom) {
          droppedOnCharIndex = i;
          break;
        }
      }
    }

    if (droppedOnCharIndex !== -1) {
      const char = characters[droppedOnCharIndex];
      if (!char.assignedDialect) {
        const newChars = [...characters];
        newChars[droppedOnCharIndex] = {
          ...char,
          assignedDialect: dialect.name,
          speechText: dialect.speechText
        };
        setCharacters(newChars);
        setAvailableDialects(prev => prev.filter(d => d.id !== dialect.id));
      }
    }
  };

  return (
    <div className="game-container">
      <FallingCliches />

      <header className="header">
        <h1>Dungeons & Dialects</h1>
        <div className="meter-container">
          <div className="meter-fill" style={{ width: `${stereotypePercentage}%` }}></div>
          <div className="meter-label">Stereotype Meter: {stereotypePercentage}%</div>
        </div>
      </header>

      <main className="main-area">
        {characters.map((char, index) => (
          <div 
            key={char.id} 
            className={`character-slot ${char.assignedDialect ? 'highlight' : ''}`}
            ref={el => slotRefs.current[index] = el}
          >
            <div className="character-portrait">{char.emoji}</div>
            <div className="character-name">{char.name}</div>
            
            <AnimatePresence mode="wait">
              {!char.assignedDialect ? (
                <motion.div 
                  key="cliche"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="character-accent accent-cliche"
                >
                  {char.cliche}
                </motion.div>
              ) : (
                <motion.div 
                  key="authentic"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="character-accent accent-authentic"
                >
                  {char.assignedDialect}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {char.speechText && (
                <motion.div 
                  className="speech-bubble"
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  "{char.speechText}"
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </main>

      <footer className="inventory-area">
        {availableDialects.map(dialect => (
          <div key={dialect.id} className="dialect-card-wrapper">
            <motion.div
              className="dialect-card"
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.1, zIndex: 100 }}
              onDragEnd={(e, info) => handleDragEnd(e, info, dialect)}
            >
              <span>{dialect.name}</span>
              <small>{dialect.phonetic}</small>
            </motion.div>
          </div>
        ))}
      </footer>

      {win && (
        <motion.div 
          className="win-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2>Clichés Broken!</h2>
          <p>You have brought authentic voices to the realm.</p>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </motion.div>
      )}
    </div>
  );
}
