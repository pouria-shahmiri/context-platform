import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'contextDocuments';

/**
 * Get all context documents for a user
 */
export const getUserContextDocuments = async (userId) => {
  if (!userId) return [];
  const q = query(
    collection(db, COLLECTION_NAME), 
    where('userId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Create a new context document
 */
export const createContextDocument = async (userId, title = "New Context Document", type = "text") => {
  if (!userId) return null;

  const newDoc = {
    userId,
    title,
    type,
    content: "", 
    notionId: "",
    createdAt: serverTimestamp(),
    lastModified: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), newDoc);
  return docRef.id;
};

/**
 * Get a single context document
 */
export const getContextDocument = async (id) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  throw new Error("Document not found");
};

/**
 * Update a context document
 */
export const updateContextDocument = async (id, data) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    lastModified: serverTimestamp()
  });
};

/**
 * Delete a context document
 */
export const deleteContextDocument = async (id) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
