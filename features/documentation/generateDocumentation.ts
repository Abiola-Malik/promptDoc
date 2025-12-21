import { ai } from "@/lib/gemini";
import { CHAT_SYSTEM_PROMPT, SYSTEM_PROMPT } from "@/lib/gemini/systemPrompt";
import { Pinecone } from "@pinecone-database/pinecone";

export async function generateDocumentation(
  projectId: string,
  userQuery: string,
  intent: string,
  pineconeIndex: ReturnType<Pinecone["index"]>,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const systemPrompt =
    intent === "generate documentation" ? SYSTEM_PROMPT : CHAT_SYSTEM_PROMPT;
  // Embed the user's query
  const queryEmbedding = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: [
      {
        role: "user",
        parts: [{ text: userQuery }],
      },
    ],
  });

  const queryVector = queryEmbedding?.embeddings?.[0]?.values;

  if (!queryVector) {
    throw new Error("Failed to embed query");
  }

  const namespace = pineconeIndex.namespace(projectId);
  // Search Pinecone for similar code chunks
  const searchResults = await namespace.query({
    vector: queryVector,
    topK: 10,
    includeMetadata: true,
  });

  // Build context from relevant chunks
  const context = searchResults.matches
    .filter(
      (match) =>
        match.metadata?.content && typeof match.metadata.content === "string"
    )
    .map(
      (match, i) => `
=== Code Snippet ${i + 1} (${match.metadata?.filename}) ===
Lines ${match.metadata?.startLine}-${match.metadata?.endLine}
${String(match.metadata?.content).slice(0, 5000)}
`
    )
    .join("\n\n");
  // Generate documentation with Gemini
  const response = await ai.models.generateContentStream({
    model: "gemini-2.0-flash",
    // generationConfig: {
    //   responseMimeType: "text/plain",
    // },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${systemPrompt}

${context}

${userQuery}

          ${
            intent === "generate documentation"
              ? "Generate the documentation"
              : "Answer the question."
          }:`,
          },
        ],
      },
    ],
  });

  let fullText = "";
  for await (const chunk of response) {
    const chunkText = chunk.text;
    if (chunkText) {
      fullText += chunkText;
      onChunk?.(chunkText); // Call the callback with each chunk
    }
  }

  return fullText || "No documentation generated.";
}
