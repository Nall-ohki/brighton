import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import ResourcesPage from './libraries';
import ShowcasePage from './showcase';
import PromptBuilderPage from './prompt_builder';
import AdvicePage from './advice';
import BrightonPage from './brighton';

const getInitialView = () => {
  const hash = window.location.hash.replace('#', '');
  const views = ['brighton', 'showcase', 'resources', 'prompt', 'advice'];
  const view = hash.split('?')[0].split('/')[0];
  return views.includes(view) ? view : 'brighton';
};

const App = () => {
  const [view, setView] = useState(getInitialView);

  useEffect(() => {
    let title = 'Vibe Coded';
    if (view === 'showcase') {
      title = 'Vibe Coded App Showcase';
    } else if (view === 'resources') {
      title = 'Vibe Coded Resources';
    } else if (view === 'prompt') {
      title = 'Vibe Coded Prompt Generator';
    } else if (view === 'advice') {
      title = 'Vibe Coded Prompting Advice';
    } else if (view === 'brighton') {
      title = 'Vibe Coded - Develop: Brighton 2026 Information';
    }
    document.title = title;
  }, [view]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const views = ['brighton', 'showcase', 'resources', 'prompt', 'advice'];
      const newView = hash.split('?')[0].split('/')[0];
      if (views.includes(newView)) {
        setView(newView);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const changeView = (newView: string) => {
    window.location.hash = newView;
  };

  return (
    <>
      <nav className="main-nav">
        <div className="nav-left">
          <svg className="app-icon" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 2L2 7l2 11.5L12 22l8-3.5L22 7l-10-5zm0 2.2l7.5 3.8-1.5 8.5L12 19.5 6 16.5 4.5 8 12 4.2z" />
          </svg>
          <div className="app-title">Develop: Brighton Vibe Coding Session</div>
        </div>
        <div className="nav-center">
        <button
          onClick={() => changeView('brighton')}
          className={view === 'brighton' ? 'active' : ''}
          aria-pressed={view === 'brighton'}
        >
          Information
        </button>
        <button
          onClick={() => changeView('showcase')}
          className={view === 'showcase' ? 'active' : ''}
          aria-pressed={view === 'showcase'}
        >
          App Showcase
        </button>
        <button
          onClick={() => changeView('resources')}
          className={view === 'resources' ? 'active' : ''}
          aria-pressed={view === 'resources'}
        >
          Resources
        </button>
        <button
          id="nav-prompt"
          onClick={() => changeView('prompt')}
          className={view === 'prompt' ? 'active' : ''}
          aria-pressed={view === 'prompt'}
        >
          Prompt Generator
        </button>
        <button
          onClick={() => changeView('advice')}
          className={view === 'advice' ? 'active' : ''}
          aria-pressed={view === 'advice'}
        >
          Advice
        </button>
        </div>
        <div className="nav-right">
        </div>
      </nav>
      <main>
        {view === 'showcase' && <ShowcasePage />}
        {view === 'prompt' && <PromptBuilderPage />}
        {view === 'resources' && <ResourcesPage />}
        {view === 'advice' && <AdvicePage />}
        {view === 'brighton' && <BrightonPage />}
      </main>
    </>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}