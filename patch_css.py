import re

with open("index.css", "r") as f:
    content = f.read()

# find .synthesized-prompt block and add overflow-y: auto
# flex-grow: 1; -> flex-grow: 0.8; (doesn't hurt, but spacer does the real work)
content = content.replace("  flex-grow: 1;\n", "  flex-grow: 1;\n  overflow-y: auto;\n")

with open("index.css", "w") as f:
    f.write(content)
