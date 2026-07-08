import re

with open("index.tsx", "r") as f:
    content = f.read()

# 1. Change "Develop: Brighton 2026 Information" to "Information" inside the button
content = content.replace(">\\n          Develop: Brighton 2026 Information\\n        </button>", ">\\n          Information\\n        </button>")

# 2. Add the title bar in nav
nav_start = '<nav className="main-nav">\\n'
title_bar = '        <div className="app-title">Develop: Brighton Vibe Coding Session</div>\\n'

content = content.replace(nav_start, nav_start + title_bar)

with open("index.tsx", "w") as f:
    f.write(content)
