import { supabase } from './supabase';
import { ContextDocument } from '../types';

const TABLE_NAME = 'context_documents';

// Helper to map DB snake_case to JS camelCase
const mapDocumentFromDB = (data: any): ContextDocument | null => {
    if (!data) return null;
    return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        type: data.type,
        content: data.content,
        notionId: data.notion_id,
        createdAt: data.created_at ? new Date(data.created_at) : null,
        lastModified: data.last_modified ? new Date(data.last_modified) : null
    };
};

/**
 * Get all context documents for a user
 */
export const getUserContextDocuments = async (userId: string): Promise<ContextDocument[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data.map(mapDocumentFromDB) as ContextDocument[];
};

/**
 * Create a new context document
 */
export const createContextDocument = async (userId: string, title: string = "New Context Document", type: string = "text"): Promise<string | null> => {
  if (!userId) return null;

  const newDoc = {
    user_id: userId,
    title,
    type,
    content: "", 
    notion_id: "",
    last_modified: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(newDoc)
    .select()
    .single();
  
  if (error) throw error;
  return data.id;
};

/**
 * Get a single context document
 */
export const getContextDocument = async (id: string): Promise<ContextDocument> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Document not found");

  return mapDocumentFromDB(data) as ContextDocument;
};

/**
 * Update a context document
 */
export const updateContextDocument = async (id: string, data: Partial<ContextDocument>) => {
  // Map partial update data to snake_case
  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.notionId !== undefined) updateData.notion_id = data.notionId;
  
  updateData.last_modified = new Date().toISOString();

  const { error } = await supabase
    .from(TABLE_NAME)
    .update(updateData)
    .eq('id', id);
  
  if (error) throw error;
};

/**
 * Delete a context document
 */
export const deleteContextDocument = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};
