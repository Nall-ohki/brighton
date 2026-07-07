import React, { useState, useMemo, useEffect } from 'react';
import { ShowcaseApp, appData } from './data';

const CheckAllIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 7 17l-5-5"/>
    <path d="m22 10-7.5 7.5L13 16"/>
  </svg>
);

const ClearIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
);

const Card = ({ categories, url, id, basePrompt, source, cardInfo }: ShowcaseApp) => {
  const displayTitle = cardInfo.title;
  const sourceSlug = source.toLowerCase().replace(/[\s/.:]+/g, '-');
  return (
    <article className={`card card--source-${sourceSlug}`} aria-labelledby={`card-heading-${id}`}>
      <div className={`source-badge category-tag--${sourceSlug}`}>
        {source}
      </div>
      <div className="card-content" style={{ paddingTop: '2.25rem' }}>
        <h2 id={`card-heading-${id}`} style={{ color: '#5e4d9b', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.2rem', lineHeight: 1.3 }}>
          {cardInfo.title}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '0.75rem', rowGap: '0.4rem', alignItems: 'baseline', lineHeight: 1.25 }}>
          {cardInfo.authors.map((s, idx) => (
            <React.Fragment key={idx}>
              <span style={{ color: '#e67e22', fontWeight: 700 }}>{s.name}</span>
              <span style={{ color: '#4b5563', fontWeight: 700, fontSize: '0.95rem' }}>{s.origin || ''}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
      <footer className="card-footer" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
          {[...categories].sort((a, b) => a.localeCompare(b)).map(cat => (
            <span key={cat} className={`category-tag category-tag--${cat.toLowerCase().replace(/[\s/.:]+/g, '-')}`}>{cat}</span>
          ))}
        </div>
        <div style={{ flexShrink: 0 }}>
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`View the app: ${displayTitle}`}>
              View App
            </a>
          ) : basePrompt ? (
            <div className="prompt-tooltip-container">
              <button 
                className="view-app-button" 
                aria-label={`Try prompt for: ${displayTitle}`}
                onClick={() => {
                  window.sessionStorage.setItem('pendingIdea', basePrompt);
                  document.getElementById('nav-prompt')?.click();
                }}
              >
                Try Prompt
              </button>
              <div className="prompt-tooltip">
                {basePrompt}
              </div>
            </div>
          ) : (
            <span className="view-app-disabled" aria-label={`App coming soon: ${displayTitle}`}>
              Coming Soon
            </span>
          )}
        </div>
      </footer>
    </article>
  );
};

type SourceType = 'DeepMind' | 'Develop 2026';

const ALL_CATEGORIES = Array.from(new Set(appData.flatMap(app => app.categories))).sort((a, b) => a.localeCompare(b));

const parseHashParams = () => {
  const hash = window.location.hash.replace('#', '');
  if (!hash.startsWith('showcase')) return null;
  
  // Backwards compatibility with old hash format `#showcase/DeepMind,Develop 2026`
  if (hash.includes('/')) {
    const parts = hash.split('/');
    if (parts.length > 1) {
      const sourcesStr = decodeURIComponent(parts[1]);
      let sources: SourceType[] = [];
      if (sourcesStr !== 'none') {
        sources = sourcesStr.split(',').filter(s => s === 'DeepMind' || s === 'Develop 2026') as SourceType[];
      }
      return { sources, categories: ALL_CATEGORIES };
    }
    return { sources: ['Develop 2026'] as SourceType[], categories: ALL_CATEGORIES };
  }

  const query = hash.includes('?') ? hash.substring(hash.indexOf('?') + 1) : '';
  const params = new URLSearchParams(query);
  
  let sources: SourceType[] = ['Develop 2026'];
  if (params.has('sources')) {
    const s = params.get('sources');
    if (s === 'none') sources = [];
    else if (s) sources = s.split(',').filter(x => x === 'DeepMind' || x === 'Develop 2026') as SourceType[];
  }
  
  let categories: string[] = ALL_CATEGORIES;
  if (params.has('categories')) {
    const c = params.get('categories');
    if (c === 'none') categories = [];
    else if (c) categories = c.split(',').filter(x => ALL_CATEGORIES.includes(x));
  }
  
  return { sources, categories };
};

const updateHash = (sources: SourceType[], categories: string[]) => {
  const params = new URLSearchParams();
  if (sources.length === 0) params.set('sources', 'none');
  else params.set('sources', sources.join(','));
  
  if (categories.length === 0) params.set('categories', 'none');
  else if (categories.length === ALL_CATEGORIES.length) {
    // don't clutter the URL if all categories are selected
  } else {
    params.set('categories', categories.join(','));
  }
  
  let queryString = params.toString();
  if (queryString) queryString = `?${queryString}`;
  
  window.location.hash = `showcase${queryString}`;
};

