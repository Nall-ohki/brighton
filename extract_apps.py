import re

def main():
    md_file = "docs/vibe-coding-prompts-brighton-2026.md"
    ts_file = "data.tsx"
    
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    parts = content.split('#### 🎬 ')
    
    new_apps = []
    index_start = 35 # Last index was 34
    
    for part in parts[1:]:
        title_line = part.split('\n')[0]
        title = title_line.strip()
        
        desc_match = re.search(r'\*\*Description:\*\*\s*(.*?)\n', part)
        desc = desc_match.group(1).strip() if desc_match else "Develop:Brighton 2026 session concept"
        desc_short = desc.split('.')[0].strip() + '.'
        
        author_match = re.search(r'\*\*Speaker\(s\)\*\*: (.*?)\n', part)
        author_str = author_match.group(1).strip() if author_match else "Develop:Brighton Speaker"
        
        authors = []
        parts_list = []
        current = []
        depth = 0
        for char in author_str:
            if char == '(': depth += 1
            elif char == ')': depth -= 1
            if char == ',' and depth == 0:
                parts_list.append("".join(current).strip())
                current = []
            else:
                current.append(char)
        if current:
            parts_list.append("".join(current).strip())
            
        for p in parts_list:
            m = re.match(r'^(.*?)(?:\s*\((.*?)\))?$', p)
            if m:
                name = m.group(1).strip()
                origin = m.group(2).strip() if m.group(2) else ""
                authors.append({"name": name, "origin": origin})
        
        track_match = re.search(r'\*\*Track\(s\)\*\*: (.*?)\n', part)
        track = track_match.group(1).strip() if track_match else "Other"
        tracks = [t.strip() for t in track.split(',')]
        tracks = [t for t in tracks if t.lower() != 'free']
        if not tracks:
            tracks = ['Other']
        
        prompt_match = re.search(r'\*\*The GenAI Prompt:\*\*\n```text\n(.*?)\n```', part, re.DOTALL)
        base_prompt = prompt_match.group(1).strip() if prompt_match else ""
        
        new_apps.append({
            'categories': tracks,
            'title': title,
            'authors': authors,
            'index': index_start,
            'source': 'Develop 2026',
            'basePrompt': base_prompt
        })
        index_start += 1
        
    with open(ts_file, 'r', encoding='utf-8') as f:
        ts_content = f.read()
        
    # Find the original closing bracket of appData.
    # We will slice everything from index 35 onwards by finding the first instance of '    index: 34,\n  }),'
    marker = "    index: 34,\n  }),\n"
    idx = ts_content.find(marker)
    if idx != -1:
        start_of_new = idx + len(marker)
        # Find the next '];\n\nexport interface ResourceConstructorParams'
        end_idx = ts_content.find("];\n\nexport interface ResourceConstructorParams", start_of_new)
        if end_idx == -1:
            end_idx = ts_content.find("];\n\n\nexport interface ResourceConstructorParams", start_of_new)
        
        if end_idx != -1:
            ts_content = ts_content[:start_of_new] + ts_content[end_idx:]
    
    append_str = ""
    for app in new_apps:
        append_str += "  new ShowcaseApp({\n"
        cats_str = ", ".join([f"'{c}'" for c in app['categories']])
        append_str += f"    categories: [{cats_str}],\n"
        title_esc = app['title'].replace("'", "\\'")
        
        append_str += f"    title: '{title_esc}',\n"
        append_str += "    authors: [\n"
        for s in app['authors']:
            n_esc = s['name'].replace("'", "\\'")
            o_esc = s['origin'].replace("'", "\\'")
            append_str += f"      {{ name: '{n_esc}', origin: '{o_esc}' }},\n"
        append_str += "    ],\n"
        append_str += f"    index: {app['index']},\n"
        append_str += f"    source: 'Develop 2026',\n"
        
        if app['basePrompt']:
            # escape backticks and quotes just in case, though template literals are best
            # Let's use string.raw or backticks, but python escaping might be tricky.
            # Easiest is to escape backticks and use backticks in TS.
            prompt_esc = app['basePrompt'].replace("`", "\\`").replace("${", "\\${")
            append_str += f"    basePrompt: `{prompt_esc}`\n"
        
        append_str += "  }),\n"
        
    split_target = "];\n\n\nexport interface ResourceConstructorParams"
    if split_target in ts_content:
        ts_content = ts_content.replace(split_target, append_str + split_target)
    else:
        split_target2 = "];\n\nexport interface ResourceConstructorParams"
        if split_target2 in ts_content:
            ts_content = ts_content.replace(split_target2, append_str + split_target2)
        else:
            print("Could not find insertion point!")
            return
        
    with open(ts_file, 'w', encoding='utf-8') as f:
        f.write(ts_content)
        
    print(f"Re-appended {len(new_apps)} apps to appData with proper categories in data.tsx")

if __name__ == '__main__':
    main()
