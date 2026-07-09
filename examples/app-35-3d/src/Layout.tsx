import React, { useEffect, useState } from 'react';
import './Layout.css';

interface Metadata {
  title: string;
  authors: { name: string; origin: string }[];
  description: string;
  session_takeaway: string[];
  prompt: string;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetch('./metadata.json')
      .then(r => r.json())
      .then(data => setMetadata(data))
      .catch(e => console.error('Failed to load metadata', e));
  }, []);

  return (
    <div className={`showcase-layout ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="showcase-sidebar-wrapper">
        <div className="showcase-sidebar">
          {metadata ? (
            <>
              <h2>{metadata.title}</h2>
              <div className="authors">
                {metadata.authors.map((a, i) => (
                  <div key={i} className="author">
                    <strong>{a.name}</strong> ({a.origin})
                  </div>
                ))}
              </div>
              <div className="section">
                <h3>Talk Description</h3>
                <p>{metadata.description}</p>
              </div>
              <div className="section">
                <h3>Takeaways</h3>
                <ul>
                  {metadata.session_takeaway.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
              <div className="section prompt-section">
                <h3>Generation Prompt</h3>
                <div className="prompt-box">{metadata.prompt}</div>
              </div>
            </>
          ) : (
            <div className="loading">Loading metadata...</div>
          )}
        </div>
        <div 
          className="skeuomorphic-tab" 
          onClick={() => setIsExpanded(!isExpanded)}
          title="Toggle Inspiration"
        >
          <div className="tab-text">Inspiration</div>
        </div>
      </div>
      <div className="showcase-content">
        {children}
      </div>
    </div>
  );
}
