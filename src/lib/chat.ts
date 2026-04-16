import { supabase } from "@/integrations/supabase/client";

export type Conversation = {
  id: string;
  bike_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

/** Find or create a conversation between current user (buyer) and seller for a bike. */
export const getOrCreateConversation = async (
  bikeId: string,
  sellerId: string,
  buyerId: string,
): Promise<Conversation | null> => {
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("bike_id", bikeId)
    .eq("buyer_id", buyerId)
    .maybeSingle();
  if (existing) return existing as Conversation;

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ bike_id: bikeId, buyer_id: buyerId, seller_id: sellerId })
    .select()
    .maybeSingle();
  if (error) {
    console.error("create conversation", error);
    return null;
  }
  return created as Conversation;
};

export const sendMessage = async (conversationId: string, senderId: string, body: string) => {
  const trimmed = body.trim().slice(0, 2000);
  if (!trimmed) return null;
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, body: trimmed })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Message;
};

export const markConversationRead = async (conversationId: string, userId: string) => {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null);
};
