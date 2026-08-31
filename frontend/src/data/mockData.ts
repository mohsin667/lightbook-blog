export interface Comment {
  author: string;
  text: string;
  createdAt: number;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string; // markdown-ish: blank-line paragraphs, ```lang fenced code blocks, `inline code`
  category: string;
  authorId: string;
  image: string;
  status: 'published' | 'draft' | 'flagged';
  createdAt: number; // epoch ms
  views: number;
  likes: number;
  flagCount: number;
  comments: Comment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  role: 'user' | 'admin';
  status: 'active' | 'restricted';
  joinedAt: string; // 'YYYY-MM-DD'
}

export interface Category {
  name: string;
  icon: string; // lucide icon name
}

const now = Date.now();
const day = 86400000;

export const categories: Category[] = [
  { name: 'Travel', icon: 'Plane' },
  { name: 'Food', icon: 'Soup' },
  { name: 'Design', icon: 'Palette' },
  { name: 'Life', icon: 'Sun' },
  { name: 'Tech', icon: 'Laptop' },
];

export const users: User[] = [
  {
    id: 'u1',
    name: 'You',
    email: 'you@lightbook.info',
    bio: 'Writing about design, mostly for myself.',
    role: 'user',
    status: 'active',
    joinedAt: '2026-02-10',
  },
  {
    id: 'u2',
    name: 'Maya Chen',
    email: 'maya@lightbook.info',
    bio: 'Slow travel and street food.',
    role: 'user',
    status: 'active',
    joinedAt: '2025-11-02',
  },
  {
    id: 'u3',
    name: 'Jonas Kim',
    email: 'jonas@lightbook.info',
    bio: 'Opinions about pasta and pixels.',
    role: 'user',
    status: 'active',
    joinedAt: '2025-09-18',
  },
  {
    id: 'u4',
    name: 'Priya Nair',
    email: 'priya@lightbook.info',
    bio: 'Product designer, plant parent. Keeps the lights on around here.',
    role: 'admin',
    status: 'active',
    joinedAt: '2026-01-05',
  },
];

