import { Pinecone, type ScoredPineconeRecord } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(embeddings: number[], fileKey: string) {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  // attach namespace here not in wuery result
  const namespace = convertToAscii(fileKey);
  const index = pinecone.Index("intellidocs", namespace);

  try {
    const queryResult = await index.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });

    return queryResult.matches || [];
  } catch (error) {
    console.log("Error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  const qualifyingDocs = matches.filter(
    (match: ScoredPineconeRecord) => match.score && match.score > 0.7
  );

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  const docs = qualifyingDocs.map(
    (match: ScoredPineconeRecord) => (match.metadata as Metadata).text
  );

  return docs.join("\n").substring(0, 3000);
}
