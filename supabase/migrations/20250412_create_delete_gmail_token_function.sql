
-- Function to delete a gmail token for a specific user
CREATE OR REPLACE FUNCTION public.delete_gmail_token(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.gmail_tokens
  WHERE user_id = user_id_param
    AND (auth.uid() = user_id_param OR auth.jwt() IS NULL);
END;
$$;
