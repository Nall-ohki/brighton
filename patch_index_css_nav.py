import re

with open('index.css', 'r') as f:
    css = f.read()

# 1. Update .category-tag-- classes to define --tag-color
def repl(m):
    bg_color = m.group(2)
    return m.group(1) + f" --tag-color: {bg_color};"
css = re.sub(r'(\.category-tag--[\w-]+\s*\{\s*background-color:\s*(.*?);)', repl, css)

# 2. Add .category-tag--inverse
inverse_css = """
.category-tag--inverse {
  background-color: transparent !important;
  color: var(--tag-color, var(--text-primary)) !important;
  border: 1px solid var(--tag-color, var(--border-color)) !important;
}
"""
if ".category-tag--inverse {" not in css:
    css += inverse_css

# 3. textarea height
css = css.replace("min-height: 120px;", "min-height: 240px;")

# 4. .synthesized-prompt overflow
css = css.replace("  flex-grow: 1;\n", "  flex-grow: 1;\n  overflow-y: auto;\n")
# Fix potential accidental replacements by restoring .card
css = css.replace(".card {\n  display: flex;\n  flex-direction: column;\n  border: 1px solid var(--border-color);\n  border-radius: 12px;\n  background-color: var(--card-background);\n  overflow: hidden;\n  flex-grow: 1;\n  overflow-y: auto;\n", ".card {\n  display: flex;\n  flex-direction: column;\n  border: 1px solid var(--border-color);\n  border-radius: 12px;\n  background-color: var(--card-background);\n  overflow: hidden;\n  flex-grow: 1;\n")

# 5. Update #root
css = re.sub(r'(#root\s*\{[^}]*)padding:\s*2rem;', r'\1padding: 6rem 2rem 2rem 2rem;', css)

# 6. Update .theme-switcher (remove absolute positioning)
css = re.sub(r'(\.theme-switcher\s*\{[^}]*)position:\s*absolute;[\s\n]*top:\s*1\.5rem;[\s\n]*right:\s*2rem;', r'\1', css)
css = css.replace('.theme-switcher {\n  width: 3rem;', '.theme-switcher {\n  position: relative;\n  width: 3rem;')
# Make theme switcher stand out on blue
css = re.sub(r'(\.theme-switcher\s*\{[^}]*)background-color:\s*var\(--subtle-hover-bg\);', r'\1background-color: rgba(255,255,255,0.2);', css)
css = re.sub(r'(\.theme-switcher\s*\{[^}]*)border:\s*1px solid var\(--border-color\);', r'\1border: 1px solid rgba(255,255,255,0.4);', css)


# 7. Replace .main-nav entirely
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

.app-icon {
  color: white;
}

.app-title {
  font-weight: 700;
  font-size: 1.25rem;
  color: white;
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
css = re.sub(r'\.main-nav\s*\{.*?\}(?=\s*\.main-nav button)', new_nav, css, flags=re.DOTALL)

# 8. Update .main-nav button styles specifically
# Search and replace inside the block for .main-nav button and .main-nav button:hover
def button_repl(m):
    block = m.group(0)
    block = block.replace("color: var(--text-secondary);", "color: rgba(255, 255, 255, 0.7);")
    block = block.replace("color: var(--text-primary);", "color: white;")
    block = block.replace("color: var(--accent-color);", "color: white;")
    block = block.replace("border-bottom-color: var(--accent-color);", "border-bottom-color: white;")
    return block

css = re.sub(r'\.main-nav button\s*\{[^}]+\}', button_repl, css)
css = re.sub(r'\.main-nav button:hover\s*\{[^}]+\}', button_repl, css)
css = re.sub(r'\.main-nav button\.active\s*\{[^}]+\}', button_repl, css)


with open('index.css', 'w') as f:
    f.write(css)
