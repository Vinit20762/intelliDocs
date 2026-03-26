import { Pinecone, type ScoredPineconeRecord } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(embeddings: number[], fileKey: string) {
  console.log('Getting matches for fileKey:', fileKey);
  
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const namespace = convertToAscii(fileKey);
  console.log('Using namespace:', namespace);
  
  const index = pinecone.index("intellidocs");

  try {
    console.log('Querying Pinecone...');
    const queryResult = await index.namespace(namespace).query({
      topK: 10,
      vector: embeddings,
      includeMetadata: true,
      includeValues: false,
    });

    return queryResult.matches || [];
  } catch (error) {
    console.log("Error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  console.log('Getting context for query:', query, 'fileKey:', fileKey);
  
  const queryEmbeddings = await getEmbeddings(query);
  console.log('Generated embeddings for query');
  
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);
  console.log('Got matches from Pinecone:', matches.length);
  
  const qualifyingDocs = matches.filter(
    (match: ScoredPineconeRecord) => {
      console.log('Match score:', match.score);
      return match.score && match.score > 0.7;
    }
  ).sort((a, b) => (b.score || 0) - (a.score || 0));
  
  console.log('Qualifying docs after filtering:', qualifyingDocs.length);
  
  type Metadata = {
    text: string;
    pageNumber: number;
  };

  const docs = qualifyingDocs.map(
    (match: ScoredPineconeRecord) => (match.metadata as Metadata).text
  );

  return docs.join("\n").substring(0, 3000);
}
