
import { AppType } from './prompt_builder';

export interface ShowcaseAppConstructorParams {
  category: string;
  description: string;
  author: string;
  url: string;
  index: number;
}

export class ShowcaseApp {
  id: string;
  category: string;
  description: string;
  author: string;
  url: string;

  constructor({ category, description, author, url, index }: ShowcaseAppConstructorParams) {
    this.id = `app-${index}`;
    this.category = category;
    this.description = description;
    this.author = author;
    this.url = url;
  }
}

export const appData: ShowcaseApp[] = [
  new ShowcaseApp({
    category: 'Tool',
    description: 'A simple darts checkout calculator.',
    author: 'Dave Lacey',
    url: 'https://g.co/gemini/share/08d646a8c607',
    index: 0,
  }),
  new ShowcaseApp({
    category: 'Creative',
    description: 'A tool that turns letters into shapes.',
    author: 'Fleur Isbell',
    url: 'https://g.co/gemini/share/1a9b25fad5d5',
    index: 1,
  }),
  new ShowcaseApp({
    category: 'Creative',
    description: "A visual timeline of the author's conversation with Gemini Canvas to create the timeline itself.",
    author: 'Shane Roberts',
    url: 'https://g.co/gemini/share/1c0e3ba93f55',
    index: 2,
  }),
  new ShowcaseApp({
    category: 'Educational',
    description: 'A remix of the "Gemini writing" app to let the user practice their penmanship alongside Gemini.',
    author: 'Dave Messer',
    url: 'https://g.co/gemini/share/2546bb8b5667',
    index: 3,
  }),
  new ShowcaseApp({
    category: 'Simulation',
    description: 'A musical physics simulator using tone.js and matter.js.',
    author: 'Alex Chen',
    url: 'https://g.co/gemini/share/292d1d7b861e',
    index: 4,
  }),
  new ShowcaseApp({
    category: 'Creative',
    description: 'Kittens fix my tiles',
    author: 'Amit Pitaru',
    url: 'https://g.co/gemini/share/2bac3b1ae0c3',
    index: 5,
  }),
  new ShowcaseApp({
    category: 'Game',
    description: 'A skeletal multiplayer 2d dungeon game using Firestore.',
    author: 'Andrew Bolt',
    url: 'https://g.co/gemini/share/34d9355aacc3',
    index: 6,
  }),
  new ShowcaseApp({
    category: 'Educational',
    description: "An interactive 'line learning tool' for drama students, created from the script of Macbeth.",
    author: 'Zebedee Pedersen',
    url: 'https://g.co/gemini/share/451d2b1deab1',
    index: 7,
  }),
  new ShowcaseApp({
    category: 'Educational',
    description: '"Roast my essay" - a tool for getting fun feedback on papers for students.',
    author: 'Dave Messer',
    url: 'https://g.co/gemini/share/4a0f0a4376fc',
    index: 8,
  }),
  new ShowcaseApp({
    category: 'Educational',
    description: 'A multiplication practice app for a Year 4 student.',
    author: 'JK Kearns',
    url: 'https://g.co/gemini/share/4f91f7a75fca',
    index: 9,
  }),
  new ShowcaseApp({
    category: 'Tool',
    description: 'An app that creates 1 prompt and 1 image and then uses the analysis of the image to try to improve a "vibey" score to get the best image possible on its own.',
    author: 'Anna Bortsova',
    url: 'https://g.co/gemini/share/57efcc3c9670',
    index: 10,
  }),
  new ShowcaseApp({
    category: 'Tool',
    description: 'A "Fluid Writing" app that uses your voice to write with custom styles that translate for you.',
    author: 'Dave Messer',
    url: 'https://g.co/gemini/share/64564cc31b42',
    index: 11,
  }),
  new ShowcaseApp({
    category: 'Creative',
    description: 'A creative sketch where Gemini writes its own name using lines and dots.',
    author: 'Alex Chen',
    url: 'https://g.co/gemini/share/6caab4b03b4d',
    index: 12,
  }),
  new ShowcaseApp({
    category: 'Informational',
    description: 'A map of "The White Lotus" filming locations using OpenStreetMaps.',
    author: 'Alex Chen',
    url: 'https://g.co/gemini/share/864287b1b70c',
    index: 13,
  }),
  new ShowcaseApp({
    category: 'Creative',
    description: "See cities' weather presented in different artist styles.",
    author: 'Fleur Isbell',
    url: 'https://g.co/gemini/share/89df67dd6116',
    index: 14,
  }),
  new ShowcaseApp({
    category: 'Creative',
    description: 'A spinoff of the svg 3d generator where you can create 3d text and textures.',
    author: 'Fleur Isbell',
    url: 'https://g.co/gemini/share/9358874415c7',
    index: 15,
  }),
  new ShowcaseApp({
    category: 'Creative',
    description: 'A multiplayer pixel-art canvas.',
    author: 'Andrew Bolt',
    url: 'https://g.co/gemini/share/945a2cd87200',
    index: 16,
  }),
  new ShowcaseApp({
    category: 'Educational',
    description: 'A time-teaching app for kids.',
    author: 'Barbara Wang',
    url: 'https://g.co/gemini/share/94e7cb62ee33',
    index: 17,
  }),
  new ShowcaseApp({
    category: 'Creative',
    description: 'A tool that turns coordinates into shapes.',
    author: 'Fleur Isbell',
    url: 'https://g.co/gemini/share/a936165fbdb1',
    index: 18,
  }),
  new ShowcaseApp({
    category: 'Game',
    description: 'A version of the game "Pocket Tanks".',
    author: 'Ahmed Omran',
    url: 'https://g.co/gemini/share/aac1d1d5a747',
    index: 19,
  }),
  new ShowcaseApp({
    category: 'Tool',
    description: 'A terrain texture maker to help 3d modelers and game developers.',
    author: 'Fleur Isbell',
    url: 'https://g.co/gemini/share/aff69ebe8000',
    index: 20,
  }),
  new ShowcaseApp({
    category: 'Creative',
    description: 'Use your keyboard to create musical compositions inspired by the earth.',
    author: 'Fleur Isbell',
    url: 'https://g.co/gemini/share/b1bfa7aa2cf8',
    index: 21,
  }),
  new ShowcaseApp({
    category: 'Tool',
    description: 'Starter code template with points writing the word "Gemini."',
    author: 'Alex Chen',
    url: 'https://g.co/gemini/share/b736356f5896',
    index: 22,
  }),
  new ShowcaseApp({
    category: 'Creative',
    description: 'An IO momento badge maker.',
    author: 'Dennis Hsu',
    url: 'https://g.co/gemini/share/be8d94f4a65a',
    index: 23,
  }),
  new ShowcaseApp({
    category: 'Creative',
    description: 'A tool that generates textures applying them to extruded shapes and surrounding space.',
    author: 'Fleur Isbell',
    url: 'https://g.co/gemini/share/be97504f98d2',
    index: 24,
  }),
  new ShowcaseApp({
    category: 'UI Creation',
    description: 'Restaurant app key screen creation (Can then be used as the reference screens when coding for native apps).',
    author: 'Charlene Sirianni',
    url: 'https://g.co/gemini/share/d445a3648680',
    index: 25,
  }),
  new ShowcaseApp({
    category: 'Creative',
    description: 'Gemini using search and code to announce its own launch in 3D at I/O.',
    author: 'Lukas Haas',
    url: 'https://g.co/gemini/share/d65439300f54',
    index: 26,
  }),
  new ShowcaseApp({
    category: 'Tool',
    description: 'A "Cartographer" app that draws custom maps with custom styles.',
    author: 'Dave Messer',
    url: 'https://g.co/gemini/share/d70827854eb5',
    index: 27,
  }),
  new ShowcaseApp({
    category: 'Tool',
    description: 'A custom white noise generator.',
    author: 'Zebedee Pedersen',
    url: 'https://g.co/gemini/share/d94f2419d8b9',
    index: 28,
  }),
  new ShowcaseApp({
    category: 'Educational',
    description: 'A Mandelbrot set explorer that visualizes the iteration path and finds attractors.',
    author: 'Andrew Bolt',
    url: 'https://g.co/gemini/share/dc8009fdce80',
    index: 29,
  }),
  new ShowcaseApp({
    category: 'Game',
    description: 'A retro sliding tile puzzle, built for mobile.',
    author: 'Amit Pitaru',
    url: 'https://g.co/gemini/share/de9339aa730f',
    index: 30,
  }),
  new ShowcaseApp({
    category: 'Tool',
    description: 'A live countdown timer.',
    author: 'Alex Chen',
    url: 'https://g.co/gemini/share/e2d958072ecc',
    index: 31,
  }),
  new ShowcaseApp({
    category: 'Creative',
    description: 'A gradient music maker.',
    author: 'Fleur Isbell',
    url: 'https://g.co/gemini/share/e47754e761f8',
    index: 32,
  }),
  new ShowcaseApp({
    category: 'Tool',
    description: 'A minimal example of using Firestore for shared state, a Web 2.1 Server-Side Blink Tag.',
    author: 'Andrew Bolt',
    url: 'https://g.co/gemini/share/e969e390b78a',
    index: 33,
  }),
  new ShowcaseApp({
    category: 'Creative',
    description: 'A virtual pet named Davie.',
    author: 'Amit Pitaru',
    url: 'https://g.co/gemini/share/eba3f2bc2c79',
    index: 34,
  }),
];


