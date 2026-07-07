
import React, { useState, useMemo } from 'react';
import { Advice, adviceData } from './data';

const AdviceCard = ({ advice }: { advice: Advice }) => {
  return (
    <article className="card advice-card" aria-labelledby={`advice-heading-${advice.id}`}>
      <div className="card-content">
        <h2 id={`advice-heading-${advice.id}`}>{advice.title}</h2>
        <p>{advice.description}</p>
      </div>
    </article>
  );
};

const AdvicePage = () => {
  const [selectedTarget, setSelectedTarget] = useState('All');
  
  const targets = ['All', 'Common', 'Gemini Canvas', 'AI Studio'];

  const filteredAdvice = useMemo(() => {
    if (selectedTarget === 'All') {
        return adviceData;
    }
    return adviceData.filter(item => item.target === selectedTarget);
  }, [selectedTarget]);

  const slugify = (text: string) => text.toLowerCase().replace(/[\s/.]+/g, '-').replace(/-$/, '');

  return (
    <>
      <header>
        <h1>Prompting & Coding Advice</h1>
        <p>General tips and best practices for working with AI code generation.</p>
      </header>

      <div className="category-filters" role="toolbar" aria-label="Filter by target environment">
        {targets.map(target => (
          <button
            key={target}
            className={`category-filter ${selectedTarget === target ? 'active' : ''} ${target === 'Gemini Canvas' ? 'gemini-canvas-button' : ''}`}
            onClick={() => setSelectedTarget(target)}
            aria-pressed={selectedTarget === target}
            data-category={target === 'All' ? '' : slugify(target)}
          >
            {target}
          </button>
        ))}
      </div>

      <div className="card-grid">
        {filteredAdvice.map(item => (
          <AdviceCard key={item.id} advice={item} />
        ))}
      </div>
    </>
  );
};

export default AdvicePage;
