import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { createSupabaseRestClient } from '@/lib/supabase/rest-client';
import { embed } from '@/lib/voyage/client';

type VaultChunkRow = Record<string, unknown> & {
  id?: string;
  doc_path: string;
  heading: string;
  content: string;
  stage_scope: number[];
  embedding: number[];
};

type ParsedChunk = {
  doc_path: string;
  heading: string;
  content: string;
  stage_scope: number[];
};

const vaultRoot = path.resolve(process.cwd(), 'lantern_research');

const stageScopes: Record<string, number[]> = {
  'stages/00 - Before diagnosis and early signs.md': [1],
  'stages/01 - Early stage.md': [1],
  'stages/02 - Middle stage.md': [2],
  'stages/03 - Late stage.md': [3],
};

async function findMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findMarkdownFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

function documentTitle(markdown: string, filePath: string): string {
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return title || path.basename(filePath, '.md');
}

function parseChunks(markdown: string, filePath: string): ParsedChunk[] {
  const title = documentTitle(markdown, filePath);
  const relativePath = path.relative(vaultRoot, filePath).split(path.sep).join('/');
  const stageScope = stageScopes[relativePath] ?? [1, 2, 3];
  const headings = Array.from(markdown.matchAll(/^##\s+(.+?)\s*$/gm));

  if (headings.length === 0) {
    return [
      {
        doc_path: relativePath,
        heading: title,
        content: `Document: ${title}\n\n${markdown.trim()}`,
        stage_scope: stageScope,
      },
    ];
  }

  return headings.map((headingMatch, index) => {
    const start = headingMatch.index ?? 0;
    const end = headings[index + 1]?.index ?? markdown.length;
    const heading = headingMatch[1].trim();
    const section = markdown.slice(start, end).trim();

    return {
      doc_path: relativePath,
      heading,
      content: `Document: ${title}\n\n${section}`,
      stage_scope: stageScope,
    };
  });
}

async function indexChunk(chunk: ParsedChunk): Promise<void> {
  const [embedding] = await embed([chunk.content], 'document');
  const supabase = createSupabaseRestClient();
  const values = { ...chunk, embedding };
  const { error } = await supabase.from<VaultChunkRow>('vault_chunks').upsert(values, { onConflict: 'doc_path,heading' });

  if (error) {
    throw new Error(`Failed to index ${chunk.doc_path}#${chunk.heading}: ${error.message}`);
  }
}

async function main(): Promise<void> {
  const files = await findMarkdownFiles(vaultRoot);
  let totalChunks = 0;

  for (const filePath of files) {
    const markdown = await readFile(filePath, 'utf8');
    const chunks = parseChunks(markdown, filePath);

    for (const chunk of chunks) {
      await indexChunk(chunk);
    }

    totalChunks += chunks.length;
    console.log(`${path.relative(process.cwd(), filePath)}: ${chunks.length} chunks`);
  }

  console.log(`Done: indexed ${files.length} files and ${totalChunks} chunks`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