export interface ResourceConstructorParams {
  category: string;
  tool: string;
  useCase: string;
  worksWellWithLLM: boolean;
  insight: string;
  canvasRecommended: boolean;
  aiStudioRecommended: boolean;
}

export class Resource {
  id: string;
  category: string;
  tool: string;
  useCase: string;
  worksWellWithLLM: boolean;
  insight: string;
  canvasRecommended: boolean;
  aiStudioRecommended: boolean;

  constructor({
    category,
    tool,
    useCase,
    worksWellWithLLM,
    insight,
    canvasRecommended,
    aiStudioRecommended
  }: ResourceConstructorParams) {
    this.id = tool.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    this.category = category;
    this.tool = tool;
    this.useCase = useCase;
    this.worksWellWithLLM = worksWellWithLLM;
    this.insight = insight;
    this.canvasRecommended = canvasRecommended;
    this.aiStudioRecommended = aiStudioRecommended;
  }
}

export const resources: Resource[] = [
  new Resource({
    category: '2D',
    tool: 'p5.js',
    useCase: 'Accessible creative coding, generative art, and simple interactive sketches.',
    worksWellWithLLM: true,
    insight: 'The undisputed starting point for 2D generative art. Its simple API and vast examples make it perfect for LLM generation.',
    canvasRecommended: true,
    aiStudioRecommended: true
  }),
  new Resource({
    category: '2D',
    tool: 'PixiJS',
    useCase: 'High-performance browser-based games and graphics-intensive projects.',
    worksWellWithLLM: false,
    insight: 'The performance king. Choose when raw 2D rendering speed is the top priority. Requires more detailed LLM prompts.',
    canvasRecommended: false,
    aiStudioRecommended: false
  }),
  new Resource({
    category: '2D',
    tool: 'Two.js',
    useCase: 'Animating vector graphics, especially for a clean, motion-graphics aesthetic.',
    worksWellWithLLM: false,
    insight: 'Ideal for animating imported SVG assets. Its concise API is a great target for LLMs.',
    canvasRecommended: false,
    aiStudioRecommended: true
  }),
  new Resource({
    category: '2D',
    tool: 'Konva.js',
    useCase: 'High-performance, interactive 2D graphics with a nested object model and layering.',
    worksWellWithLLM: false,
    insight: 'Strong alternative to Two.js for developers who prefer its specific scene graph API style for desktop and mobile apps.',
    canvasRecommended: false,
    aiStudioRecommended: false
  }),
  new Resource({
    category: '2D',
    tool: 'Paper.js',
    useCase: 'Vector graphics scripting with a strong focus on vector math and path manipulation.',
    worksWellWithLLM: false,
    insight: 'Excellent for intricate geometric art and complex path manipulation, conceptually similar to Illustrator\'s scripting tools.',
    canvasRecommended: false,
    aiStudioRecommended: false
  }),
  new Resource({
    category: '2D',
    tool: 'ZIM.js',
    useCase: 'Rapidly building complete, complex, and interactive canvas applications.',
    worksWellWithLLM: false,
    insight: 'Offers unparalleled velocity for creating feature-complete prototypes with its highly-abstracted, chained syntax.',
    canvasRecommended: false,
    aiStudioRecommended: true
  }),
  new Resource({
    category: '2D',
    tool: 'Phaser',
    useCase: 'Building complete 2D games with physics, input handling, tilemaps, and asset management.',
    worksWellWithLLM: false,
    insight: 'The go-to choice for creating apps with game-like mechanics. More comprehensive than a pure renderer like PixiJS.',
    canvasRecommended: true,
    aiStudioRecommended: true
  }),
  new Resource({
    category: '2D',
    tool: 'HTML Canvas',
    useCase: 'Low-level 2D drawing for maximum control and custom renderers.',
    worksWellWithLLM: true,
    insight: 'The foundational browser API. Extremely powerful but verbose. Libraries like p5.js abstract its complexity. Use directly only when building a custom rendering engine from scratch.',
    canvasRecommended: false,
    aiStudioRecommended: false
  }),
  new Resource({
    category: '3D',
    tool: 'Three.js',
    useCase: 'Flexible 3D rendering; creating beautiful, self-contained 3D visuals and artistic effects.',
    worksWellWithLLM: true,
    insight: 'A powerful "toolbox." Best for visuals but requires integrating third-party libraries for physics or complex GUIs.',
    canvasRecommended: true,
    aiStudioRecommended: true
  }),
  new Resource({
    category: '3D',
    tool: 'Babylon.js',
    useCase: 'Building complete, interactive 3D applications and games from the ground up.',
    worksWellWithLLM: true,
    insight: 'Recommended for full apps. Its "batteries-included" nature (integrated physics, GUI) is superior for LLM-driven development.',
    canvasRecommended: false,
    aiStudioRecommended: true
  }),
  new Resource({
    category: '3D',
    tool: 'A-Frame',
    useCase: 'Building web-based virtual reality (VR) experiences with a declarative HTML-based syntax.',
    worksWellWithLLM: true,
    insight: 'The fastest path from idea to a working VR prototype. It abstracts Three.js into simple, easy-to-generate HTML tags.',
    canvasRecommended: false,
    aiStudioRecommended: true
  }),
  new Resource({
    category: '3D',
    tool: 'PlayCanvas',
    useCase: 'Building 3D games and interactive experiences with a browser-based collaborative editor.',
    worksWellWithLLM: false,
    insight: 'A direct "batteries-included" competitor to Babylon.js, especially strong for teams or those who prefer a visual workflow.',
    canvasRecommended: false,
    aiStudioRecommended: false
  }),
  new Resource({
    category: '3D',
    tool: 'Native WebGL',
    useCase: 'Low-level 3D graphics rendering; direct GPU access for custom engines.',
    worksWellWithLLM: true,
    insight: 'The low-level API for 3D graphics. Incredibly powerful but immensely complex. Libraries like Three.js and Babylon.js are essential abstractions. Never use directly for application development.',
    canvasRecommended: false,
    aiStudioRecommended: false
  }),
  new Resource({
    category: 'Audio',
    tool: 'Howler.js',
    useCase: 'Adding rich, layered, and interactive audio with a simple and reliable API.',
    worksWellWithLLM: true,
    insight: 'The default choice for any app needing audio playback. It abstracts away the complex Web Audio API.',
    canvasRecommended: true,
    aiStudioRecommended: true
  }),
  new Resource({
    category: 'Audio',
    tool: 'Tone.js',
    useCase: 'Creating interactive music, synthesizers, and complex audio scheduling in the browser.',
    worksWellWithLLM: false,
    insight: 'Essential for generative music or building digital instruments. Complements Howler.js, which is for sample playback.',
    canvasRecommended: false,
    aiStudioRecommended: false
  }),
  new Resource({
    category: 'Audio',
    tool: 'Pizzicato.js',
    useCase: 'Simplifying the application of audio effects like reverb, delay, and distortion.',
    worksWellWithLLM: false,
    insight: 'A focused library. Use when the primary audio need is applying effects, rather than complex playback or synthesis.',
    canvasRecommended: false,
    aiStudioRecommended: false
  }),
  new Resource({
    category: 'Physics',
    tool: 'Matter.js',
    useCase: 'Adding a 2D rigid body physics engine to any canvas rendering library.',
    worksWellWithLLM: false,
    insight: 'An essential component, not a renderer. Use it to add dynamic, physics-based interactions to a p5.js or PixiJS project.',
    canvasRecommended: true,
    aiStudioRecommended: true
  }),
  new Resource({
    category: 'Physics',
    tool: 'Cannon-es',
    useCase: 'Adding a 3D physics engine to a rendering library like Three.js.',
    worksWellWithLLM: false,
    insight: 'The modern, maintained standard for adding realistic physics to a Three.js scene.',
    canvasRecommended: true,
    aiStudioRecommended: true
  }),
  new Resource({
    category: 'Data Viz',
    tool: 'D3.js',
    useCase: 'Crafting bespoke, unique, and complex data-native visualizations.',
    worksWellWithLLM: false,
    insight: 'A specialist\'s tool, not for rapid prototyping. Avoid for generating quick visuals with an LLM due to its complexity.',
    canvasRecommended: false,
    aiStudioRecommended: false
  }),
  new Resource({
    category: 'Data Viz',
    tool: 'Plotly.js',
    useCase: 'Extensive, well-tested visualization library.',
    worksWellWithLLM: true,
    insight: 'A specialist\'s tool, not for rapid prototyping. Avoid for generating quick visuals with an LLM due to its complexity.',
    canvasRecommended: true,
    aiStudioRecommended: true
  }),
  new Resource({
    category: 'Perception',
    tool: 'MediaPipe',
    useCase: 'Plug-and-play perception tasks like hand, face, and pose detection from a webcam.',
    worksWellWithLLM: true,
    insight: 'The most direct way to add powerful, gesture-based interactivity. The default choice for human-centric computer vision.',
    canvasRecommended: true,
    aiStudioRecommended: true
  }),
  new Resource({
    category: 'UI',
    tool: 'React',
    useCase: 'Building complex, large-scale user interfaces with a vast component ecosystem.',
    worksWellWithLLM: true,
    insight: 'Powerful, but its verbosity and hook-based state management can be complex for an LLM to manage effectively.',
    canvasRecommended: false,
aiStudioRecommended: false
  }),
  new Resource({
    category: 'UI',
    tool: 'Angular',
    useCase: 'Building large-scale, enterprise-level single-page applications with a comprehensive framework.',
    worksWellWithLLM: true,
    insight: 'A powerful, opinionated framework. Its complexity and boilerplate make it a challenging target for rapid LLM-driven prototyping.',
    canvasRecommended: false,
    aiStudioRecommended: false
  }),
];

