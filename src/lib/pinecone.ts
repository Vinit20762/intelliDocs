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
  console.log('Starting PDF processing for file key:', fileKey);
  console.log('Downloading from S3...');
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("Could not download from S3");
  }
  console.log('Successfully downloaded file from S3');

  // 2. Load PDF i used langchain and pdf-parse
  console.log('Loading PDF content...');
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];
  console.log(`Successfully loaded PDF with ${pages.length} pages`);

  // 2. Split PDF pages into chunked documents
  const documents = await Promise.all(pages.map(prepareDocument));  //calling prepareDocument function for each page to split into smaller chunks

  // 3. vectorize and Embed individual documents 
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // 4. Upload to PineconeDb  
  const client = await getPineconeClient();
  const pineconeIndex = client.index('intellidocs');
  const namespace = convertToAscii(fileKey);   //if the file key has special char then it will l give error so we convert it to ascii

  console.log('Inserting vectors into Pinecone...');
  await chunkedUpsert(pineconeIndex, vectors, namespace, 10);

  return documents[0];
}

// Vectors
type Vector = {
  id: string;
  values: number[];
  metadata: {
    text: string;
    pageNumber: number;
  };
};

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
  } as Vector;
}

// Pinecone has a limit of 36kb per vector metadata, so we truncate to be safe  
export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes)); 
};


// Prepare each PDF page by cleaning and splitting into smaller documents @pinecone-database/doc-splitter gives utility fucntion to help split out document
async function prepareDocument(page: PDFPage) {
  let { pageContent } = page;
  const { metadata } = page;
  pageContent = pageContent.replace(/\n/g, '');

  //split the docs into smaller chunks
  const splitter = new RecursiveCharacterTextSplitter();      // @pinecone/doc-spliter has this function to split the document into smaller chunks
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vectors: { id: string; values: number[]; metadata?: Record<string, any> }[],
  namespace: string,
  chunkSize = 10
) {
  for (let i = 0; i < vectors.length; i += chunkSize) {
    const chunk = vectors.slice(i, i + chunkSize);
    await index.namespace(namespace).upsert(chunk); // ✅ wrap in { vectors }
  }
}
