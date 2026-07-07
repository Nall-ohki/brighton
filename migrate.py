import re

with open('data.tsx', 'r') as f:
    content = f.read()

# We only want to replace in the first 35 apps, which don't have 'source: Develop 2026'
# But actually, if we just replace description: -> title: and author: -> speakers: for everything that has author: it should be fine.

def replacer(match):
    desc = match.group(1)
    author = match.group(2)
    return f"title: {desc},\n    speakers: [{{ name: {author}, origin: 'DeepMind' }}]"

new_content = re.sub(
    r"description:\s*(.*?),\n\s*author:\s*(.*?),",
    replacer,
    content
)

# Also update the ShowcaseApp class
class_orig = """export type Speaker = {
  name: string;
  origin: string;
};

export type DeepMindCardInfo = {
  type: 'DeepMind';
  description: string;
  author: string;
};

export type DevelopCardInfo = {
  type: 'Develop';
  title: string;
  speakers: Speaker[];
};

export type CardInfo = DeepMindCardInfo | DevelopCardInfo;

export class ShowcaseApp {
  id: string;
  category: string;
  categories: string[];
  url: string | null;
  source: 'DeepMind' | 'Develop 2026';
  basePrompt?: string;
  cardInfo: CardInfo;

  constructor({ category, categories, description, author, title, speakers, url, index, source = 'DeepMind', basePrompt }: any) {
    this.id = `app-${index}`;
    this.categories = categories || (category ? [category] : ['Other']);
    this.category = this.categories[0];
    this.url = url || null;
    this.source = source;
    this.basePrompt = basePrompt;
    
    if (this.source === 'DeepMind') {
      this.cardInfo = {
        type: 'DeepMind',
        description: description,
        author: author,
      };
    } else {
      this.cardInfo = {
        type: 'Develop',
        title: title || description,
        speakers: speakers || [],
      };
    }
  }
}"""

class_new = """export type Speaker = {
  name: string;
  origin: string;
};

export type CardInfo = {
  title: string;
  speakers: Speaker[];
};

export class ShowcaseApp {
  id: string;
  category: string;
  categories: string[];
  url: string | null;
  source: 'DeepMind' | 'Develop 2026';
  basePrompt?: string;
  cardInfo: CardInfo;

  constructor({ category, categories, title, speakers, url, index, source = 'DeepMind', basePrompt }: any) {
    this.id = `app-${index}`;
    this.categories = categories || (category ? [category] : ['Other']);
    this.category = this.categories[0];
    this.url = url || null;
    this.source = source;
    this.basePrompt = basePrompt;
    
    this.cardInfo = {
      title: title,
      speakers: speakers || [],
    };
  }
}"""

new_content = new_content.replace(class_orig, class_new)

with open('data.tsx', 'w') as f:
    f.write(new_content)

print("Done")