export interface PromptIdea {
  category: 'Game' | 'Simulation' | 'Tool' | 'Other';
  prompt: string;
  canvasLibraries: string[];
  aiStudioLibraries: string[];
}

export const promptIdeas: PromptIdea[] = [
  {
    category: 'Tool',
    prompt: 'Build a 3D architectural visualizer: design simple building layouts and view them in a realistic 3D environment with dynamic lighting.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build a 3D cathedral generator: procedurally create vast, gothic-style cathedral interiors with vaulted ceilings, stained-glass windows, and columns.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Game',
    prompt: 'Build a 3D maze generator: explore procedurally generated mazes with a first-person perspective and customizable themes.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Build a 3D sky writer: draw with the mouse in 3D space, creating temporary, luminous sculptures from glowing particle trails.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build a 3D terrain generator: use a UI to control noise, height, and water level for low-poly islands with warm, sunrise lighting.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: "Build a Game of Life simulation on a 3D cube: Conway's game is mapped onto the cube faces, creating novel patterns as colonies wrap around edges.",
    canvasLibraries: ['Three.js', 'p5.js'],
    aiStudioLibraries: ['Three.js', 'p5.js', 'React']
  },
  {
    category: 'Game',
    prompt: 'Build a choose-your-own-adventure engine: visualize story branches as a growing tree, and users click branches to continue the narrative.',
    canvasLibraries: ['D3.js'],
    aiStudioLibraries: ['D3.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build a code snippet visualizer: paste a code snippet, and the app generates an animated visualization of its execution flow.',
    canvasLibraries: ['D3.js', 'HTML Canvas'],
    aiStudioLibraries: ['D3.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Build a digital terrarium: plant procedurally generated flora and observe growth, with the environment reacting to simulated sunlight or rain.',
    canvasLibraries: ['p5.js', 'Three.js'],
    aiStudioLibraries: ['p5.js', 'Three.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Build a digital zen garden: users draw lines in a 3D sand plane with the mouse, and a rake tool creates parallel patterns.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build a game asset pack generator: define parameters for simple 2D game assets (trees, rocks, coins) and generate variations.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build a game level doodling tool for developers: quickly draw 2D platformer level layouts, and the tool automatically adds tileable textures and basic physics objects.',
    canvasLibraries: ['Phaser', 'p5.js'],
    aiStudioLibraries: ['Phaser', 'p5.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Build a generative abstract art gallery: explore a virtual gallery filled with endlessly unique, procedurally generated abstract art pieces.',
    canvasLibraries: ['Three.js', 'p5.js'],
    aiStudioLibraries: ['Three.js', 'p5.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Build a generative abstract music visualizer: create mesmerizing visual patterns that evolve in real-time based on a generative music algorithm.',
    canvasLibraries: ['p5.js', 'WebGL'],
    aiStudioLibraries: ['p5.js', 'WebGL', 'React']
  },
  {
    category: 'Other',
    prompt: "Build a generative botany app: grow a unique 3D flower based on a user's name, with each letter influencing petal count, stem height, or color.",
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Build a hand-tracking synth explorer: distance between thumb and index finger controls filter cutoff, while hand position controls pitch and volume.',
    canvasLibraries: ['MediaPipe', 'p5.js'],
    aiStudioLibraries: ['MediaPipe', 'p5.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build a hand-tracking virtual keyboard: type on a virtual keyboard by moving hands in front of the webcam, with visual feedback on the screen.',
    canvasLibraries: ['MediaPipe'],
    aiStudioLibraries: ['MediaPipe', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Build a hand-tracking virtual reality experience: navigate a simple VR scene and interact with objects using hand gestures detected by the webcam.',
    canvasLibraries: ['MediaPipe', 'Three.js'],
    aiStudioLibraries: ['A-Frame', 'MediaPipe', 'Three.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build a musical instrument builder: assemble virtual instruments from various components (oscillators, filters, effects) and play them in real-time.',
    canvasLibraries: [],
    aiStudioLibraries: ['React']
  },
  {
    category: 'Tool',
    prompt: 'Build a musical sequencer: click squares on a grid to add notes, and the sequence plays on a loop with a highlighted column indicating the current beat.',
    canvasLibraries: ['p5.js'],
    aiStudioLibraries: ['p5.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Build a physics sandbox: clicking spawns circles that fall into a spinning container, each collision plays a random synth note, and the background subtly shifts hue.',
    canvasLibraries: ['p5.js', 'Matter.js'],
    aiStudioLibraries: ['p5.js', 'Matter.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Build a physics-based drawing app: lines drawn by the user behave like ropes or elastic bands, reacting to gravity and collisions.',
    canvasLibraries: ['Matter.js', 'p5.js'],
    aiStudioLibraries: ['Matter.js', 'p5.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build a procedural 2D platformer level generator: generate endless, unique platformer levels with varying difficulties and themes.',
    canvasLibraries: ['Phaser', 'HTML Canvas'],
    aiStudioLibraries: ['Phaser', 'HTML Canvas', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build a procedural cloud generator: create realistic 3D cloud formations with adjustable density, lighting, and movement.',
    canvasLibraries: ['Three.js', 'WebGL'],
    aiStudioLibraries: ['Three.js', 'WebGL', 'React']
  },
  {
    category: 'Tool',
    prompt: "Build a procedural creature animation tool: define a creature's skeleton and movement parameters, then generate walk cycles and idle animations.",
    canvasLibraries: ['p5.js', 'Matter.js'],
    aiStudioLibraries: ['p5.js', 'Matter.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build a real-time code performance visualizer: input a code snippet, and the app visually represents its execution time and resource usage, highlighting bottlenecks.',
    canvasLibraries: ['D3.js', 'HTML Canvas'],
    aiStudioLibraries: ['D3.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build a retro RPG map editor: design top-down RPG maps with tiles, characters, and interactive elements; export map data.',
    canvasLibraries: ['HTML Canvas', 'Phaser'],
    aiStudioLibraries: ['HTML Canvas', 'Phaser', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build a retro game character creator: design pixel art characters with simple tools and generate basic walk cycles or idle animations.',
    canvasLibraries: ['HTML Canvas', 'Phaser'],
    aiStudioLibraries: ['HTML Canvas', 'Phaser', 'React']
  },
  {
    category: 'Game',
    prompt: 'Build a retro game console emulator: load and play simple 8-bit style games directly in the browser, focusing on visual and sound authenticity.',
    canvasLibraries: ['HTML Canvas', 'Howler.js'],
    aiStudioLibraries: ['HTML Canvas', 'Howler.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build a retro pixel art editor: include layers, basic tools, and animation capabilities; export creations as sprite sheets or GIFs.',
    canvasLibraries: ['HTML Canvas'],
    aiStudioLibraries: ['HTML Canvas', 'React']
  },
  {
    category: 'Game',
    prompt: 'Build a retro text adventure game engine: create classic text-based adventures with simple commands and branching narratives.',
    canvasLibraries: [],
    aiStudioLibraries: ['React']
  },
  {
    category: 'Game',
    prompt: 'Build a simple Breakout or Arkanoid clone: bricks are physics-based and tumble when hit, potentially causing chaotic chain reactions.',
    canvasLibraries: ['Phaser', 'Matter.js'],
    aiStudioLibraries: ['Phaser', 'Matter.js', 'React']
  },
  {
    category: 'Game',
    prompt: 'Build a single-screen Lemmings-style game: guide creatures from entrance to exit through hazards by giving them abilities like blocking or building.',
    canvasLibraries: ['Phaser', 'Matter.js'],
    aiStudioLibraries: ['Phaser', 'Matter.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Build a slime mould growth simulation: a network of veins intelligently grows and refines paths between user-placed food sources.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Other',
    prompt: 'Build a sound-reactive 3D equalizer: visualize audio input as a dynamic 3D bar graph where each bar represents a frequency band and reacts to amplitude.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Build a sound-reactive visualizer: transform microphone input into abstract, evolving geometric patterns.',
    canvasLibraries: ['p5.js'],
    aiStudioLibraries: ['p5.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build a text-to-3D-object converter: type a word, and it generates a simple 3D model of that word, allowing for rotation and basic material changes.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build a tool for creating branching fractal patterns: use UI controls to change parameters like branching angle, recursion depth, and stroke weight.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Build a virtual aquarium: procedurally generate fish and plants, allowing users to interact with the environment and observe the ecosystem.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Tool',
    prompt: "Build a virtual instrument tuner: play a note on an instrument, and the app visually displays whether it's in tune and guides adjustments.",
    canvasLibraries: ['Tone.js'],
    aiStudioLibraries: ['Tone.js', 'React']
  },
  {
    category: 'Game',
    prompt: 'Build a visual novel engine: create simple branching stories with character sprites, backgrounds, and text dialogue.',
    canvasLibraries: ['Howler.js'],
    aiStudioLibraries: ['Howler.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build an AI art style transfer app: upload an image and apply various artistic styles (impressionist, cubist) using a pre-trained model.',
    canvasLibraries: ['TensorFlow.js', 'HTML Canvas'],
    aiStudioLibraries: ['TensorFlow.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Other',
    prompt: 'Build an interactive ASCII art tool: render live webcam video feed in real-time using text characters, with density and selection based on brightness.',
    canvasLibraries: ['p5.js', 'MediaPipe'],
    aiStudioLibraries: ['p5.js', 'MediaPipe', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build an interactive chord progression player: a beautifully designed interface shows common chord shapes, and clicking plays them with realistic piano or guitar sounds.',
    canvasLibraries: ['Howler.js'],
    aiStudioLibraries: ['Howler.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Build an interactive string art generator: place pegs on a canvas and watch a thread automatically wrap to create intricate geometric patterns.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Build an interactive wind map: visualize wind patterns as thousands of flowing particles over a 2D map, with zoom functionality.',
    canvasLibraries: ['p5.js', 'Plotly.js'],
    aiStudioLibraries: ['p5.js', 'Plotly.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a 3D art piece: show a hypercube (tesseract) rotating in 4D space, projected into 3D view.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Create a 3D crystal growth simulator: a seed crystal grows into intricate, branching crystalline structures over time.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create a 3D model viewer: support various formats (GLB, OBJ) and allow inspection with different lighting and materials.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create a code refactoring visualizer: input a code snippet, and the app visually demonstrates potential refactoring opportunities and their impact on code structure.',
    canvasLibraries: ['D3.js', 'HTML Canvas'],
    aiStudioLibraries: ['D3.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a color therapy app: paint with hands via webcam, with gestures or hand shapes switching colors or brush sizes.',
    canvasLibraries: ['p5.js', 'MediaPipe'],
    aiStudioLibraries: ['p5.js', 'MediaPipe', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create a data visualization tool: transform a CSV file into an interactive 3D bar chart or scatter plot.',
    canvasLibraries: ['Three.js', 'D3.js'],
    aiStudioLibraries: ['Three.js', 'D3.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a deconstructed clock visualization: current time is shown as three separate, orbiting circles for hours, minutes, and seconds, leaving faint trails.',
    canvasLibraries: ['p5.js', 'Three.js'],
    aiStudioLibraries: ['p5.js', 'Three.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a digital lava lamp: colorful, metaball-style blobs merge and separate in a fluid animation, with user-changeable color palettes.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a digital loom: moving a hand via webcam weaves colored threads into a tapestry, with hand position controlling color and thickness.',
    canvasLibraries: ['p5.js', 'MediaPipe'],
    aiStudioLibraries: ['p5.js', 'MediaPipe', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a dreamscape generator: generate abstract, evolving visual patterns based on user input (keywords, colors) to evoke calm or wonder.',
    canvasLibraries: ['p5.js'],
    aiStudioLibraries: ['p5.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Create a fluid simulation: interact with a realistic 2D fluid, adding colors and watching them mix and swirl.',
    canvasLibraries: ['p5.js', 'WebGL'],
    aiStudioLibraries: ['p5.js', 'WebGL', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create a game level designer for top-down 2D games: draw tile-based levels, place enemies and items, and export map data.',
    canvasLibraries: ['Phaser', 'HTML Canvas'],
    aiStudioLibraries: ['Phaser', 'HTML Canvas', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a generative abstract animation creator: define parameters for motion, color, and shape, then generate unique, looping abstract animations.',
    canvasLibraries: ['p5.js', 'WebGL'],
    aiStudioLibraries: ['p5.js', 'WebGL', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a generative abstract painting tool: provide a few color inputs, and the app creates a unique, evolving abstract painting using noise and fluid dynamics.',
    canvasLibraries: ['p5.js', 'WebGL'],
    aiStudioLibraries: ['p5.js', 'WebGL', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Create a generative city builder: define parameters for city density, building styles, and road networks, then watch a unique city procedurally generate.',
    canvasLibraries: ['Three.js', 'p5.js'],
    aiStudioLibraries: ['Three.js', 'p5.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a generative music box: place musical notes on a 2D grid, and a virtual ball bounces around, playing the notes it hits.',
    canvasLibraries: ['Matter.js', 'p5.js'],
    aiStudioLibraries: ['Matter.js', 'p5.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create a generative soundscape mixer: combine various ambient sound elements (rain, wind, forest sounds) to create custom, evolving soundscapes.',
    canvasLibraries: ['Howler.js'],
    aiStudioLibraries: ['Howler.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a hand-drawn 3D scene renderer: apply a shader to a simple 3D scene to make it look like a pencil or charcoal sketch with wobbly outlines.',
    canvasLibraries: ['Three.js', 'WebGL'],
    aiStudioLibraries: ['Three.js', 'WebGL', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a hand-tracking virtual instrument: play a virtual piano or drum kit by moving hands in front of the webcam.',
    canvasLibraries: ['MediaPipe', 'p5.js'],
    aiStudioLibraries: ['MediaPipe', 'p5.js', 'React']
  },
  {
    category: 'Game',
    prompt: 'Create a musical Rube Goldberg machine: place ramps, bouncy surfaces, and bells, then drop a ball to trigger a sequence of sounds.',
    canvasLibraries: ['Matter.js', 'p5.js'],
    aiStudioLibraries: ['Matter.js', 'p5.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a neural network art generator: a force-directed graph of nodes and connections pulses with light and shifts structure; clicking stimulates a node.',
    canvasLibraries: ['D3.js', 'HTML Canvas'],
    aiStudioLibraries: ['D3.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create a particle disintegration effect tool: upload a black-and-white logo, and on click, white pixels explode into gravity-affected particles.',
    canvasLibraries: ['p5.js', 'Matter.js'],
    aiStudioLibraries: ['p5.js', 'Matter.js', 'React']
  },
  {
    category: 'Game',
    prompt: 'Create a physics-based puzzle game: manipulate gravity or forces to guide a ball through a complex maze with obstacles.',
    canvasLibraries: ['Matter.js', 'p5.js'],
    aiStudioLibraries: ['Matter.js', 'p5.js', 'React']
  },
  {
    category: 'Game',
    prompt: 'Create a physics-based tower defense game: build towers that fire physics-affected projectiles to defend against waves of enemies.',
    canvasLibraries: ['Matter.js', 'Phaser'],
    aiStudioLibraries: ['Matter.js', 'Phaser', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create a procedural planet shader explorer: generate unique 3D planet surfaces with sliders for atmosphere color, cloud cover, land mass, and city light distribution.',
    canvasLibraries: ['Three.js', 'WebGL'],
    aiStudioLibraries: ['Three.js', 'WebGL', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create a procedural terrain generator for 2D games: generate endless scrolling landscapes with varying heights, obstacles, and collectible items.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create a procedural weapon generator for games: generate unique 2D or 3D weapon designs with customizable parts, materials, and effects.',
    canvasLibraries: ['p5.js', 'Three.js'],
    aiStudioLibraries: ['p5.js', 'Three.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Create a rain on a window simulator: realistic raindrops streak down the screen and merge, and clicking adds a smudge that alters water path.',
    canvasLibraries: ['p5.js', 'Matter.js'],
    aiStudioLibraries: ['p5.js', 'Matter.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Create a reaction-diffusion pattern generator: simulate chemical processes for mesmerizing, organic, and ever-changing black and white patterns.',
    canvasLibraries: ['p5.js', 'WebGL'],
    aiStudioLibraries: ['p5.js', 'WebGL', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create a retro arcade game creator: build simple arcade games like Space Invaders or Pong using a visual editor and pre-made assets.',
    canvasLibraries: ['Phaser', 'HTML Canvas'],
    aiStudioLibraries: ['Phaser', 'HTML Canvas', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create a retro split-flap display simulator: users type messages, and the display animates letters with click-clack sound effects.',
    canvasLibraries: ['Howler.js'],
    aiStudioLibraries: ['Howler.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create a rhythm game editor for game developers: visually place notes on a timeline, synchronize with a background track, and export data.',
    canvasLibraries: ['HTML Canvas'],
    aiStudioLibraries: ['HTML Canvas', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a sound sculptor using hand tracking: shape a sound wave with your hand, controlling frequency with hand height and amplitude/filter with hand width.',
    canvasLibraries: ['MediaPipe', 'p5.js'],
    aiStudioLibraries: ['MediaPipe', 'p5.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a sound wave painter: draw directly onto a visual representation of a sound wave, modifying its shape and hearing the immediate sonic result.',
    canvasLibraries: ['HTML Canvas'],
    aiStudioLibraries: ['HTML Canvas', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a sound-reactive particle system: particles on screen react to audio input, changing color, size, and movement based on frequency and amplitude.',
    canvasLibraries: ['p5.js'],
    aiStudioLibraries: ['p5.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a sound-weaving application: two simple synth tones, controlled by two hands via webcam, are visualized as intertwined, colored ribbons.',
    canvasLibraries: ['MediaPipe', 'Three.js'],
    aiStudioLibraries: ['MediaPipe', 'Three.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a spirograph pattern generator: control parameters like radius and speed with hand position via webcam for organic, gestural pattern creation.',
    canvasLibraries: ['p5.js', 'MediaPipe'],
    aiStudioLibraries: ['p5.js', 'MediaPipe', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create a virtual DJ mixer: load audio tracks, scratch, and mix them in real-time with two turntables and a crossfader.',
    canvasLibraries: ['Howler.js'],
    aiStudioLibraries: ['Howler.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create a virtual metronome: customize rhythms, sounds, and visual feedback for practicing timing.',
    canvasLibraries: [],
    aiStudioLibraries: ['React']
  },
  {
    category: 'Simulation',
    prompt: 'Create a virtual plant growth simulator: plant a seed and watch a unique plant grow and evolve based on controlled environmental parameters.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create a virtual puppet show: map facial expressions or hand movements via webcam to control simple 2D puppet characters for interactive storytelling.',
    canvasLibraries: ['MediaPipe', 'p5.js'],
    aiStudioLibraries: ['MediaPipe', 'p5.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create a virtual reality gallery: load PDB files and view molecules as 3D objects in VR, manipulating them with hand controllers.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['A-Frame', 'Three.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create an app that turns any image into a stained glass window: simplify the image into colored regions and overlay a black leading pattern.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create an infinite zoom art piece: start with a scene, and zooming into a detail resolves into a new scene, creating an endless journey.',
    canvasLibraries: ['p5.js', 'Three.js'],
    aiStudioLibraries: ['p5.js', 'Three.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create an interactive music theory visualizer: explore scales, chords, and progressions visually on a virtual piano roll or fretboard.',
    canvasLibraries: ['D3.js'],
    aiStudioLibraries: ['D3.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Create an interactive music visualizer: render audio as a 3D tunnel of pulsing rings, with radius tied to bass and color to treble.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Create an interactive soundscape generator: place abstract objects on a canvas, each emitting a unique ambient sound; moving/resizing changes sound properties.',
    canvasLibraries: ['p5.js'],
    aiStudioLibraries: ['p5.js', 'React']
  },
  {
    category: 'Other',
    prompt: "Create an interactive storytelling app: users influence the narrative by drawing or sketching elements on the screen, which become part of the story's visuals.",
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a 3D character customizer: select different body parts, clothing, and accessories from a library to design unique 3D characters.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a 3D character pose editor: load a simple humanoid model and manipulate its joints to create custom poses.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Design a 3D fractal explorer: navigate infinitely complex fractal landscapes, changing parameters and color palettes.',
    canvasLibraries: ['Three.js', 'WebGL'],
    aiStudioLibraries: ['Three.js', 'WebGL', 'React']
  },
  {
    category: 'Other',
    prompt: 'Design a 3D logo reveal animation: reconstruct a logo from thousands of tiny cubes that fly in and snap into place.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a 3D planet generator: create customizable biomes, atmospheric effects, and day/night cycles for sci-fi settings.',
    canvasLibraries: ['Three.js', 'WebGL'],
    aiStudioLibraries: ['Three.js', 'WebGL', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a code dependency visualizer: input a codebase, and the app generates an interactive graph showing dependencies between files, modules, or functions.',
    canvasLibraries: ['D3.js', 'HTML Canvas'],
    aiStudioLibraries: ['D3.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a code syntax highlighter: visually animate the parsing of code, showing how different tokens are identified.',
    canvasLibraries: ['D3.js', 'HTML Canvas'],
    aiStudioLibraries: ['D3.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a code visualizer: transform simple JavaScript functions into animated 2D flowcharts or diagrams.',
    canvasLibraries: ['D3.js', 'HTML Canvas'],
    aiStudioLibraries: ['D3.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Other',
    prompt: 'Design a digital kaleidoscope: control intricate, symmetrical patterns that endlessly evolve with mouse movement.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a generative ambient music composer: create soothing, evolving musical soundscapes by adjusting parameters like instrument types, tempo, and melodic complexity.',
    canvasLibraries: ['p5.js'],
    aiStudioLibraries: ['p5.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a generative landscape creator: adjust parameters like mountain height, tree density, and water features to create unique 2D or 3D landscapes.',
    canvasLibraries: ['p5.js', 'Three.js'],
    aiStudioLibraries: ['p5.js', 'Three.js', 'React']
  },
  {
    category: 'Other',
    prompt: "Design a generative portrait tool: create abstract, evolving portraits based on a user's webcam feed, with styles like cubist or pixelated.",
    canvasLibraries: ['p5.js', 'MediaPipe'],
    aiStudioLibraries: ['p5.js', 'MediaPipe', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a gesture-controlled 3D sculpting tool: use hand position via webcam to control a virtual sculpting tool, adding or subtracting from digital clay.',
    canvasLibraries: ['Three.js', 'MediaPipe'],
    aiStudioLibraries: ['Three.js', 'MediaPipe', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a glitch art generator: upload an image and apply effects like color channel shifting, pixel sorting, and scan lines with sliders.',
    canvasLibraries: ['HTML Canvas', 'p5.js'],
    aiStudioLibraries: ['HTML Canvas', 'p5.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Design a hand-tracking drawing app: thickness and color of the line are controlled by the distance between fingers.',
    canvasLibraries: ['MediaPipe', 'p5.js'],
    aiStudioLibraries: ['MediaPipe', 'p5.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Design a hand-tracking virtual painting app: paint in 3D space using hand gestures, creating ephemeral sculptures of light or particles.',
    canvasLibraries: ['MediaPipe', 'Three.js', 'p5.js'],
    aiStudioLibraries: ['MediaPipe', 'Three.js', 'p5.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Design a particle flow simulator: draw paths and watch thousands of particles follow them, creating mesmerizing visual effects.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Game',
    prompt: 'Design a physics-based puzzle platformer: guide a character through levels by manipulating gravity, wind, or other forces.',
    canvasLibraries: ['Matter.js', 'Phaser'],
    aiStudioLibraries: ['Matter.js', 'Phaser', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Design a planetary gear designer: an interface allows creating and connecting gears of different sizes, then animates their mechanical interactions.',
    canvasLibraries: ['Matter.js', 'p5.js'],
    aiStudioLibraries: ['Matter.js', 'p5.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Design a poetry constellation creator: paste a poem, and visualize it as a star map where words are stars, and connections highlight themes.',
    canvasLibraries: ['p5.js', 'D3.js'],
    aiStudioLibraries: ['p5.js', 'D3.js', 'React']
  },
  {
    category: 'Game',
    prompt: 'Design a procedural bridge builder game: span a 2D canyon by clicking and dragging to create support structures and roads, then test with a vehicle.',
    canvasLibraries: ['Matter.js', 'p5.js'],
    aiStudioLibraries: ['Matter.js', 'p5.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a procedural character generator for RPGs: generate unique character portraits with customizable features, clothing, and accessories.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a procedural creature generator: create unique 2D or 3D creatures with customizable body parts, textures, and animations.',
    canvasLibraries: ['p5.js', 'Three.js', 'Matter.js'],
    aiStudioLibraries: ['p5.js', 'Three.js', 'Matter.js', 'React']
  },
  {
    category: 'Game',
    prompt: 'Design a procedural dungeon crawler: generate unique dungeons with different layouts, enemy placements, and loot.',
    canvasLibraries: ['Phaser', 'HTML Canvas'],
    aiStudioLibraries: ['Phaser', 'HTML Canvas', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a procedural enemy generator for games: generate unique enemy sprites or 3D models with customizable behaviors, attack patterns, and visual variations.',
    canvasLibraries: ['p5.js', 'Three.js', 'Phaser'],
    aiStudioLibraries: ['p5.js', 'Three.js', 'Phaser', 'React']
  },
  {
    category: 'Game',
    prompt: 'Design a procedural maze generator: create complex 3D mazes, allowing first-person navigation.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Design a ragdoll physics playground: drop humanoid ragdolls into a 2D environment with obstacles like spinning wheels, trampolines, and cannons.',
    canvasLibraries: ['Matter.js', 'p5.js'],
    aiStudioLibraries: ['Matter.js', 'p5.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a retro platformer game creator: design 2D platformer levels with a tile editor, place enemies, and define character movement.',
    canvasLibraries: ['Phaser', 'HTML Canvas'],
    aiStudioLibraries: ['Phaser', 'HTML Canvas', 'React']
  },
  {
    category: 'Other',
    prompt: 'Design a rhythm circle: record short sound loops visualized as orbiting planets, with distance controlling volume and size representing length.',
    canvasLibraries: ['Howler.js', 'p5.js'],
    aiStudioLibraries: ['Howler.js', 'p5.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a simple 3D modeling tool: add or remove voxel cubes from a grid, paint them, and apply basic lighting.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Design a simple 3D spaceship cockpit view: the ship flies automatically through an asteroid field, and the mouse controls orientation to look around.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Game',
    prompt: "Design a simple game: switch a ship's color between black and white to absorb projectiles of the same color.",
    canvasLibraries: ['p5.js', 'Phaser'],
    aiStudioLibraries: ['p5.js', 'Phaser', 'React']
  },
  {
    category: 'Game',
    prompt: 'Design a sound-controlled spaceship game: control spaceship movement and firing by varying voice pitch and volume.',
    canvasLibraries: ['Phaser', 'Tone.js'],
    aiStudioLibraries: ['Phaser', 'Tone.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Design a sound-reactive 2D equalizer: visualize audio input as a dynamic 2D waveform or spectrum analyzer, with colors and patterns reacting to sound.',
    canvasLibraries: ['p5.js'],
    aiStudioLibraries: ['p5.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a tool that generates procedural potion icons for RPGs: sliders control bottle shape, liquid color, bubbles, and glowing aura for unique inventory items.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design a virtual drum machine: tap out rhythms on a grid, choose drum sounds, and play back creations.',
    canvasLibraries: ['Howler.js'],
    aiStudioLibraries: ['Howler.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Design a virtual pet simulator: interact with a procedurally generated pet, feed it, play with it, and watch it evolve.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Game',
    prompt: 'Design an Asteroids-style game: control a gravitational point with the mouse to attract space debris and fling it at enemies.',
    canvasLibraries: ['p5.js', 'Matter.js', 'Phaser'],
    aiStudioLibraries: ['p5.js', 'Matter.js', 'Phaser', 'React']
  },
  {
    category: 'Other',
    prompt: 'Design an Etch A Sketch using hand tracking: pinch fingers to draw, open hand to stop, and shaking hands clears the canvas.',
    canvasLibraries: ['p5.js', 'MediaPipe'],
    aiStudioLibraries: ['p5.js', 'MediaPipe', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Design an interactive shader playground: write and experiment with GLSL shaders in real-time, seeing immediate visual output.',
    canvasLibraries: ['WebGL', 'HTML Canvas'],
    aiStudioLibraries: ['WebGL', 'HTML Canvas', 'React']
  },
  {
    category: 'Other',
    prompt: 'Develop a 3D scene with a massive, slowly rotating asteroid; allow mouse-orbiting camera and on-click laser strikes leaving glowing decals.',
    canvasLibraries: ['Three.js', 'Howler.js'],
    aiStudioLibraries: ['Three.js', 'Howler.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Develop a game developer tool: generate tileable noise textures (clouds, marble, wood) with sliders for scale, octaves, and persistence.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Game',
    prompt: 'Develop a game where falling shapes are balanced on a central platform: use the mouse to move the platform, and shapes are affected by realistic physics.',
    canvasLibraries: ['p5.js', 'Matter.js'],
    aiStudioLibraries: ['p5.js', 'Matter.js', 'React']
  },
  {
    category: 'Game',
    prompt: 'Develop a minimalist rhythm game: circles expand from the center, and users click the keyboard when circles align with an outer ring, synchronized to a beat.',
    canvasLibraries: ['p5.js'],
    aiStudioLibraries: ['p5.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Develop a tool for game developers: generate procedural, animated sprites with sliders for creature legs, body shape, and walking animation cycle, with sprite sheet export.',
    canvasLibraries: ['p5.js', 'Phaser'],
    aiStudioLibraries: ['p5.js', 'Phaser', 'React']
  },
  {
    category: 'Other',
    prompt: 'Develop an audio-reactive wallpaper: geometric patterns on screen pulse, rotate, and change color in response to microphone input.',
    canvasLibraries: ['p5.js'],
    aiStudioLibraries: ['p5.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Display a holographic planet: render a 3D planet with shimmering, scan-line-heavy holographic shaders; allow mouse rotation to view continents.',
    canvasLibraries: ['Three.js', 'WebGL'],
    aiStudioLibraries: ['Three.js', 'WebGL', 'React']
  },
  {
    category: 'Other',
    prompt: 'Generate a procedural city skyline at night: buildings are rectangles with random flickering windows, and a moon provides a single light source.',
    canvasLibraries: ['p5.js', 'Three.js'],
    aiStudioLibraries: ['p5.js', 'Three.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Generate a unique, abstract blob creature: use layered Perlin noise for a pulsating, deforming creature; clicking regenerates it with a new random seed.',
    canvasLibraries: ['p5.js', 'HTML Canvas'],
    aiStudioLibraries: ['p5.js', 'HTML Canvas', 'React']
  },
  {
    category: 'Other',
    prompt: "Render a poem's words as particles: particles are blown by simulated wind, leaving faint trails before fading.",
    canvasLibraries: ['p5.js', 'Matter.js'],
    aiStudioLibraries: ['p5.js', 'Matter.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Simulate 2D water: drop objects into water and observe realistic ripples and waves.',
    canvasLibraries: ['Matter.js', 'p5.js'],
    aiStudioLibraries: ['Matter.js', 'p5.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Simulate a flock of birds (boids): clicking drops food to alter flock behavior, causing them to swarm towards the cursor.',
    canvasLibraries: ['p5.js', 'Matter.js'],
    aiStudioLibraries: ['p5.js', 'Matter.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Simulate chimes with physics: chime objects hang from the top, and dragging the mouse simulates wind, causing collisions and melodic sounds.',
    canvasLibraries: ['Matter.js', 'p5.js'],
    aiStudioLibraries: ['Matter.js', 'p5.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Simulate fireflies in a dark forest: the mouse acts as a light source, causing nearby fireflies to scatter and regroup, creating organic light patterns.',
    canvasLibraries: ['p5.js', 'Matter.js'],
    aiStudioLibraries: ['p5.js', 'Matter.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Simulate fluid dynamics: inject streams of colored ink into a flowing liquid simulation with the mouse, creating swirling patterns.',
    canvasLibraries: ['p5.js', 'WebGL'],
    aiStudioLibraries: ['p5.js', 'WebGL', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Visualize global weather patterns: a 3D globe shows wind currents as flowing, animated lines, with colors representing temperature.',
    canvasLibraries: ['Three.js', 'Plotly.js'],
    aiStudioLibraries: ['Three.js', 'Plotly.js', 'React']
  },
  {
    category: 'Other',
    prompt: 'Visualize music as a vibrating, shimmering 3D landscape: terrain peaks and valleys are determined by audio frequency.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'React']
  },
  {
    category: 'Simulation',
    prompt: 'Visualize the solar system in 3D: planets are spheres with glowing orbits, and users control time speed to see alignments.',
    canvasLibraries: ['Three.js'],
    aiStudioLibraries: ['Three.js', 'Babylon.js', 'React']
  },
  {
    category: 'Tool',
    prompt: 'Visualize typed text as a force-directed graph: words are nodes, and connections are drawn between sequential words to reveal text structure.',
    canvasLibraries: ['D3.js', 'HTML Canvas'],
    aiStudioLibraries: ['D3.js', 'HTML Canvas', 'React']
  }
];

export interface Advice {
  id: number;
  title: string;
  description: string;
  target: 'Common' | 'Gemini Canvas' | 'AI Studio';
}

export const adviceData: Advice[] = [
  {
    id: 1,
    title: "Start Simple",
    description: "Your initial prompt should be a simple description of the app with only the minimal requirements to get it off the ground.",
    target: 'Common'
  },
  {
    id: 2,
    title: "Embrace the Pause",
    description: "The app may take time to regenerate. Use this time to think about your next step or things you'd like to improve.",
    target: 'Common'
  },
  {
    id: 3,
    title: "Batch Small Changes",
    description: "When making small changes or bug fixes, try to batch many into a single prompt. Don't worry—the LLM can generally parse them out!",
    target: 'Common'
  },
  {
    id: 4,
    title: "Isolate Large Changes",
    description: "When making large changes or introducing a new feature, it's best to make one change at a time so they don't collide.",
    target: 'Common'
  },
  {
    id: 5,
    title: "Know When to Reset",
    description: `Sometimes, it's okay to start over if the LLM feels "stuck." Try asking it to "Print a detailed description of this application, including all of its features" and paste the output into a new session.`,
    target: 'Common'
  },
  {
    id: 6,
    title: "Gemini Canvas: Select the Canvas Tool",
    description: "Be sure you have the 'Canvas' button selected in the tools, not 'Code' or 'Web', to enable interactive web app generation.",
    target: 'Gemini Canvas'
  },
  {
    id: 7,
    title: "Gemini Canvas: Use Gemini 2.5 Flash",
    description: "For the best results, use the 'gemini-2.5-flash' model. It is optimized for this type of creative task, especially for free-tier users.",
    target: 'Gemini Canvas'
  },
  {
    id: 8,
    title: "AI Studio: Give it a Nudge",
    description: "If the model outlines a plan but doesn't write the code, it might be waiting for confirmation. A simple 'Go' or 'Proceed' prompt is often all that's needed.",
    target: 'AI Studio'
  },
  {
    id: 9,
    title: "Gemini Canvas: Mind the Token Count",
    description: "Being a single-page application, keeping the token count low is important to keep your turnaround high. You'll start seeing slower iteration around 1400 lines of code.",
    target: 'Gemini Canvas'
  },
  {
    id: 10,
    title: "AI Studio: Leverage Multi-File Structure",
    description: "As AI Studio allows multiple files, managing how files are separated helps in keeping turnaround fast - asking the system to break things into parts so it doesn't have to change so much each iteration.",
    target: 'AI Studio'
  }
];