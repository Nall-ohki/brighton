import re
import json
import os
import glob

def main():
    md_file = "docs/vibe-coding-prompts-brighton-2026.md"
    
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    parts = content.split('#### 🎬 ')
    
    apps_data = {}
    
    index_start = 35 # Last index was 34
    
    for i, part in enumerate(parts[1:]):
        app_id = f"app-{index_start + i}"
        
        # Title
        title_line = part.split('\n')[0]
        title = title_line.strip()
        
        # Authors
        author_match = re.search(r'\*\*Speaker\(s\)\*\*: (.*?)\n', part)
        author_str = author_match.group(1).strip() if author_match else ""
        
        authors = []
        if author_str:
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
        
        # Base Prompt
        prompt_match = re.search(r'\*\*The GenAI Prompt:\*\*\s*```text\s*(.*?)\s*```', part, re.DOTALL)
        prompt = prompt_match.group(1).strip() if prompt_match else ""
        
        # Description
        # Description is between **Description:** and **Key Takeaways:** or </details>
        desc_match = re.search(r'\*\*Description:\*\*\s*(.*?)(?=\*\*Key Takeaways:\*\*|</details>)', part, re.DOTALL)
        desc = desc_match.group(1).strip() if desc_match else ""
        
        # Takeaways
        takeaways_match = re.search(r'\*\*Key Takeaways:\*\*(.*?)(?=</details>)', part, re.DOTALL)
        takeaways = []
        if takeaways_match:
            lines = takeaways_match.group(1).strip().split('\n')
            for line in lines:
                line = line.strip()
                if line.startswith('- '):
                    takeaways.append(line[2:])
        
        apps_data[app_id] = {
            "title": title,
            "authors": authors,
            "description": desc,
            "session_takeaway": takeaways,
            "prompt": prompt
        }
    
    # Now write to all the metadata.json files!
    for app_id, data in apps_data.items():
        # Write to src folder
        src_meta = f"examples/{app_id}/public/metadata.json"
        if os.path.exists(f"examples/{app_id}/public"):
            with open(src_meta, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
                
        # Write to built public folder
        pub_meta = f"public/examples/{app_id}/metadata.json"
        if os.path.exists(f"public/examples/{app_id}"):
            with open(pub_meta, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)

if __name__ == "__main__":
    main()
