import re

def generate_concept_and_prompt(title, description):
    clean_title = re.sub(r'[^a-zA-Z0-9\s:]', '', title).strip()
    desc_sentences = description.split('.')
    short_desc = desc_sentences[0].strip() if desc_sentences else "this session's core concepts"
    
    if 'AI' in title or 'GenAI' in title:
        prompt = f"Build an interactive web application that simulates {clean_title}. Create a mock interface for an AI assistant that helps game designers. Include a feature that visualizes: {short_desc}. Ensure a futuristic, 'vibey' aesthetic."
    elif 'Mobile' in title:
        prompt = f"Build a responsive, mobile-first web app that demonstrates {clean_title}. The app should feature touch-friendly UI components and focus on this theme: {short_desc}."
    elif 'Audio' in title or 'Sound' in title or 'Music' in title:
        prompt = f"Build an interactive audio visualizer inspired by {clean_title}. Create a dynamic UI that reacts to user input, reflecting the idea: {short_desc}."
    elif 'Story' in title or 'Narrative' in title:
        prompt = f"Build a branching narrative tool. Inspired by {clean_title}, the app should let users click through a dynamic dialogue tree that illustrates: {short_desc}."
    elif 'UI' in title or 'Interface' in title:
        prompt = f"Build a premium, animated UI showcase. Inspired by {clean_title}, design interface elements that complement a game's brand. Keep in mind: {short_desc}."
    else:
        prompt = f"Build an interactive web dashboard with data visualizations. The dashboard should visualize the key takeaways of {clean_title}. Focus on the core idea: {short_desc}. Ensure the design is modern, accessible, and highly polished."
        
    return prompt

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
