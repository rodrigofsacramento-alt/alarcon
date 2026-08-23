import { GoogleGenAI } from '@google/genai';
import { saveKnowledge } from './fileSystem.js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Ingests raw text, extracts structured knowledge using Gemini, and saves it to the Obsidian Vault.
 * @param {string} rawText - The unformatted, raw knowledge to be processed.
 */
export async function ingestKnowledge(rawText) {
  const prompt = `Você é um Engenheiro de Conhecimento Zettelkasten. Analise o seguinte texto bruto e extraia um conhecimento atômico.
  Você DEVE retornar APENAS um JSON válido e puro (sem blocos de código markdown) com a seguinte estrutura:
  {
    "title": "Titulo-Do-Conceito-Usando-Hifens",
    "summary": "Breve resumo do que se trata",
    "tags": ["#backend", "#ai", etc],
    "category": "07_Inteligencia_Artificial",
    "markdown_content": "# 📝 Título\n\nConteúdo explicativo. **MANDATÓRIO**: cite outros nós se possível usando [[Nome-Do-No]]."
  }

  Texto Bruto:
  ${rawText}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text);
    
    // Save to the file system and update index
    await saveKnowledge(result);
    console.log(`✅ Conhecimento ingerido com sucesso: ${result.title}`);
    
    return result;
  } catch (error) {
    console.error('❌ Erro na ingestão do conhecimento:', error);
    throw error;
  }
}
