import { integer, pgEnum, pgTable, serial, text, timestamp, varchar} from 'drizzle-orm/pg-core';

export const userSystemEnum = pgEnum('user_system_enum', ["system", "user", "assistant"]);

export const chats = pgTable('chats', {
    id: serial("id").primaryKey(),
    pdfName: text("pdf_name").notNull(),
    pdfUrl: text("pdf_url").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    userId: varchar('user_id', {length:256}).notNull(),
    fileKey: text("file_key").notNull(),      //this fileKey is the S3 object key
});

export type DrizzleChat = typeof chats.$inferSelect; //to infer the type of the chat from the schema in chatsidebar component

export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    chatId: integer('chat_id').references(()=>chats.id).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    role: userSystemEnum('role').notNull(),
});