const ShowcasePage = () => {
  const initialParams = parseHashParams() || { sources: ['Develop 2026'] as SourceType[], categories: ALL_CATEGORIES };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialParams.categories);
  const [selectedSources, setSelectedSources] = useState<SourceType[]>(initialParams.sources);

  React.useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHashParams();
      if (parsed) {
        setSelectedSources(parsed.sources);
        setSelectedCategories(parsed.categories);
      } else if (window.location.hash === '#showcase' || window.location.hash === '') {
        setSelectedSources(['Develop 2026']);
        setSelectedCategories(ALL_CATEGORIES);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSourceToggle = (source: SourceType) => {
    const newSources = selectedSources.includes(source)
      ? selectedSources.filter(s => s !== source)
      : [...selectedSources, source];
    updateHash(newSources, selectedCategories);
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    updateHash(selectedSources, newCategories);
  };

  const isAllCategoriesSelected = selectedCategories.length === ALL_CATEGORIES.length;
  const handleAllCategoriesToggle = () => {
    updateHash(selectedSources, isAllCategoriesSelected ? [] : ALL_CATEGORIES);
  };

  const allSources: SourceType[] = ['DeepMind', 'Develop 2026'];
  const isAllSelected = selectedSources.length === allSources.length;

  const handleAllToggle = () => {
    updateHash(isAllSelected ? [] : allSources, selectedCategories);
  };

  const filteredApps = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    
    let apps = appData;

    apps = apps.filter(app => selectedSources.includes(app.source || 'DeepMind'));
    
    if (selectedCategories.length === 0) {
      apps = [];
    } else {
      apps = apps.filter(app => app.categories.some(c => selectedCategories.includes(c)));
    }
    
    if (lowercasedFilter) {
      apps = apps.filter(app => 
        app.cardInfo.title.toLowerCase().includes(lowercasedFilter) ||
        app.cardInfo.authors.some(s => s.name.toLowerCase().includes(lowercasedFilter) || s.origin.toLowerCase().includes(lowercasedFilter))
      );
    }
    
    const getSortTitle = (title: string) => {
      let lower = title.toLowerCase().trim();
      let prev = '';
      while (lower !== prev) {
        prev = lower;
        lower = lower.replace(/^[^\w\s]+/, '').trim();
        lower = lower.replace(/^(a|an|the)\s+/i, '').trim();
      }
      return lower;
    };
    
    apps.sort((a, b) => getSortTitle(a.cardInfo.title).localeCompare(getSortTitle(b.cardInfo.title)));
      
    return apps;
  }, [searchTerm, selectedCategories, selectedSources]);
    
  const slugify = (text: string) => text.toLowerCase().replace(/[\s/.:]+/g, '-').replace(/-$/, '');

  return (
    <>
      <header>
        <h1>Vibe Coded App Showcase</h1>
        <p>An interactive collection of creative apps.</p>
      </header>

      <div className="search-container" role="search" style={{ marginBottom: '1.5rem' }}>
        <input
          id="search-input"
          type="search"
          placeholder="Search by app or author..."
          aria-label="Search for apps by description or author"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="category-filters" role="tablist" aria-label="Filter by source" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleAllToggle}
          title={isAllSelected ? "Clear all sources" : "Select all sources"}
          aria-label={isAllSelected ? "Clear all sources" : "Select all sources"}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            padding: '0',
            borderRadius: '50%',
            border: `2px solid ${isAllSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
            background: isAllSelected ? 'var(--accent-color)' : 'transparent',
            color: isAllSelected ? '#fff' : 'var(--text-color)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isAllSelected ? <ClearIcon /> : <CheckAllIcon />}
        </button>
        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }}></div>
        {(['DeepMind', 'Develop 2026'] as const).map(source => (
          <button
            key={source}
            role="tab"
            className={`category-filter category-filter--tag ${selectedSources.includes(source) ? `active category-tag--${slugify(source)}` : ''}`}
            onClick={() => handleSourceToggle(source)}
            aria-selected={selectedSources.includes(source)}
            data-category={slugify(source)}
          >
            {source}
          </button>
        ))}
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

      <div className="category-filters" role="toolbar" aria-label="Filter by category" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button
          onClick={handleAllCategoriesToggle}
          title={isAllCategoriesSelected ? "Clear all categories" : "Select all categories"}
          aria-label={isAllCategoriesSelected ? "Clear all categories" : "Select all categories"}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            padding: '0',
            borderRadius: '50%',
            border: `2px solid ${isAllCategoriesSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
            background: isAllCategoriesSelected ? 'var(--accent-color)' : 'transparent',
            color: isAllCategoriesSelected ? '#fff' : 'var(--text-color)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isAllCategoriesSelected ? <ClearIcon /> : <CheckAllIcon />}
        </button>
        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }}></div>
        {ALL_CATEGORIES.map(category => (
          <button
            key={category}
            className={`category-filter category-filter--tag ${selectedCategories.includes(category) ? `active category-tag--${slugify(category)}` : ''}`}
            onClick={() => handleCategoryToggle(category)}
            aria-pressed={selectedCategories.includes(category)}
            data-category={slugify(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredApps.length > 0 ? (
        <div className="card-grid">
          {filteredApps.map(app => (
            <Card key={app.id} {...app} />
          ))}
        </div>
      ) : (
        <div className="no-results">
            <p>No apps found matching your search.</p>
        </div>
      )}
    </>
  );
};

export default ShowcasePage;