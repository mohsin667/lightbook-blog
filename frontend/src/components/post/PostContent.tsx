import { Fragment } from 'react';
import { CodeBlock } from './CodeBlock';
import { InlineCode } from './InlineCode';

export interface PostContentProps {
  content: string;
}

type Block = { type: 'code'; lang: string; code: string } | { type: 'text'; text: string };

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
      .forEach((text) => blocks.push({ type: 'text', text }));

    blocks.push({ type: 'code', lang: (match[1] || 'plaintext').toLowerCase(), code: match[2].replace(/\n$/, '') });
    lastIndex = codeFence.lastIndex;
  }

  raw
    .slice(lastIndex)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((text) => blocks.push({ type: 'text', text }));

  return blocks;
}

function renderTextWithInlineCode(text: string) {
  const parts = text.split(/(`[^`\n]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
      return <InlineCode key={i}>{part.slice(1, -1)}</InlineCode>;
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
      {blocks.map((block, i) =>
        block.type === 'code' ? (
          <CodeBlock key={i} lang={block.lang} code={block.code} />
        ) : (
          <p key={i} className="mb-4 last:mb-0">
            {renderTextWithInlineCode(block.text)}
          </p>
        ),
      )}
    </div>
  );
}
