import { ai } from "@/lib/gemini";
import { SYSTEM_PROMPT } from "@/lib/gemini/systemPrompt";
import { Pinecone } from "@pinecone-database/pinecone";

export async function generateDocumentation(
  projectId: string,
  userQuery: string,
  pineconeIndex: ReturnType<Pinecone["index"]>
): Promise<string> {
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

  // Search Pinecone for similar code chunks
  const searchResults = await pineconeIndex.query({
    vector: queryVector,
    topK: 5,
    filter: { projectId },
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
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${SYSTEM_PROMPT}

${context}

${userQuery}

Generate the documentation:`,
          },
        ],
      },
    ],
  });

  return response.text || "No documentation generated.";
}
