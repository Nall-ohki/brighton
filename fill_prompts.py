import re

import random

def generate_concept_and_prompt(title, description):
    clean_title = re.sub(r'[^a-zA-Z0-9\s:]', '', title).strip()
    desc_sentences = description.split('.')
    short_desc = desc_sentences[0].strip() if desc_sentences else "this session's core concepts"
    
    t = title.lower()
    if 'ai ' in t or 'genai' in t:
        templates = [
            "Create a rogue-like hacking minigame where you command an unpredictable AI to infiltrate '{title}'. The mechanics should explore how '{short_desc}'. Use a glitchy, cyberpunk aesthetic.",
            "Build a quirky virtual pet game where the pet is an AI trying to understand '{title}'. It asks the player questions and visually evolves based on: '{short_desc}'."
        ]
    elif 'audio' in t or 'sound' in t or 'music' in t:
        templates = [
            "Build a relaxing, interactive lo-fi beat maker themed around '{title}'. The interactive elements should visually pulse and react to the core concept: '{short_desc}'.",
            "Create a synesthesia experience. A web app where clicking and dragging generates abstract soundscapes and visuals that represent the themes of '{title}': '{short_desc}'."
        ]
    elif 'art' in t or 'concept' in t or 'visual' in t:
        templates = [
            "Develop a 'vibe-coded' generative art tool. Users can tweak sliders related to '{title}' to paint beautiful, abstract patterns that represent: '{short_desc}'.",
            "Build a gorgeous, interactive 3D gallery. The gallery exhibits floating sculptures that visually metaphorize '{title}', revealing insights about: '{short_desc}'."
        ]
    elif 'narrative' in t or 'story' in t or 'write' in t:
        templates = [
            "Create a text-based mystery adventure. The player is a detective uncovering the truth behind '{title}'. The clues revolve around: '{short_desc}'.",
            "Build an interactive, animated comic book. The panels should animate as the user clicks, telling a dramatic, over-the-top story about '{title}' and the struggles of: '{short_desc}'."
        ]
    elif 'business' in t or 'funding' in t or 'market' in t or 'management' in t:
        templates = [
            "Create a quirky management simulator where the player acts as a chaotic studio head trying to survive '{title}'. They must balance resources based on: '{short_desc}'.",
            "Build an intense, arcade-style stock trading minigame where the commodity is '{title}'. The market crashes and booms based on: '{short_desc}'."
        ]
    elif 'team' in t or 'culture' in t or 'health' in t:
        templates = [
            "Build a cozy, relaxing idle game about building a healthy studio. Inspired by '{title}', the main progression revolves around '{short_desc}'. Use soft, pastel colors.",
            "Create a collaborative puzzle toy where multiple on-screen cursors must work together to solve challenges related to '{title}', illustrating: '{short_desc}'."
        ]
    elif 'mobile' in t:
        templates = [
            "Design a frantic, hyper-casual mobile web game. The one-tap objective is to navigate the challenges of '{title}', incorporating mechanics that reflect: '{short_desc}'.",
            "Build a satisfying, tactile fidget toy web app inspired by '{title}'. Elements should squish, snap, and pop while teaching the user about: '{short_desc}'."
        ]
    else:
        templates = [
            "Create a whimsical, interactive physics playground inspired by '{title}'. The user should be able to toss around elements that represent '{short_desc}' with satisfying bouncy physics.",
            "Make an interactive, animated manifesto page for '{title}'. As the user scrolls, typography and 3D elements should dynamically shift to illustrate: '{short_desc}'.",
            "Design a satirical, retro-OS style interface (like Windows 95) that acts as a tool for '{title}'. It should have popups, sounds, and folders that explore: '{short_desc}'.",
            "Make a frantic, WarioWare-style microgame collection! Each 5-second minigame should be a hilarious literal interpretation of concepts from '{title}', especially: '{short_desc}'.",
            "Build a Zen garden interactive experience. The user rakes sand and places stones that represent the concepts of '{title}', reflecting on the idea that '{short_desc}'."
        ]
        
    template = random.choice(templates)
    return template.format(title=clean_title, short_desc=short_desc)

def main():
    file_path = "docs/vibe-coding-prompts-brighton-2026.md"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    parts = content.split('#### 🎬 ')
    out_lines = [parts[0]]
    
    for part in parts[1:]:
        title_line = part.split('\n')[0]
        title = title_line.strip()
        
        desc_match = re.search(r'\*\*Description:\*\*\s*(.*?)\n', part)
        desc = desc_match.group(1).strip() if desc_match else ""
        
        prompt = generate_concept_and_prompt(title, desc)
        
        # Replace the existing prompt block.
        # We need a regex that replaces the contents between ```text and ```
        # since it's already filled from the previous run.
        part = re.sub(
            r'\*\*The GenAI Prompt:\*\*\n```text\n.*?\n```',
            f'**The GenAI Prompt:**\n```text\n{prompt}\n```',
            part,
            count=1,
            flags=re.DOTALL
        )
        
        out_lines.append('#### 🎬 ' + part)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write("".join(out_lines))
        
    print("Done regenerating GenAI Prompts.")

if __name__ == '__main__':
    main()
