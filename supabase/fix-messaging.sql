-- Fix RLS and constraints for Messaging (conversations & messages)

-- 1. Restrict conversation creation to STUDENTS only.
-- An owner cannot initiate a conversation arbitrarily.
DROP POLICY IF EXISTS "Participants can create conversations" ON public.conversations;

CREATE POLICY "Students can create conversations"
  ON public.conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = conversations.listing_id
        AND listings.owner_id = conversations.owner_id
        AND listings.status = 'published'
    )
  );

-- 2. Prevent updating critical columns in conversations.
CREATE OR REPLACE FUNCTION public.check_conversation_immutable_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id <> OLD.id OR
     NEW.listing_id <> OLD.listing_id OR
     NEW.student_id <> OLD.student_id OR
     NEW.owner_id <> OLD.owner_id THEN
    RAISE EXCEPTION 'Cannot modify id, listing_id, student_id, or owner_id of a conversation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_conversation_immutable ON public.conversations;
CREATE TRIGGER tr_conversation_immutable
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_conversation_immutable_fields();


-- 3. Prevent tampering with messages.
-- A participant should only be able to update 'read_at' of a message sent by the OTHER person.
-- No one should be able to modify the 'body', 'sender_id', or 'conversation_id'.
CREATE OR REPLACE FUNCTION public.check_message_immutable_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id <> OLD.id OR
     NEW.conversation_id <> OLD.conversation_id OR
     NEW.sender_id <> OLD.sender_id OR
     NEW.body <> OLD.body OR
     NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Cannot modify id, conversation_id, sender_id, body, or created_at of a message';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_message_immutable ON public.messages;
CREATE TRIGGER tr_message_immutable
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_message_immutable_fields();

-- Update policy for messages: participants can only update messages to set read_at.
-- We can leave the existing update policy as is, because the trigger now prevents tampering with the body/sender.