export const posts: Post[] = [
  {
    id: 'p1',
    title: 'Getting lost in Lisbon on purpose',
    excerpt: "A wandering guide to the city's hills, tiles and tram tracks.",
    content: `Lisbon rewards the traveler who throws away the map.

I spent four days deliberately taking the wrong turn on every street, and it worked out better than any itinerary I've ever planned. The Alfama district in particular is built for this kind of aimless walking, its alleys narrow enough that you're never quite sure if you're in someone's courtyard.

The trams are slow, loud, and absolutely worth riding just for the sake of it. Tram 28 is the famous one, but the smaller, quieter routes through Graça felt more honest.

Eat the pastel de nata warm. Not lukewarm. Warm, straight from the tray, with cinnamon dusted on top before you even sit down.`,
    category: 'Travel',
    authorId: 'u2',
    image: 'https://picsum.photos/seed/lisbon-travel/900/600',
    status: 'published',
    createdAt: now - 9 * day,
    views: 412,
    likes: 38,
    flagCount: 0,
    comments: [{ author: 'Jonas Kim', text: 'Now I want a pastel de nata', createdAt: now - 8 * day }],
  },
  {
    id: 'p2',
    title: 'Five pasta shapes worth the effort',
    excerpt: 'Why hand-rolled beats store-bought, and which shapes to start with.',
    content: `Not every pasta shape needs to be made by hand, but five of them are so much better fresh that it's worth the flour on your counter.

Cavatelli are the most forgiving place to start — just a thumb and a rolled rope of dough. Orecchiette come next, slightly trickier but nearly foolproof once your hands learn the motion.

Tagliatelle is where a pasta machine starts to earn its keep, though a rolling pin and patience will get you there too.

The two that separate the curious from the committed are garganelli and, honestly, a properly laminated lasagna sheet. Both take an afternoon. Both are worth it exactly once a season.`,
    category: 'Food',
    authorId: 'u3',
    image: 'https://picsum.photos/seed/pasta-food/900/600',
    status: 'published',
    createdAt: now - 6 * day,
    views: 298,
    likes: 52,
    flagCount: 0,
    comments: [],
  },
  {
    id: 'p3',
    title: 'Color theory for non-designers',
    excerpt: 'The three rules I actually use, minus the jargon.',
    content: `Most color theory content is written for people who already think in hex codes. Here's the version for everyone else.

First: pick one color and let it do most of the work. A second color is a supporting actor, not a co-star.

Second: neutral backgrounds make colors louder, not quieter. A bright accent on cream reads bolder than the same accent on white.

Third: if you're unsure, steal a palette from a photo you like and only use it there. Real photographs already solved the hard part for you.

A quick way to check a palette before you commit to it:

\`\`\`css
.accent {
  color: var(--coral);
  background: var(--surface-tint);
}
\`\`\`

If that still reads clearly on both light and dark backgrounds, it's probably fine.`,
    category: 'Design',
    authorId: 'u4',
    image: 'https://picsum.photos/seed/design-color/900/600',
    status: 'published',
    createdAt: now - 4 * day,
    views: 521,
    likes: 71,
    flagCount: 0,
    comments: [{ author: 'You', text: 'The photo trick is so underrated', createdAt: now - 3 * day }],
  },
  {
    id: 'p4',
    title: 'A slow morning routine that stuck',
    excerpt: 'No 5am wake-up, no cold plunge. Just the two habits that lasted.',
    content: `I've tried the elaborate morning routines. They lasted about nine days each.

What actually stuck was smaller: making coffee without looking at my phone, and writing three sentences about the day ahead before opening anything else.

That's it. No cold plunge, no hour of reading. Just enough quiet to start the day on my own terms instead of a notification's.`,
    category: 'Life',
    authorId: 'u2',
    image: 'https://picsum.photos/seed/morning-life/900/600',
    status: 'published',
    createdAt: now - 3 * day,
    views: 187,
    likes: 29,
    flagCount: 0,
    comments: [],
  },
  {
    id: 'p5',
    title: 'A weekend in the Scottish highlands',
    excerpt: "Rain, single-track roads, and the best view I didn't plan for.",
    content: `The forecast said rain for all three days, and the forecast was right. It didn't matter.

The single-track roads through Glencoe are slow by design, which turns out to be the entire point. You're not supposed to hurry through this.

The best view of the whole trip wasn't a landmark at all. It was a lay-by we pulled into because a sheep was blocking the road, and the clouds happened to break for four minutes exactly.`,
    category: 'Travel',
    authorId: 'u1',
    image: 'https://picsum.photos/seed/highlands-travel/900/600',
    status: 'published',
    createdAt: now - 2 * day,
    views: 143,
    likes: 19,
    flagCount: 0,
    comments: [],
  },
  {
    id: 'p6',
    title: 'A small script for renaming photo dumps',
    excerpt: 'The ten-line tool I use after every trip.',
    content: `Every trip ends with a folder of two hundred badly-named photos. This is the script I run before I even look at them.

\`\`\`js
const fs = require('fs');

fs.readdirSync('./dump').forEach((file, i) => {
  const ext = file.split('.').pop();
  const name = \`photo-\${String(i).padStart(3, '0')}.\${ext}\`;
  fs.renameSync(\`./dump/\${file}\`, \`./dump/\${name}\`);
});
\`\`\`

Nothing clever, just enough to make the folder sortable by the time I actually got around to editing anything. Wrap file paths in \`backticks\` if you're pasting this into a README, since some shells treat them specially.`,
    category: 'Tech',
    authorId: 'u1',
    image: 'https://picsum.photos/seed/photo-script-tech/900/600',
    status: 'published',
    createdAt: now - 1.2 * day,
    views: 231,
    likes: 24,
    flagCount: 0,
    comments: [{ author: 'Maya Chen', text: 'Stealing this immediately', createdAt: now - 1 * day }],
  },
  {
    id: 'p7',
    title: 'Why I started writing again',
    excerpt: 'A short note on starting a blog after a five year break.',
    content: `I used to write constantly, then stopped for about five years for reasons that seemed important at the time and now mostly don't.

This blog is the restart. No promises about consistency yet, just a place to put things down.`,
    category: 'Life',
    authorId: 'u1',
    image: 'https://picsum.photos/seed/writing-desk/900/600',
    status: 'draft',
    createdAt: now - 1 * day,
    views: 0,
    likes: 0,
    flagCount: 0,
    comments: [],
  },
  {
    id: 'p8',
    title: 'Notes on a design system nobody asked for',
    excerpt: 'A draft I keep coming back to and not finishing.',
    content: `Draft in progress — thoughts on building a personal design system for side projects.

Tokens first, components second. I keep relearning this every time I skip it.`,
    category: 'Design',
    authorId: 'u1',
    image: 'https://picsum.photos/seed/design-system/900/600',
    status: 'draft',
    createdAt: now - 0.5 * day,
    views: 0,
    likes: 0,
    flagCount: 0,
    comments: [],
  },
  {
    id: 'p9',
    title: 'Hot take: pineapple belongs on pizza',
    excerpt: 'A controversial opinion that got a little too much attention.',
    content: `I said what I said. Sweet and salty is a legitimate flavor combination and I will not be taking questions.`,
    category: 'Food',
    authorId: 'u3',
    image: 'https://picsum.photos/seed/pizza-food/900/600',
    status: 'flagged',
    createdAt: now - 1.5 * day,
    views: 340,
    likes: 12,
    flagCount: 3,
    comments: [{ author: 'Priya Nair', text: 'This is a personal attack', createdAt: now - 1 * day }],
  },
];

export const featuredPostId = 'p1';

export const CURRENT_USER_ID = 'u1';

export function currentUser(): User {
  return users.find((u) => u.id === CURRENT_USER_ID)!;
}

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getPostById(id: string): Post | undefined {
  return posts.find((p) => p.id === id);
}

export function getCategory(name: string): Category {
  return categories.find((c) => c.name === name) || { name, icon: 'Tag' };
}

export function readTime(text: string): string {
  const words = (text || '').split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 180))} min read`;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const d = Math.floor(diff / day);
  if (d < 1) return 'today';
  if (d === 1) return '1 day ago';
  if (d < 30) return `${d} days ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
