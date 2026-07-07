import React, { useState, useMemo } from 'react';
import { ShowcaseApp, appData } from './data';

const Card = ({ category, description, author, url, id }: ShowcaseApp) => (
  <article className="card" aria-labelledby={`card-heading-${id}`}>
     <div className="card-header">
      <span className={`category-tag category-tag--${category.toLowerCase().replace(/\s+/g, '-')}`}>{category}</span>
    </div>
    <div className="card-content">
      <h2 id={`card-heading-${id}`}>{description}</h2>
      <p>by {author}</p>
    </div>
    <footer className="card-footer">
      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`View the app: ${description}`}>
        View App
      </a>
    </footer>
  </article>
);

const ShowcasePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => ['All', ...Array.from(new Set(appData.map(app => app.category)))], []);

  const filteredApps = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    
    let apps = appData;

    if (selectedCategory !== 'All') {
      apps = apps.filter(app => app.category === selectedCategory);
    }
    
    if (lowercasedFilter) {
      apps = apps.filter(app => 
        app.description.toLowerCase().includes(lowercasedFilter) ||
        app.author.toLowerCase().includes(lowercasedFilter)
      );
    }
      
    return apps;
  }, [searchTerm, selectedCategory]);
    
  const slugify = (text: string) => text.toLowerCase().replace(/[\s/.]+/g, '-').replace(/-$/, '');

  return (
    <>
      <header>
        <h1>Vibe Coded App Showcase</h1>
        <p>An interactive collection of creative apps.</p>
      </header>
      
      <div className="search-container" role="search">
        <input
          id="search-input"
          type="search"
          placeholder="Search by app or author..."
          aria-label="Search for apps by description or author"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="category-filters" role="toolbar" aria-label="Filter by category">
        {categories.map(category => (
          <button
            key={category}
            className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
            aria-pressed={selectedCategory === category}
            data-category={category === 'All' ? '' : slugify(category)}
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