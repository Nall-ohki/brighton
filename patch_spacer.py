import re

with open("prompt_builder.tsx", "r") as f:
    content = f.read()

# find </pre>
# and add <div style={{ flexGrow: 0.25 }}></div> right after it
new_spacer = """          </pre>
          <div style={{ flexGrow: 0.25 }}></div>"""

content = content.replace("          </pre>", new_spacer)

with open("prompt_builder.tsx", "w") as f:
    f.write(content)
