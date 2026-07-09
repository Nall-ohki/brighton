const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const layoutContent = `import React, { useState, useEffect } from 'react';

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
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
      
      {/* Sidebar Container */}
      <div style={{
        width: isOpen ? '400px' : '48px',
        height: '100vh',
        background: isOpen ? '#f8fafc' : 'linear-gradient(to right, #f8fafc, #e2e8f0)',
        borderRight: '1px solid #cbd5e1',
        overflowY: isOpen ? 'auto' : 'hidden',
        overflowX: 'hidden',
        flexShrink: 0,
        boxShadow: isOpen ? '4px 0 15px rgba(0,0,0,0.05)' : 'inset -1px 0 2px rgba(255,255,255,0.5), 2px 0 5px rgba(0,0,0,0.1)',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: 5000,
        display: 'flex',
        flexDirection: 'column',
      }}>
        
        {/* Open Content */}
        <div style={{ 
          padding: '24px', 
          width: '400px', 
          opacity: isOpen ? 1 : 0, 
          transition: 'opacity 0.2s', 
          transitionDelay: isOpen ? '0.1s' : '0s', 
          display: isOpen ? 'block' : 'none' 
        }}>
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

        {/* Closed Content (The Skewomorphic Tab) */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#475569',
              writingMode: 'vertical-rl',
              fontWeight: 'bold',
              letterSpacing: '2px',
              fontFamily: 'sans-serif',
              fontSize: '1.1rem',
              textTransform: 'uppercase'
            }}
          >
            INSPIRATION
          </button>
        )}
      </div>

      {/* Main App Content */}
      <div style={{ flex: 1, height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
`;

const examplesRoot = path.join(__dirname, 'examples');
const publicExamplesRoot = path.join(__dirname, 'public', 'examples');

const dirs = fs.readdirSync(examplesRoot, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('app-'))
    .map(dirent => dirent.name);

for (const dir of dirs) {
    console.log(`Fixing ${dir}...`);
    const appDir = path.join(examplesRoot, dir);
    const srcDir = path.join(appDir, 'src');
    
    // 1. Write InspirationLayout.tsx
    fs.writeFileSync(path.join(srcDir, 'InspirationLayout.tsx'), layoutContent);

    // 2. Build the app
    try {
        execSync('npm run build', { cwd: appDir, stdio: 'ignore' });
        
        // 3. Copy to public/examples
        const publicAppDir = path.join(publicExamplesRoot, dir);
        execSync(`rm -rf "${publicAppDir}" && cp -r "${path.join(appDir, 'dist')}" "${publicAppDir}"`, { stdio: 'ignore' });

        // 4. Fix absolute paths in the newly copied index.html
        const indexPath = path.join(publicAppDir, 'index.html');
        if (fs.existsSync(indexPath)) {
            let indexContent = fs.readFileSync(indexPath, 'utf8');
            indexContent = indexContent.replace(/src="\/assets\//g, 'src="./assets/');
            indexContent = indexContent.replace(/href="\/assets\//g, 'href="./assets/');
            fs.writeFileSync(indexPath, indexContent);
        }
    } catch (e) {
        console.error(`Failed to build ${dir}:`, e.message);
    }
}

console.log('Done fixing layout and rebuilding apps.');
