// test-pinecone.ts - Run this separately to debug
import { index } from "../db/pinecone/index";
async function testPineconeUpload() {
  const testVector = {
    id: "test-123",
    values: Array(768).fill(0.1), // Mock embedding
    metadata: {
      projectId: "test",
      filename: "test.ts",
      content: "test content",
    },
  };

  console.log("Test vector:", JSON.stringify(testVector, null, 2));

  try {
    await index.upsert([testVector]);
    console.log("✅ Test upsert successful!");
  } catch (error) {
    console.error("❌ Test upsert failed:", error);
  }
}

testPineconeUpload();
