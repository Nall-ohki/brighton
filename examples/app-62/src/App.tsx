import React, { useState } from 'react';
import './App.css';

const LOCATIONS = [
  { id: 'l1', name: "The bus stop opposite the abandoned Blockbuster", specificity: 5 },
  { id: 'l2', name: "The 24hr laundrette smelling of damp dog", specificity: 5 },
  { id: 'l3', name: "The chip shop that only opens on Thursdays", specificity: 5 },
  { id: 'l4', name: "The alley behind the vegan butcher", specificity: 4 },
  { id: 'l5', name: "A generic park bench", specificity: 1 },
  { id: 'l6', name: "A dark alleyway", specificity: 1 },
];

const CHARACTERS_1 = [
  { id: 'c1_1', name: "The guy who feeds pigeons but yells at them", specificity: 5, action: "throwing stale bread aggressively" },
  { id: 'c1_2', name: "Dave from the pub who always has a scheme", specificity: 5, action: "whispering about a lucrative tupperware deal" },
  { id: 'c1_3', name: "The elderly woman buying enormous amounts of cat food", specificity: 4, action: "rattling a tin of tuna" },
  { id: 'c1_4', name: "The teenager with one airpod and an attitude", specificity: 3, action: "sighing louder than a jet engine" },
  { id: 'c1_5', name: "A mysterious stranger", specificity: 1, action: "looking mysterious" },
  { id: 'c1_6', name: "A brave hero", specificity: 1, action: "standing heroically" },
];

const CHARACTERS_2 = [
  { id: 'c2_1', name: "The kid practicing kickflips on a cracked pavement", specificity: 5, reaction: "almost bailed into a bin" },
  { id: 'c2_2', name: "The person who always wears shorts in December", specificity: 5, reaction: "shivered but pretended not to" },
  { id: 'c2_3', name: "A local politician pretending to be relatable", specificity: 4, reaction: "offered an awkward thumbs-up" },
  { id: 'c2_4', name: "A distressed office worker who missed the last train", specificity: 3, reaction: "started crying into a briefcase" },
  { id: 'c2_5', name: "A damsel in distress", specificity: 1, reaction: "waited to be saved" },
  { id: 'c2_6', name: "A wise old mentor", specificity: 1, reaction: "stroked a generic beard" },
];

const CHARACTERS_3 = [
  { id: 'c3_1', name: "The fox that knows exactly what you did", specificity: 5, twist: "judging everyone with its piercing, knowing eyes" },
  { id: 'c3_2', name: "A pigeon missing three toes", specificity: 5, twist: "demanding chips as tribute" },
  { id: 'c3_3', name: "A dog walker with five tangled leashes", specificity: 4, twist: "tripping over a corgi and collapsing" },
  { id: 'c3_4', name: "The ghost of a Victorian chimney sweep", specificity: 3, twist: "asking for a penny in a spooky accent" },
  { id: 'c3_5', name: "A generic evil minion", specificity: 1, twist: "laughing evilly for no reason" },
  { id: 'c3_6', name: "A faceless corporation stooge", specificity: 1, twist: "handing out cease-and-desist letters" },
];

export default function App() {
  const [step, setStep] = useState<'build' | 'story1' | 'story2'>('build');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [char1, setChar1] = useState(CHARACTERS_1[0]);
  const [char2, setChar2] = useState(CHARACTERS_2[0]);
  const [char3, setChar3] = useState(CHARACTERS_3[0]);

  const totalSpecificity = location.specificity + char1.specificity + char2.specificity + char3.specificity;
  const maxSpecificity = 20;

  const handleGenerate = () => {
    setStep('story1');
  };

  const getScoreMessage = () => {
    if (totalSpecificity >= 18) return "Hyper-Local Legend!";
    if (totalSpecificity >= 12) return "Quirky but grounded.";
    if (totalSpecificity >= 8) return "A bit generic, honestly.";
    return "Are you even trying to be specific?";
  };

  return (
    <div className="zine-container">
      <div className="texture-overlay"></div>
      
      {step === 'build' && (
        <div className="page builder-page">
          <header className="header block-pink">
            <h1>Local Lore Generator</h1>
            <p>Build your hyper-specific narrative.</p>
          </header>

          <div className="form-section">
            <div className="form-group block-teal offset-bg">
              <label>Pick a Setting</label>
              <select value={location.id} onChange={(e) => setLocation(LOCATIONS.find(l => l.id === e.target.value)!)}>
                {LOCATIONS.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
            </div>

            <div className="form-group block-yellow offset-bg">
              <label>Protagonist (Sort of)</label>
              <select value={char1.id} onChange={(e) => setChar1(CHARACTERS_1.find(c => c.id === e.target.value)!)}>
                {CHARACTERS_1.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group block-pink offset-bg">
              <label>Innocent Bystander</label>
              <select value={char2.id} onChange={(e) => setChar2(CHARACTERS_2.find(c => c.id === e.target.value)!)}>
                {CHARACTERS_2.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group block-teal offset-bg">
              <label>The Wildcard</label>
              <select value={char3.id} onChange={(e) => setChar3(CHARACTERS_3.find(c => c.id === e.target.value)!)}>
                {CHARACTERS_3.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <button className="riso-button" onClick={handleGenerate}>
            Print Zine!
          </button>
        </div>
      )}

      {step === 'story1' && (
        <div className="page story-page">
          <div className="story-panel block-teal">
            <div className="panel-content block-white">
              <h2>Part I: The Setup</h2>
              <p>
                It was a bleak Tuesday evening at <strong>{location.name.toLowerCase()}</strong>. 
                The air was thick with tension and the smell of impending rain.
              </p>
              <p>
                <strong>{char1.name}</strong> was already there, {char1.action}, acting like they owned the place.
              </p>
              <p>
                Then, stumbling into the scene came <strong>{char2.name}</strong>. They took one look at the situation and {char2.reaction}. It was classic local drama.
              </p>
              <button className="riso-button next-btn" onClick={() => setStep('story2')}>Next Page &rarr;</button>
            </div>
          </div>
        </div>
      )}

      {step === 'story2' && (
        <div className="page story-page">
          <div className="story-panel block-pink">
            <div className="panel-content block-white">
              <h2>Part II: The Climax</h2>
              <p>
                Just as things were about to escalate, the atmosphere shifted. From the shadows emerged <strong>{char3.name}</strong>.
              </p>
              <p>
                Everyone froze. You could hear a pin drop. The newcomer didn't say a word, just started {char3.twist}.
              </p>
              <p>
                And just like that, the moment passed. Everyone went back to their lives, pretending it never happened. Because that's what you do at {location.name.toLowerCase()}.
              </p>
              
              <div className="score-board block-yellow">
                <h3>Specificity Score</h3>
                <div className="score-value">{totalSpecificity} / {maxSpecificity}</div>
                <div className="score-message">{getScoreMessage()}</div>
              </div>

              <button className="riso-button reset-btn" onClick={() => setStep('build')}>&larr; Make Another</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
