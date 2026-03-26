import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export async function getEmbeddings(text: string) {
  try {
    // Clean and prepare the text
    const cleanedText = text.replace(/\n/g, " ").trim();
    
    if (!cleanedText) {
      throw new Error("Empty text provided for embeddings");
    }

    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: cleanedText
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No embeddings returned from OpenAI");
    }

    console.log("Successfully generated embeddings for text length:", cleanedText.length);
    return response.data[0].embedding as number[];
  } catch (error) {
    console.error("Error calling OpenAI embeddings API:", error);
    console.error("Text that caused error:", text);
    throw error;
  }
}
