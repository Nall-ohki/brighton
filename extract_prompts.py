import re
import json

def categorize(title):
    t = title.lower()
    if 'game' in t or 'play' in t: return 'Game'
    if 'tool' in t or 'editor' in t or 'ui' in t or 'interface' in t: return 'Tool'
    if 'sim' in t or 'engine' in t: return 'Simulation'
    return 'Other'

def main():
    md_file = "docs/vibe-coding-prompts-brighton-2026.md"
    ts_file = "data.tsx"
    
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    parts = content.split('#### 🎬 ')
    
    new_prompts = []
    
    for part in parts[1:]:
        title_line = part.split('\n')[0]
        title = title_line.strip()
        
        track_match = re.search(r'\*\*Track\(s\)\*\*: (.*?)\n', part)
        track = track_match.group(1).strip() if track_match else ""
        
        prompt_match = re.search(r'\*\*The GenAI Prompt:\*\*\n```text\n(.*?)\n```', part, re.DOTALL)
        prompt = prompt_match.group(1).strip() if prompt_match else ""
        
        if not prompt: continue
        
        cat = categorize(title)
        
        new_prompts.append({
            'category': cat,
            'prompt': prompt,
            'canvasLibraries': [],
            'aiStudioLibraries': [],
            'source': 'Develop:Brighton:2026',
            'sessionTitle': title,
            'sessionTrack': track
        })
        
    # Read data.tsx and find the insertion point
    with open(ts_file, 'r', encoding='utf-8') as f:
        ts_content = f.read()
        
    # We'll use a simple string replacement. We know the array ends at:
    #   }
    # ];
    # export interface Advice {
    
    # Let's find the string representation of the new prompts
    # we can format them manually to match typescript style
    
    append_str = ""
    for p in new_prompts:
        append_str += "  ,{\n"
        append_str += f"    category: '{p['category']}',\n"
        # escape single quotes in prompt and title
        prompt_esc = p['prompt'].replace("'", "\\'")
        title_esc = p['sessionTitle'].replace("'", "\\'")
        track_esc = p['sessionTrack'].replace("'", "\\'")
        
        append_str += f"    prompt: '{prompt_esc}',\n"
        append_str += f"    canvasLibraries: [],\n"
        append_str += f"    aiStudioLibraries: [],\n"
        append_str += f"    source: 'Develop:Brighton:2026',\n"
        append_str += f"    sessionTitle: '{title_esc}',\n"
        append_str += f"    sessionTrack: '{track_esc}'\n"
        append_str += "  }\n"
        
    # Insert before the last ]; before export interface Advice
    # We can split by "];\n\nexport interface Advice"
    split_target = "];\n\nexport interface Advice"
    if split_target in ts_content:
        ts_content = ts_content.replace(split_target, append_str + split_target)
    else:
        print("Could not find insertion point!")
        return
        
    with open(ts_file, 'w', encoding='utf-8') as f:
        f.write(ts_content)
        
    print(f"Appended {len(new_prompts)} prompts to data.tsx")

if __name__ == '__main__':
    main()
