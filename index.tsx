import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import ResourcesPage from './libraries';
import ShowcasePage from './showcase';
import PromptBuilderPage from './prompt_builder';
import AdvicePage from './advice';
import BrightonPage from './brighton';

const ThemeSwitcher = ({ theme, toggleTheme }) => {
  return (
    <button
      className="theme-switcher"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="theme-switcher__inner">
        <svg className="theme-switcher__icon sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path 
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM17.646 16.354a.75.75 0 10-1.06-1.06l-1.591 1.591a.75.75 0 101.06 1.06l1.591-1.591zM12 19.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 19.5zM6.354 16.354a.75.75 0 10-1.06-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM3.75 12a.75.75 0 01-.75.75H.75a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM6.166 6.106a.75.75 0 00-1.06 1.06l1.591 1.591a.75.75 0 101.06-1.06l-1.591-1.59z" 
            />
        </svg>
        <svg className="theme-switcher__icon moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69a.75.75 0 0 1 .981.981A10.503 10.503 0 0 1 18 19.5a10.5 10.5 0 0 1-10.5-10.5A10.503 10.503 0 0 1 9.528 1.718Z" clipRule="evenodd" /></svg>
      </div>
    </button>
  );
};

const getInitialView = () => {
  const hash = window.location.hash.replace('#', '');
  const views = ['brighton', 'showcase', 'resources', 'prompt', 'advice'];
  const view = hash.split('?')[0].split('/')[0];
  return views.includes(view) ? view : 'brighton';
};

const App = () => {
  const [view, setView] = useState(getInitialView);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme || (prefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

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
      <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
      <nav className="main-nav">
        <button
          onClick={() => changeView('brighton')}
          className={view === 'brighton' ? 'active' : ''}
          aria-pressed={view === 'brighton'}
        >
          Develop: Brighton 2026 Information
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