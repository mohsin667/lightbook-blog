import { Fragment } from 'react';
import { CodeBlock } from './CodeBlock';
import { InlineCode } from './InlineCode';

export interface PostContentProps {
  content: string;
}

type Block =
  | { type: 'code'; lang: string; code: string }
  | { type: 'heading'; level: 1 | 2 | 3 | 4; text: string }
  | { type: 'text'; text: string };

// Splits a chunk of text (already known to contain no blank lines, since
// paragraphs are separated on blank lines before this runs) into heading
// blocks and plain-text blocks. Consecutive non-heading lines are grouped
// back into a single text block so existing <br/> line-break behavior
// inside a paragraph is preserved.
function splitHeadings(chunk: string): Block[] {
  const blocks: Block[] = [];
  const lines = chunk.split('\n');
  let textLines: string[] = [];

  const flushText = () => {
    if (textLines.length) {
      blocks.push({ type: 'text', text: textLines.join('\n') });
      textLines = [];
    }
  };

  for (const line of lines) {
    const headingMatch = /^(#{1,4})\s+(.*)$/.exec(line.trim());
    if (headingMatch) {
      flushText();
      const level = headingMatch[1].length as 1 | 2 | 3 | 4;
      blocks.push({ type: 'heading', level, text: headingMatch[2].trim() });
    } else {
      textLines.push(line);
    }
  }
  flushText();

  return blocks;
}

function parseContent(raw: string): Block[] {
  if (!raw || !raw.trim()) return [{ type: 'text', text: 'Nothing written yet.' }];

  const blocks: Block[] = [];
  const codeFence = /```([\w+-]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeFence.exec(raw))) {
    const before = raw.slice(lastIndex, match.index);
    before
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((text) => blocks.push(...splitHeadings(text)));

    blocks.push({ type: 'code', lang: (match[1] || 'plaintext').toLowerCase(), code: match[2].replace(/\n$/, '') });
    lastIndex = codeFence.lastIndex;
  }

  raw
    .slice(lastIndex)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((text) => blocks.push(...splitHeadings(text)));

  return blocks;
}

const HEADING_CLASSES: Record<1 | 2 | 3 | 4, string> = {
  1: 'text-[28px] font-bold mt-10 mb-4 first:mt-0',
  2: 'text-[23px] font-bold mt-9 mb-3.5 first:mt-0',
  3: 'text-[19px] font-semibold mt-7 mb-3 first:mt-0',
  4: 'text-[17px] font-semibold mt-6 mb-2.5 first:mt-0',
};

// Matches inline code spans and **bold** spans so both can be styled while
// leaving the rest of the text (and existing line-break handling) intact.
function renderTextWithInlineCode(text: string) {
  const parts = text.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
      return <InlineCode key={i}>{part.slice(1, -1)}</InlineCode>;
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 3) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part.split('\n').map((line, j, arr) => (
      <Fragment key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </Fragment>
    ));
  });
}

export function PostContent({ content }: PostContentProps) {
  const blocks = parseContent(content);
  return (
    <div className="text-[16.5px] leading-[1.85]">
      {blocks.map((block, i) => {
        if (block.type === 'code') {
          return <CodeBlock key={i} lang={block.lang} code={block.code} />;
        }
        if (block.type === 'heading') {
          const Tag = (`h${block.level}` as unknown) as 'h1' | 'h2' | 'h3' | 'h4';
          return (
            <Tag key={i} className={HEADING_CLASSES[block.level]}>
              {renderTextWithInlineCode(block.text)}
            </Tag>
          );
        }
        return (
          <p key={i} className="mb-4 last:mb-0">
            {renderTextWithInlineCode(block.text)}
          </p>
        );
      })}
    </div>
  );
}
