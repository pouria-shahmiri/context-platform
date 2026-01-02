import { supabase } from './supabase';
import { Conversation, StoredMessage } from '../types';

const CONVERSATIONS_TABLE = 'conversations';
const MESSAGES_TABLE = 'messages';

// Helper to map Conversation
const mapConversationFromDB = (data: any): Conversation | null => {
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    createdAt: data.created_at ? new Date(data.created_at) : null,
    updatedAt: data.updated_at ? new Date(data.updated_at) : null,
  };
};

// Helper to map Message
const mapMessageFromDB = (data: any): StoredMessage | null => {
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    role: data.role,
    content: data.content,
    timestamp: data.created_at ? new Date(data.created_at) : null,
    metadata: data.metadata || {},
    parentId: data.parent_id,
    parentCollection: data.parent_collection
  };
};

/**
 * Create a new conversation
 */
export const createConversation = async (userId: string, title: string = 'New Chat'): Promise<Conversation | null> => {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from(CONVERSATIONS_TABLE)
      .insert({
        user_id: userId,
        title,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return mapConversationFromDB(data);
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

/**
 * Get all conversations for a user
 */
export const subscribeToConversations = (userId: string, callback: (conversations: Conversation[]) => void) => {
  if (!userId) return () => {};

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from(CONVERSATIONS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching conversations:", error);
        return;
    }
    callback((data || []).map(mapConversationFromDB).filter((c): c is Conversation => c !== null));
  };

  // Initial fetch
  fetchConversations();

  const channel = supabase
    .channel(`conversations-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: CONVERSATIONS_TABLE, filter: `user_id=eq.${userId}` },
      () => {
        fetchConversations();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Update conversation title
 */
export const updateConversationTitle = async (conversationId: string, newTitle: string): Promise<void> => {
  const { error } = await supabase
    .from(CONVERSATIONS_TABLE)
    .update({ title: newTitle, updated_at: new Date().toISOString() })
    .eq('id', conversationId);
  
  if (error) throw error;
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (conversationId: string): Promise<void> => {
    // Delete messages first (assuming no cascade delete setup in DB for safety)
    await supabase
        .from(MESSAGES_TABLE)
        .delete()
        .eq('parent_id', conversationId)
        .eq('parent_collection', 'conversations');

    const { error } = await supabase
        .from(CONVERSATIONS_TABLE)
        .delete()
        .eq('id', conversationId);
    
    if (error) throw error;
};

/**
 * Send a message to the chat
 */
export const sendMessage = async (
    userId: string, 
    parentId: string, 
    role: 'user' | 'assistant', 
    content: string, 
    metadata: Record<string, any> = {}, 
    parentCollection: string = 'conversations'
): Promise<void> => {
    if (!userId || !parentId) return;

    const messageData = {
        user_id: userId,
        parent_id: parentId,
        parent_collection: parentCollection,
        role,
        content,
        metadata
    };

    const { error } = await supabase
        .from(MESSAGES_TABLE)
        .insert(messageData);

    if (error) throw error;

    // If this is a conversation, update the updatedAt timestamp
    if (parentCollection === 'conversations') {
        await supabase
            .from(CONVERSATIONS_TABLE)
            .update({ updated_at: new Date().toISOString() })
            .eq('id', parentId);
    }
};

/**
 * Subscribe to chat messages for a specific context
 */
export const subscribeToChat = (
    userId: string, 
    parentId: string, 
    callback: (messages: StoredMessage[]) => void, 
    parentCollection: string = 'conversations'
) => {
    if (!userId || !parentId) return () => {};

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from(MESSAGES_TABLE)
            .select('*')
            .eq('parent_id', parentId)
            .eq('parent_collection', parentCollection)
            .order('created_at', { ascending: true })
            .limit(50);

        if (error) {
            console.error("Error fetching messages:", error);
            return;
        }
        callback((data || []).map(mapMessageFromDB).filter((m): m is StoredMessage => m !== null));
    };

    fetchMessages();

    const channel = supabase
        .channel(`chat-${parentId}`)
        .on(
            'postgres_changes',
            { 
                event: '*', 
                schema: 'public', 
                table: MESSAGES_TABLE, 
                filter: `parent_id=eq.${parentId}` 
            },
            () => {
                fetchMessages();
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

/**
 * Clear all chat history for a context
 */
export const clearChatHistory = async (userId: string, parentId: string, parentCollection: string = 'conversations'): Promise<void> => {
    if (!userId || !parentId) return;

    const { error } = await supabase
        .from(MESSAGES_TABLE)
        .delete()
        .eq('parent_id', parentId)
        .eq('parent_collection', parentCollection);

    if (error) throw error;
};
