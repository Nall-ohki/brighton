import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const CodeRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~'.split('');
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];
    for (let x = 0; x < columns; x++) drops[x] = 1;

    let animationFrameId: number;
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975)
          drops[i] = 0;
        drops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener('resize', resizeCanvas);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute', top: 0, left: 0, zIndex: -1, opacity: 0.3 }} />;
};

type UIComponent = {
  id: string;
  type: 'button' | 'input' | 'header' | 'text' | 'chart' | 'card';
  isBroken: boolean;
};

const App = () => {
  const [messages, setMessages] = useState<{sender: 'user' | 'ai', text: string}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [components, setComponents] = useState<UIComponent[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: inputValue }];
    setMessages(newMessages as any);

    const specificKeywords = ['color', 'red', 'blue', 'green', 'flex', 'grid', 'shadow', 'radius', 'margin', 'padding', 'dark', 'light', 'submit', 'login', 'dashboard', 'chart', 'bar', 'line', 'header', 'footer', 'sidebar', 'rounded', 'centered', 'animated', 'responsive', 'specific', 'clean', 'beautiful'];
    const lowerInput = inputValue.toLowerCase();
    
    let isSpecific = false;
    let keywordCount = 0;
    specificKeywords.forEach(kw => {
      if (lowerInput.includes(kw)) keywordCount++;
    });

    if (keywordCount >= 2 || inputValue.length > 50) {
      isSpecific = true;
    }

    let type: UIComponent['type'] = 'text';
    if (lowerInput.includes('button') || lowerInput.includes('submit')) type = 'button';
    else if (lowerInput.includes('input') || lowerInput.includes('form') || lowerInput.includes('field') || lowerInput.includes('search')) type = 'input';
    else if (lowerInput.includes('header') || lowerInput.includes('title') || lowerInput.includes('nav')) type = 'header';
    else if (lowerInput.includes('chart') || lowerInput.includes('graph') || lowerInput.includes('stats')) type = 'chart';
    else if (lowerInput.includes('card') || lowerInput.includes('container') || lowerInput.includes('profile')) type = 'card';

    const newComponent: UIComponent = {
      id: Math.random().toString(36).substring(7),
      type,
      isBroken: !isSpecific,
    };

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: isSpecific ? `Generating precise ${type} component... Specifications verified. Deployed successfully.` : `Instructions unclear. Missing specificity. Attempting to hallucinate a ${type} component... Result may be unstable.`
      }]);
      setComponents(prev => [...prev, newComponent]);
    }, 600);

    setInputValue('');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="app-container">
      <CodeRain />
      
      <div className="top-bar glass">
        <div className="title-section">
          <h1>VibeCoder 9000</h1>
          <span className="subtitle">60-Min GenAI App Challenge Simulator</span>
        </div>
        <div className={`timer ${timeLeft < 300 ? 'danger' : ''}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="main-content">
        <div className="chat-panel glass">
          <div className="chat-history">
            {messages.length === 0 && (
              <div className="empty-chat">
                <p>Start prompting to build your app!</p>
                <p className="hint">Hint: Vague prompts like "make a button" create broken components. Be specific!</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.sender}`}>
                {m.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-area">
            <input 
              type="text" 
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="e.g. 'Add a blue submit button with rounded corners...'"
            />
            <button onClick={handleSend} className="send-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>

        <div className="preview-panel glass">
          <div className="phone-wireframe">
            <div className="notch"></div>
            <div className="screen">
              {components.map(comp => (
                <div key={comp.id} className={`ui-component ${comp.type} ${comp.isBroken ? 'broken' : 'clean'}`}>
                  {comp.type === 'button' && <button>{comp.isBroken ? 'C|ic|< M!' : 'Click Me'}</button>}
                  {comp.type === 'input' && <input type="text" placeholder={comp.isBroken ? '1nP|_|T...' : 'Enter text...'} disabled={comp.isBroken} />}
                  {comp.type === 'header' && <h2>{comp.isBroken ? 'H3AD3R 404' : 'Welcome Header'}</h2>}
                  {comp.type === 'text' && <p>{comp.isBroken ? 'lorem ipsuuuuummmm glitch glitch err' : 'Clean readable text block.'}</p>}
                  {comp.type === 'chart' && (
                    <div className="mock-chart">
                      <div className="bar" style={{height: comp.isBroken ? '120%' : '60%'}}></div>
                      <div className="bar" style={{height: comp.isBroken ? '-20%' : '80%'}}></div>
                      <div className="bar" style={{height: comp.isBroken ? '300px' : '40%'}}></div>
                    </div>
                  )}
                  {comp.type === 'card' && (
                    <div className="mock-card">
                      <div className="avatar"></div>
                      <div className="lines">
                        <div className="line"></div>
                        <div className="line short"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
