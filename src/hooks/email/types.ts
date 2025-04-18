
// Define common email types used across the application

export interface EmailResult {
  success?: boolean;
  error?: string;
  threadId?: string;
  messageId?: string;      // Gmail resource ID
  rfcMessageId?: string;   // RFC-822 Message-ID
}
