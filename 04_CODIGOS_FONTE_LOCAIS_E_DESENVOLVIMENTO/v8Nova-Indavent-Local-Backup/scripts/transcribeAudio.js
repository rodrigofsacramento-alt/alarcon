const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

// Check if OPENAI_API_KEY is available
if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY is missing in .env.local file");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const audioFilePath = process.argv[2];

  if (!audioFilePath) {
    console.error("Usage: node transcribeAudio.js <path-to-audio-file>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(audioFilePath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: File not found at ${resolvedPath}`);
    process.exit(1);
  }

  try {
    console.log(`Starting transcription for: ${resolvedPath}...`);
    
    // Call Whisper API
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(resolvedPath),
      model: 'whisper-1',
      response_format: 'text', // Can be 'json', 'text', 'srt', 'verbose_json', 'vtt'
    });

    console.log("\n--- Transcript ---");
    console.log(response);
    console.log("------------------\n");

    // Print JSON output for programmatic use if needed
    // console.log(JSON.stringify({ transcript: response }));
    
  } catch (error) {
    console.error("Error during transcription:", error.message || error);
    process.exit(1);
  }
}

main();
