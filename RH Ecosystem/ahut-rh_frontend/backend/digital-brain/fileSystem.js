import fs from 'node:fs/promises';
import path from 'node:path';

// Define the root of the Obsidian knowledge vault
const KNOWLEDGE_DIR = path.resolve(process.cwd(), '../../knowledge');
const INDEX_FILE = path.join(KNOWLEDGE_DIR, 'INDEX_MESTRE_OBSIDIAN.md');

/**
 * Formats the extracted knowledge into a Markdown string with YAML frontmatter.
 */
function formatMarkdown(data) {
  return `---
title: ${data.title}
summary: "${data.summary}"
category: ${data.category}
---
${data.markdown_content}

**Tags:** ${data.tags.join(' ')}
`;
}

/**
 * Saves the new knowledge to the filesystem and appends it to the Master Index.
 */
export async function saveKnowledge(data) {
  try {
    // Ensure the knowledge directory exists
    await fs.mkdir(KNOWLEDGE_DIR, { recursive: true });

    const fileName = `${data.title}.md`;
    const filePath = path.join(KNOWLEDGE_DIR, fileName);

    // 1. Write the markdown file
    const content = formatMarkdown(data);
    await fs.writeFile(filePath, content, 'utf-8');

    // 2. Update the INDEX_MESTRE_OBSIDIAN.md file
    let indexContent = '';
    try {
      indexContent = await fs.readFile(INDEX_FILE, 'utf-8');
    } catch (e) {
      // If index doesn't exist, start a new one
      indexContent = '# 🧠 INDEX MESTRE\n\n';
    }

    // Check if the category exists in the index
    const categoryHeader = `## ${data.category}`;
    if (indexContent.includes(categoryHeader)) {
      // Append the new link below the existing category
      const linkString = `- [[${data.title}]]\n`;
      indexContent = indexContent.replace(
        categoryHeader,
        `${categoryHeader}\n${linkString}`
      );
    } else {
      // Create new category and append link
      indexContent += `\n${categoryHeader}\n- [[${data.title}]]\n`;
    }

    await fs.writeFile(INDEX_FILE, indexContent, 'utf-8');

  } catch (error) {
    console.error('❌ Erro ao salvar o arquivo no disco:', error);
    throw error;
  }
}
