import re

with open("index.tsx", "r") as f:
    content = f.read()

# Remove the ThemeSwitcher from above the nav
content = content.replace("<ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />\\n      <nav", "<nav")

# Replace nav start to add nav-left and nav-center
nav_start = """      <nav className="main-nav">
        <div className="nav-left">
          <svg className="app-icon" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 2L2 7l2 11.5L12 22l8-3.5L22 7l-10-5zm0 2.2l7.5 3.8-1.5 8.5L12 19.5 6 16.5 4.5 8 12 4.2z" />
          </svg>
          <div className="app-title">Develop: Brighton Vibe Coding Session</div>
        </div>
        <div className="nav-center">"""

old_nav_start = """      <nav className="main-nav">
        <div className="app-title">Develop: Brighton Vibe Coding Session</div>"""
        
content = content.replace(old_nav_start, nav_start)

# Add nav-right inside nav, before closing nav
nav_right = """        </div>
        <div className="nav-right">
          <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
        </div>
      </nav>"""
content = content.replace("      </nav>", nav_right)

with open("index.tsx", "w") as f:
    f.write(content)

