import {Pinecone} from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY || "",
});
const index = pc.Index("promptdoc-index");
export {pc, index};