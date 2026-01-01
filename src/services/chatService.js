import { db } from './firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';

const CHAT_COLLECTION = 'chat';

/**
 * Send a message to the chat
 * 
 * @param {string} userId - Current user ID
 * @param {string} pyramidId - Current pyramid ID
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content - Message content
 * @param {Object} metadata - Optional metadata (e.g., tokens, model)
 */
export const sendMessage = async (userId, parentId, role, content, metadata = {}, parentCollection = 'pyramids') => {
  if (!userId || !parentId) return;

  const chatRef = collection(db, `${parentCollection}/${parentId}/${CHAT_COLLECTION}`);
  
  await addDoc(chatRef, {
    userId,
    role,
    content,
    timestamp: serverTimestamp(),
    metadata,
  });
};

/**
 * Subscribe to chat messages for a specific context
 * 
 * @param {string} userId 
 * @param {string} parentId 
 * @param {Function} callback - Function to receive messages array
 * @param {string} parentCollection - Parent collection name (default: 'pyramids')
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToChat = (userId, parentId, callback, parentCollection = 'pyramids') => {
  if (!userId || !parentId) return () => {};

  const chatRef = collection(db, `${parentCollection}/${parentId}/${CHAT_COLLECTION}`);
  const q = query(chatRef, orderBy('timestamp', 'asc'), limit(50));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

/**
 * Clear all chat history for a context
 * 
 * @param {string} userId 
 * @param {string} parentId 
 * @param {string} parentCollection - Parent collection name (default: 'pyramids')
 */
export const clearChatHistory = async (userId, parentId, parentCollection = 'pyramids') => {
  if (!userId || !parentId) return;

  const chatRef = collection(db, `${parentCollection}/${parentId}/${CHAT_COLLECTION}`);
  const snapshot = await getDocs(chatRef);
  
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};
