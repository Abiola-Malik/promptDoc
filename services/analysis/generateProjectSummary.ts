import { ai } from "@/lib/gemini";
import { ExtractedFile } from "../extract/extraction.types";

export async function generateProjectSummary(
  files: ExtractedFile[],
  meta: Record<string, unknown>
): Promise<string | undefined> {
  try {
    const fileList = files
      .map((f) => {
        const snippet = f.content ? f.content.substring(0, 200) : "No content";
        return `${f.filename}: ${snippet}`;
      })
      .join("\n");

    const prompt = `
You are an expert AI code analyst.

Summarize the entire project in **3–5 concise sentences**.
Explain:
- what type of project it is  
- what the main structure is  
- what tools/frameworks are in use  
- any notable patterns or components  

Project Files:
${fileList}

Metadata:
${JSON.stringify(meta, null, 2)}
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [prompt],
    });

    return response.text?.trim();
  } catch (error) {
    console.error("Summary generation failed:", error);
    throw new Error("Failed to generate project summary");
  }
}
