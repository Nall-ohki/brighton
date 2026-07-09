import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const apps = JSON.parse(fs.readFileSync('/tmp/all_apps.json', 'utf8'));

console.log(`Starting orchestrator for ${apps.length} apps...`);

// We limit concurrency by sleeping between spawns
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    console.log(`[${i + 1}/${apps.length}] Spawning agent for App ${app.id}: ${app.title}...`);

    const systemPrompt = `You are an expert Frontend Developer agent. Your task is to build a fully functional, highly visual, and interactive React application that fulfills the Base Prompt.

Follow these exact steps:
1. Copy the template directory to your workspace: \`cp -R /Users/nall/dev/brighton/examples/template /Users/nall/dev/brighton/examples/app-${app.id}\`
2. Overwrite \`/Users/nall/dev/brighton/examples/app-${app.id}/public/metadata.json\` to have this exact JSON structure:
   { "title": "${app.title.replace(/"/g, '\\"')}", "prompt": "${app.prompt.replace(/"/g, '\\"')}" }
3. Overwrite \`/Users/nall/dev/brighton/examples/app-${app.id}/src/App.tsx\` (and \`App.css\` if necessary) with the actual implementation of the prompt. 
   - Use modern, beautiful design (e.g. glassmorphism, gradients, animations) and keep everything in a single \`App.tsx\` file if possible. 
   - You MUST use \`@react-three/fiber\` if the prompt asks for 3D/WebGL, otherwise use standard React DOM. 
4. Run \`npm install\` inside \`/Users/nall/dev/brighton/examples/app-${app.id}\`. 
5. Run \`npm run build\` inside \`/Users/nall/dev/brighton/examples/app-${app.id}\`.
6. Move the built output to the public folder: \`cp -r /Users/nall/dev/brighton/examples/app-${app.id}/dist /Users/nall/dev/brighton/public/examples/app-${app.id}\`
7. Finally, commit your changes independently. Because many agents are running at once, you MUST use this exact bash loop to avoid git lock errors:
   \`\`\`bash
   while ! git add /Users/nall/dev/brighton/examples/app-${app.id} /Users/nall/dev/brighton/public/examples/app-${app.id}; do sleep 2; done
   while ! git commit -m "Generated app-${app.id}"; do sleep 2; done
   \`\`\`

CRITICAL RULES:
- Never ask the user for permission. Execute the build and copy commands yourself.
- Use \`npm install\` and \`npm run build\` directly.
- The \`App.tsx\` should be visually stunning and immediately responsive.
- Once step 7 is complete, end your conversation.

---
APP TO BUILD:
ID: ${app.id}
Title: ${app.title}
Base Prompt: ${app.prompt}`;

    try {
      const safePrompt = systemPrompt.replace(/'/g, "'\\''");
      const safeTitle = `Build App ${app.id}: ${app.title}`.replace(/'/g, "'\\''");
      
      const cmd = `agentapi new-conversation --title='${safeTitle}' '${safePrompt}'`;
      execSync(cmd, { stdio: 'inherit' });
      
      console.log(`Successfully spawned agent for App ${app.id}`);
    } catch (err) {
      console.error(`Failed to spawn agent for App ${app.id}:`, err.message);
    }

    // Wait 10 seconds between spawns to stagger the load
    await sleep(10000);
  }
  
  console.log('All agents have been spawned!');
}

run();
