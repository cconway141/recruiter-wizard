
interface ComposeOptions {
  to: string;
  subject: string;
  body: string;
  cc?: string;
}

export const useGmailComposer = () => {
  const composeEmailInGmail = ({ 
    to, 
    subject, 
    body, 
    cc = "recruitment@theitbc.com" 
  }: ComposeOptions) => {
    const params = new URLSearchParams({
      to,
      cc,
      subject,
      body: body.replace(/<[^>]*>/g, '') // Strip HTML for mailto links
    });
    
    const composeUrl = `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
    window.open(composeUrl, '_blank');
  };
  
  const openThreadInGmail = (subject: string) => {
    const encodedSubject = encodeURIComponent(`"${subject}"`);
    window.open(`https://mail.google.com/mail/u/0/#search/${encodedSubject}`, '_blank');
  };

  return {
    composeEmailInGmail,
    openThreadInGmail
  };
};
