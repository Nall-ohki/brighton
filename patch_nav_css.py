import re

with open("index.css", "r") as f:
    css = f.read()

# 1. Update #root
css = re.sub(r'(#root\s*\{[^}]*)padding:\s*2rem;', r'\1padding: 6rem 2rem 2rem 2rem;', css)

# 2. Update .theme-switcher (remove absolute positioning)
css = re.sub(r'(\.theme-switcher\s*\{[^}]*)position:\s*absolute;[\s\n]*top:\s*1\.5rem;[\s\n]*right:\s*2rem;', r'\1', css)
css = css.replace('background-color: var(--subtle-hover-bg);', 'background-color: rgba(255,255,255,0.2);')

# 3. Replace .main-nav entirely
new_nav = """
.main-nav {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  background-color: #1976d2;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 2rem;
  height: 4rem;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-center {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.nav-right {
  display: flex;
  justify-content: flex-end;
}
"""
css = re.sub(r'\.main-nav\s*\{.*?\}(?=\s*\.app-title)', new_nav, css, flags=re.DOTALL)

# Update .app-title
css = css.replace("margin-right: auto;", "")
css = css.replace("color: var(--text-primary);", "color: white;")

# Update .main-nav button
# We need to change the color of nav buttons
css = css.replace("color: var(--text-secondary);", "color: rgba(255, 255, 255, 0.7);")
css = css.replace("color: var(--text-primary);", "color: white;")

with open("index.css", "w") as f:
    f.write(css)
