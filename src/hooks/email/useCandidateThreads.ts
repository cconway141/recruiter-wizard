
const saveThreadId = async ({ 
  candidateId, 
  threadIds, 
  jobId, 
  newThreadId,
  newMessageId
}: CandidateThreadData) => {
  if (!jobId || !newThreadId || !candidateId) {
    console.error("Missing required data for thread saving:", { jobId, newThreadId, candidateId });
    return false;
  }
  
  try {
    console.log("Saving thread ID and message ID:", {
      candidateId,
      jobId,
      newThreadId,
      newMessageId
    });
    
    const updatedThreadIds = { ...threadIds };
    updatedThreadIds[jobId] = {
      threadId: newThreadId,
      messageId: newMessageId  // Kept as 'messageId' for backward compatibility
    };
    
    const { error: updateError } = await supabase
      .from('candidates')
      .update({
        thread_ids: updatedThreadIds as unknown as Json
      })
      .eq('id', candidateId);
      
    if (updateError) {
      console.error("Error updating candidate thread ID:", updateError);
      toast({
        title: "Warning",
        description: "Email sent, but failed to save thread ID for future emails.",
        variant: "destructive"
      });
      return false;
    } 
    
    console.log("Successfully saved thread and message IDs");
    return true;
  } catch (err) {
    console.error("Error saving thread ID:", err);
    return false;
  }
};
