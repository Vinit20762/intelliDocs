import { Pinecone, utils as Pineconeutils } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { Document, RecursiveCharacterTextSplitter } from '@pinecone-database/doc-splitter'
import { getEmbeddings } from "./embeddings";
import md5 from 'md5'
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
    loc: {pageNumber: number}
  }
}

export async function loadS3IntoPinecone(fileKey: string){

 // 1. import the pdf -> download and read from pdf
    console.log('downloading s3 into file system')
    const file_name = await downloadFromS3(fileKey);
    if(!file_name){
        throw new Error("Could not download from s3")
    }
    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];

  // 2. split and segment the pdf into documents

    const documents = await Promise.all(pages.map(prepareDocument));

  //3. vectorise and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument))

  //4. upload to pinecone
  const client = await getPineconeClient()
  const pineconeIndex = client.index('intelliDocs')

  console.log('inserting vectors into pinocodeDB')
  const namespace = convertToAscii(fileKey)

  Pineconeutils.chunkedUpsert(pineconeIndex, vectors, namespace, 10)
  return documents[0]
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent)
    const hash = md5(doc.pageContent)

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber
      }
    }
  } catch (error) {
    console.log('error embebedding document', error)
    throw error
    
  }
}

export const truncateStringByBytes = (str: string, bytes: number)=>{
  const enc = new TextEncoder()
  return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes))
}

async function prepareDocument(page: PDFPage) {
    let {  pageContent, metadata } = page
    pageContent = pageContent.replace(/\n/g, '');
  // split the docs
  const splitter = new RecursiveCharacterTextSplitter()
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000)
      }
    })
  ])
  return docs;
}
