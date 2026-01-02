import { supabase } from './supabase';
import { createBlock, Block } from '../utils/pyramidLayout';
import { Pyramid } from '../types';

// Helper to map DB snake_case to JS camelCase
const mapPyramidFromDB = (data: any): Pyramid | null => {
    if (!data) return null;
    return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        context: data.context,
        createdAt: data.created_at ? new Date(data.created_at) : null,
        lastModified: data.last_modified ? new Date(data.last_modified) : null,
        status: data.status,
        blocks: data.blocks,
        connections: data.connections,
        contextSources: data.context_sources
    };
};

// Create a new pyramid
export const createPyramid = async (userId: string, title: string, context: string | null = null): Promise<string> => {
  try {
    // Create an 8x8 grid of blocks
    const blocks: Record<string, Block> = {};
    for (let u = 0; u < 8; u++) {
      for (let v = 0; v < 8; v++) {
        const block = createBlock(u, v, 'question');
        blocks[block.id] = block;
      }
    }

    const pyramidData = {
      user_id: userId,
      title,
      context,
      status: 'in_progress',
      blocks: blocks,
      connections: [],
      // created_at and last_modified are handled by default now() or we can send them
      last_modified: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('pyramids')
        .insert(pyramidData)
        .select()
        .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error creating pyramid: ", error);
    throw error;
  }
};

// Get a single pyramid
export const getPyramid = async (pyramidId: string): Promise<Pyramid | null> => {
  try {
    const { data, error } = await supabase
        .from('pyramids')
        .select('*')
        .eq('id', pyramidId)
        .single();
    
    if (error) throw error;
    if (!data) throw new Error("Pyramid not found");

    return mapPyramidFromDB(data);
  } catch (error) {
    console.error("Error fetching pyramid: ", error);
    throw error;
  }
};

// Subscribe to pyramid updates
export const subscribeToPyramid = (pyramidId: string, onUpdate: (pyramid: Pyramid | null) => void) => {
  const channel = supabase
    .channel(`pyramid-${pyramidId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pyramids', filter: `id=eq.${pyramidId}` },
      (payload) => {
        if (payload.eventType === 'DELETE') {
             onUpdate(null);
        } else {
             // Fetch the full record to ensure consistent data structure or map the payload.new
             // payload.new contains the columns.
             onUpdate(mapPyramidFromDB(payload.new));
        }
      }
    )
    .subscribe();

  // Initial fetch
  getPyramid(pyramidId).then(data => onUpdate(data)).catch(err => console.error(err));

  return () => {
      supabase.removeChannel(channel);
  };
};

// Update pyramid blocks (save state)
export const updatePyramidBlocks = async (pyramidId: string, blocks: Record<string, Block>) => {
  try {
    const { error } = await supabase
        .from('pyramids')
        .update({
            blocks,
            last_modified: new Date().toISOString()
        })
        .eq('id', pyramidId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating pyramid blocks: ", error);
    throw error;
  }
};

// Update pyramid context sources
export const updatePyramidContextSources = async (pyramidId: string, contextSources: any[]) => {
  try {
    const { error } = await supabase
        .from('pyramids')
        .update({
            context_sources: contextSources,
            last_modified: new Date().toISOString()
        })
        .eq('id', pyramidId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating pyramid context sources: ", error);
    throw error;
  }
};

// Duplicate an existing pyramid
export const duplicatePyramid = async (userId: string, pyramidId: string): Promise<Pyramid | null> => {
  try {
    // 1. Get original pyramid
    const { data: originalData, error: fetchError } = await supabase
        .from('pyramids')
        .select('*')
        .eq('id', pyramidId)
        .single();
    
    if (fetchError || !originalData) {
      throw new Error("Pyramid not found");
    }

    // 2. Prepare new data
    const newData = {
      ...originalData,
      id: undefined, // Let DB generate new ID
      user_id: userId,
      title: `${originalData.title} (Copy)`,
      created_at: undefined, // Let DB handle default
      last_modified: new Date().toISOString()
    };

    // 3. Create new document
    const { data, error } = await supabase
        .from('pyramids')
        .insert(newData)
        .select()
        .single();

    if (error) throw error;
    return mapPyramidFromDB(data);
  } catch (error) {
    console.error("Error duplicating pyramid: ", error);
    throw error;
  }
};

// Get all pyramids for a user
export const getUserPyramids = async (userId: string): Promise<Pyramid[]> => {
  try {
    const { data, error } = await supabase
        .from('pyramids')
        .select('*')
        .eq('user_id', userId)
        .order('last_modified', { ascending: false });
    
    if (error) throw error;
    
    return data.map(mapPyramidFromDB) as Pyramid[];
  } catch (error) {
    console.error("Error fetching pyramids: ", error);
    throw error;
  }
};

// Delete a pyramid
export const deletePyramid = async (pyramidId: string): Promise<void> => {
  try {
    const { error } = await supabase
        .from('pyramids')
        .delete()
        .eq('id', pyramidId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting pyramid: ", error);
    throw error;
  }
};

// Update pyramid context
export const updatePyramidContext = async (pyramidId: string, context: string): Promise<void> => {
  try {
    const { error } = await supabase
        .from('pyramids')
        .update({
            context,
            last_modified: new Date().toISOString()
        })
        .eq('id', pyramidId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating pyramid context: ", error);
    throw error;
  }
};
