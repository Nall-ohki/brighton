import React, { useState, useEffect } from 'react';

export default function InspirationLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    fetch('metadata.json')
      .then(r => r.json())
      .then(d => setMetadata(d))
      .catch(e => console.error('Failed to load metadata.json', e));
  }, []);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        width: isOpen ? '400px' : '0px',
        height: '100vh',
        background: '#f8fafc',
        borderRight: isOpen ? '1px solid #e2e8f0' : 'none',
        overflowY: 'auto',
        flexShrink: 0,
        boxShadow: isOpen ? '4px 0 15px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: 5000
      }}>
        <div style={{ padding: '24px', width: '400px', opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s', transitionDelay: isOpen ? '0.1s' : '0s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#0f172a', fontFamily: 'sans-serif' }}>Inspiration</h2>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '4px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          
          {metadata && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'sans-serif' }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}>Title</div>
                <div style={{ color: '#0f172a', fontWeight: '500' }}>{metadata.title}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}>Prompt</div>
                <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{metadata.basePrompt || metadata.prompt}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{
        position: 'absolute',
        left: isOpen ? '-50px' : '0',
        top: '50%',
        transform: 'translateY(-50%)',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 5000
      }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(to right, #ffffff, #f1f5f9)',
            border: '1px solid #cbd5e1',
            borderLeft: 'none',
            padding: '20px 8px',
            borderRadius: '0 8px 8px 0',
            cursor: 'pointer',
            boxShadow: '3px 0 8px rgba(0,0,0,0.1), inset 1px 0 0 white',
            display: 'flex',
            alignItems: 'center',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            fontWeight: 'bold',
            color: '#475569',
            letterSpacing: '1px',
            fontFamily: 'sans-serif'
          }}
        >
          Inspiration
        </button>
      </div>

      <div style={{ flex: 1, height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
