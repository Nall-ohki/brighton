import re

with open('index.css', 'r') as f:
    css = f.read()

# 1. Update .main-nav background and border
new_main_nav = r"""
.main-nav {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  background: linear-gradient(135deg, #1976d2 0%, #311b92 100%);
  border-bottom: 4px solid;
  border-image: linear-gradient(90deg, #ff007a, #7a00ff, #00e5ff, #00ff7a) 1;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 2rem;
  height: 4.5rem;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
"""
css = re.sub(r'\.main-nav\s*\{.*?\}(?=\s*\.nav-left)', new_main_nav.strip() + "\n", css, flags=re.DOTALL)

# 2. Update .app-icon color
css = css.replace(".app-icon {\n  color: white;\n}", ".app-icon {\n  color: #00e5ff;\n  filter: drop-shadow(0 0 6px rgba(0,229,255,0.4));\n}")

# 3. Update .main-nav button active color
def button_repl(m):
    block = m.group(0)
    block = block.replace("color: white;", "color: #00e5ff;\n  text-shadow: 0 0 8px rgba(0,229,255,0.4);")
    block = block.replace("border-bottom-color: white;", "border-bottom-color: #00e5ff;\n  box-shadow: 0 2px 4px rgba(0,229,255,0.2);")
    return block
css = re.sub(r'\.main-nav button\.active\s*\{[^}]+\}', button_repl, css)

# Make sure normal buttons have a transparent border-bottom and the active box-shadow is valid (it is)
# Actually, wait, box-shadow on border-bottom-color? No, box-shadow applies to the whole element. 
# It's better to just use color and border-bottom-color, and text-shadow.
# Let's fix button_repl
def button_repl_fixed(m):
    block = m.group(0)
    # The active state previously had:
    # color: white;
    # border-bottom-color: white;
    return """.main-nav button.active {
  color: #00e5ff;
  border-bottom-color: #00e5ff;
  text-shadow: 0 0 8px rgba(0,229,255,0.4);
}"""
css = re.sub(r'\.main-nav button\.active\s*\{[^}]+\}', button_repl_fixed, css)


# 4. Make .main-nav button hover more vibrant
def button_hover_repl(m):
    return """.main-nav button:hover {
  color: #00e5ff;
}"""
css = re.sub(r'\.main-nav button:hover\s*\{[^}]+\}', button_hover_repl, css)


with open('index.css', 'w') as f:
    f.write(css)
