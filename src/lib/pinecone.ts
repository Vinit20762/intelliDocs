import { Pinecone } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { Document, RecursiveCharacterTextSplitter } from '@pinecone-database/doc-splitter';
import { getEmbeddings } from "./embeddings";
import md5 from 'md5';
import { convertToAscii } from "./utils";

let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. Download PDF from S3
  console.log('Downloading S3 file...');
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) throw new Error("Could not download from S3");

  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. Split PDF pages into documents
  const documents = await Promise.all(pages.map(prepareDocument));

  // 3. Embed documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // 4. Upload to Pinecone
  const client = await getPineconeClient();
  const pineconeIndex = client.index('intelliDocs');
  const namespace = convertToAscii(fileKey);

  console.log('Inserting vectors into Pinecone...');
  await chunkedUpsert(pineconeIndex, vectors, namespace, 10);

  return documents[0];
}

async function embedDocument(doc: Document) {
  const embeddings = await getEmbeddings(doc.pageContent);
  if (!embeddings) throw new Error('Embeddings returned undefined');

  const hash = md5(doc.pageContent);

  return {
    id: hash,
    values: embeddings, // guaranteed number[]
    metadata: {
      text: doc.metadata.text,
      pageNumber: doc.metadata.pageNumber
    }
  };
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, '');

  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000)
      }
    })
  ]);

  return docs;
}

async function chunkedUpsert(
  index: ReturnType<Pinecone['index']>,
  vectors: { id: string; values: number[]; metadata?: Record<string, any> }[],
  namespace: string,
  chunkSize = 10
) {
  for (let i = 0; i < vectors.length; i += chunkSize) {
    const chunk = vectors.slice(i, i + chunkSize);
    await index.namespace(namespace).upsert(chunk); // ✅ wrap in { vectors }
  }
}
