import re

with open("prompt_builder.tsx", "r") as f:
    content = f.read()

# 1. Move "App type" to below "Describe your core idea"
# The App type block is:
app_type_block = """          <div className="form-group">
            <label>What kind of app do you want to create?</label>
            <div className="radio-group-container">
                {(['Tool', 'Simulation', 'Game', 'Other'] as AppType[]).map(type => (
                    <div key={type} className="radio-option">
                        <input
                            type="radio"
                            id={`app-type-${type}`}
                            name="app-type"
                            value={type}
                            checked={appType === type}
                            onChange={e => setAppType(e.target.value as AppType)}
                        />
                        <label
                            htmlFor={`app-type-${type}`}
                            data-category={slugify(type)}
                        >
                            {type}
                        </label>
                    </div>
                ))}
            </div>
          </div>
"""

describe_idea_block = """          <div className="form-group">
            <div className="form-group-header">
                <label htmlFor="app-idea">Describe your core idea</label>
                <button className="btn lucky-btn" onClick={handleFeelingLucky}>
                    I'm feeling lucky ✨
                </button>
            </div>
            <textarea
              id="app-idea"
              value={idea}
              onChange={e => setIdea(e.target.value)}
              placeholder="e.g., A visualization of real-time weather data as abstract art."
            ></textarea>
          </div>
"""

target_env_block = """           <div className="form-group">
            <label>Target Environment</label>
            <div className="radio-group-container">
                {(['Gemini Canvas', 'AI Studio'] as Target[]).map(t => (
                     <div key={t} className="radio-option">
                        <input
                            type="radio"
                            id={`target-${t.replace(/\s+/g, '-')}`}
                            name="target-env"
                            value={t}
                            checked={target === t}
                            onChange={e => setTarget(e.target.value as Target)}
                        />
                        <label htmlFor={`target-${t.replace(/\s+/g, '-')}`}>{t}</label>
                    </div>
                ))}
            </div>
          </div>
"""

# Remove blocks
content = content.replace(app_type_block, "")
content = content.replace(describe_idea_block, "")
content = content.replace(target_env_block, "")

# Insert Describe Idea and then App Type before Technical Modifiers
tech_modifiers_start = """          <div className="form-group">
            <label>Technical Modifiers (Recommended based on App Type)</label>"""

content = content.replace(tech_modifiers_start, describe_idea_block + app_type_block + tech_modifiers_start)

# Insert Target Environment in the right column, above the prompt, with no title.
# It should look like:
new_target_env_block = """          <div className="radio-group-container" style={{ marginBottom: '1rem' }}>
              {(['Gemini Canvas', 'AI Studio'] as Target[]).map(t => (
                   <div key={t} className="radio-option">
                      <input
                          type="radio"
                          id={`target-${t.replace(/\s+/g, '-')}`}
                          name="target-env"
                          value={t}
                          checked={target === t}
                          onChange={e => setTarget(e.target.value as Target)}
                      />
                      <label htmlFor={`target-${t.replace(/\s+/g, '-')}`}>{t}</label>
                  </div>
              ))}
          </div>
"""

synthesized_prompt_start = """        <div className="prompt-panel">
          <h2>Synthesized Prompt</h2>
"""

content = content.replace(synthesized_prompt_start, synthesized_prompt_start + new_target_env_block)

with open("prompt_builder.tsx", "w") as f:
    f.write(content)
