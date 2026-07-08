import React, { useState, useMemo } from 'react';
import { Resource, resources } from './data';

const ResourceCard = ({ resource }: { resource: Resource }) => {
  const categoryClass = resource.category.toLowerCase().replace(/[\s/.]+/g, '-').replace(/-$/, '');
  const hasRecommendations = resource.worksWellWithLLM || resource.canvasRecommended || resource.aiStudioRecommended;

  return (
    <article className="card resource-card" aria-labelledby={`res-card-heading-${resource.id}`}>
      <div className="card-header">
        <span className={`category-tag category-tag--${categoryClass}`}>{resource.category}</span>
      </div>
      <div className="card-content">
        <h2 id={`res-card-heading-${resource.id}`}>{resource.tool}</h2>
        <p className="use-case">{resource.useCase}</p>
        <div className="insight">
          <span className="insight-label">Key Insight</span>
          <p>{resource.insight}</p>
        </div>
      </div>
      {hasRecommendations && (
        <footer className="card-footer resource-recommendations">
            {resource.worksWellWithLLM && <span className="recommendation-tag">LLM</span>}
            {resource.canvasRecommended && <span className="recommendation-tag">Gemini Canvas</span>}
            {resource.aiStudioRecommended && <span className="recommendation-tag">AI Studio</span>}
        </footer>
      )}
    </article>
  );
};

type RecoFilters = {
    llm: boolean;
    canvas: boolean;
    aiStudio: boolean;
}

const ResourcesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recoFilters, setRecoFilters] = useState<RecoFilters>({
    llm: false,
    canvas: false,
    aiStudio: false,
  });

  const categories = useMemo(() => {
    const uniqueCategories = new Set(resources.map(res => res.category));
    return ['All', ...Array.from(uniqueCategories)];
  }, []);

  const filteredResources = useMemo(() => {
    let tempResources = resources;

    if (selectedCategory !== 'All') {
        tempResources = tempResources.filter(res => res.category === selectedCategory);
    }
    
    if (recoFilters.llm) {
        tempResources = tempResources.filter(res => res.worksWellWithLLM);
    }
    if (recoFilters.canvas) {
        tempResources = tempResources.filter(res => res.canvasRecommended);
    }
    if (recoFilters.aiStudio) {
        tempResources = tempResources.filter(res => res.aiStudioRecommended);
    }

    return tempResources;
  }, [selectedCategory, recoFilters]);

  const handleRecoFilterToggle = (filterName: keyof RecoFilters) => {
      setRecoFilters(prev => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const slugify = (text: string) => text.toLowerCase().replace(/[\s/.]+/g, '-').replace(/-$/, '');

  return (
    <>
<div className="filter-controls">
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
        <div className="recommendation-filters" role="group" aria-labelledby="recommendation-filter-label">
            <span id="recommendation-filter-label" style={{'fontWeight': '500', 'color': 'var(--text-secondary)'}}>Recommended for:</span>
            
            <button
                className={`category-filter ${recoFilters.llm ? 'active' : ''}`}
                onClick={() => handleRecoFilterToggle('llm')}
                aria-pressed={recoFilters.llm}
            >
                LLM
            </button>
            <button
                className={`category-filter gemini-canvas-button ${recoFilters.canvas ? 'active' : ''}`}
                onClick={() => handleRecoFilterToggle('canvas')}
                aria-pressed={recoFilters.canvas}
            >
                Gemini Canvas
            </button>
            <button
                className={`category-filter ${recoFilters.aiStudio ? 'active' : ''}`}
                onClick={() => handleRecoFilterToggle('aiStudio')}
                aria-pressed={recoFilters.aiStudio}
            >
                AI Studio
            </button>
        </div>
      </div>


      {filteredResources.length > 0 ? (
        <div className="card-grid">
          {filteredResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="no-results">
            <p>No resources found matching the selected filters.</p>
        </div>
      )}
    </>
  );
};

export default ResourcesPage;