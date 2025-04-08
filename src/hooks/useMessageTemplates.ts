
import { useState, useEffect } from 'react';
import { MessageTemplate } from '@/types/messageTemplate';
import { useToast } from './use-toast';

// All message templates (40 in total)
const initialTemplates: MessageTemplate[] = [
  {
    id: "G1",
    category: "General",
    situation: "Urgent EOD Role update",
    message: `Client - Manager - Role - EOD URGENT (DATE)

NAME/ROLE - Needs <blank> or we will fall behind, can you push forward tonight?`
  },
  {
    id: "G2",
    category: "M1",
    situation: "No",
    message: "No problem! Best of luck on your journey this year!"
  },
  {
    id: "G3",
    category: "M2",
    situation: "Objection-Skill Block",
    message: "The skills block is very helpful and needs to be done before any other step, we'll need to have your personal view on your skills and level for each to ensure we are aligned, afterwards we can discuss next steps and any questions or concerns, how does that sound?"
  },
  {
    id: "G4",
    category: "M2",
    situation: "Objection-Job/Visa Details",
    message: "Take a look our pay details above for those sort of questions, let me know if you have any questions after that."
  },
  {
    id: "G5",
    category: "M2",
    situation: "Follow Up #1",
    message: "Hi! Just checking in :)"
  },
  {
    id: "G6",
    category: "M2",
    situation: "Follow Up #2",
    message: "Hey! Do you still have interest in this role?"
  },
  {
    id: "G7",
    category: "M2",
    situation: "Reject - Skills",
    message: "Thank you! Unfortunately, the client for this role requires more experience than you currently have on some of the core skills. We will keep you in mind for future roles, wishing you the best this year!"
  },
  {
    id: "G8",
    category: "M2",
    situation: "Reject - English",
    message: "Thank you! Unfortunately, the client for this role requires a higher level of English than you currently have. We will keep you in mind for future roles, wishing you the best this year!"
  },
  {
    id: "G9",
    category: "M2",
    situation: "Salary - Objection",
    message: "Hi {Candidate's Name}, the compensation for this role is flexible, as we're working with a client who's open to options depending on experience and fit. To make sure we're aligned, could you share your salary expectations or what's most important to you in a compensation package?\nLooking forward to hearing from you and having a transparent conversation!"
  },
  {
    id: "G10",
    category: "M3",
    situation: "Objection",
    message: "The video is the best next step before we can really finalize anything else, after this we quickly get on a call with me or my lead recruiter (just due to how busy the schedules are). So if you are interested and have time to record this asap I would appreciate it! This video is not shared with anyone & can be informal, how does that sound? I appreciate the effort you have put in :)"
  },
  {
    id: "G11",
    category: "M3",
    situation: "Delay",
    message: "Please double check the items requested above, can you send me those asap?"
  },
  {
    id: "G12",
    category: "M4",
    situation: "Call",
    message: "Could you hop onto this call here? I will be here working throughout the day, and we can discuss if you have time.\nhttps://meet.google.com/rec-oxgj-gyy"
  },
  {
    id: "G13",
    category: "M4",
    situation: "Salary - High Rate",
    message: "Given the competitive nature of this opportunity, a more flexible salary expectation could position you more favorably than other candidates.\nWould you be open to discussing this further? If so, could you share the lowest fair hourly rate you would consider for this role? My goal is to ensure alignment while maximizing your chances in the selection process.\n\nIt's always easier for us to consider an increase in 6months or after you start, so coming in lower is strategic. \n\nLet me know what you think."
  },
  {
    id: "G14",
    category: "Close",
    situation: "Closeout",
    message: "Thank you so much for your interest in the role and for the effort you put into your application. Unfortunately, the client has informed us that they're no longer reviewing or accepting candidates.\n\nIf this opens soon would you like us to let you know? It may open back up at any time for other team spots.\n\nThanks again for your time, and I hope we can stay in touch!"
  },
  {
    id: "G15",
    category: "Submit",
    situation: "Before Submit",
    message: "Ok!\n\nYou are all packaged up, we sent over the Right to Represent. \n\nWe are ready to hit submit to the client, please note, once we submit you could get a request for an interview with a Technical or Sr. member of the team. , in that interview they may be asking about the skills and years of exp etc, you are only expected to know them at the level we have discussed. \n\nAre you concerned about speaking to any of these in an interview with someone, or being able to show or talk to your hands on use of each?\n"
  },
  {
    id: "G16",
    category: "Submit",
    situation: "Submit Non-AnF",
    message: "Hey! I wanted to let you know that we've successfully submitted you to this role!\n\nI'll reach out as soon as I hear back from the client, please let me know if you have any questions, thanks and excited for the next steps!"
  },
  {
    id: "G17",
    category: "Submit",
    situation: "Submit AnF",
    message: "Can you confirm the following for me too, these are very important especially if there is an interview request:\n\n1) do you have Microsoft teams on your desktop? please test video call, then confirm it is working. \n2) do you have Microsoft teams on your phone? please download, test a video call, then confirm on cell data if possible. \n(in case there is a disruption on the interview, you can have your phone ready)\n3) confirm you have a quiet place with internet for a call, would you need to test this out with us beforehand?\n4) please ensure if we do schedule an interview, we need to know right away if you cannot make it after it is scheduled, sometimes folks back out day of the interview and we ask you try to avoid this for us \n\nTypically there are personality, then technical, or sometimes combined interviews. The best approach is to be ready for both and ready to demonstrate and speak to your profile. \n\nPlease note, if you are applying to other jobs that is great news! All we ask is you let us know ASAP if anything is seemingly going to progress, we will not disqualify you, it just helps us prepare and be aware. "
  },
  {
    id: "G18",
    category: "Submit",
    situation: "Candidate Follow Up 2.5-3.5 days",
    message: "Hey! Have not forgotten about you! Still waiting to hear back, we appreciate your patience and effort so far :)\n\nHow is everything going?\n\np.s. as a reminder, if an interview is requested, best is to be ready for both a personality and technical interview and ready to demonstrate and speak to your profile. \n\nAlso let me know asap if anything has changed on your end with other jobs or applications etc, this will not disqualify you, it just helps us prepare and be aware."
  },
  {
    id: "G19",
    category: "Client",
    situation: "Follow Up 2.5-3.5 days",
    message: "Hi {Name} - just checking in to see if you would like to speak with Maria? If not, let us know any feedback so we can hone in who we are sending over to you. Thanks!"
  },
  {
    id: "G20",
    category: "Tech Test",
    situation: "Take a Test - Emailed",
    message: "Hey, I have great news! The client has asked if you can complete a test as a pre-round interview, congratulations!! :) \n\nAfter this step, if we proceed, there would only be 1-2 interviews at most.\n\nKeep an eye on your emails for the test, it will be coming from Success@theitbc.com. Very excited they've decided to move you forward in the process! "
  },
  {
    id: "G21",
    category: "Tech Test",
    situation: "Test Objection",
    message: "I understand your concerns regarding the test. However, this is a required part of the client's evaluation process, and completing it is necessary to be considered for the opportunity. The sooner it is completed, the sooner the client can review your profile.\n\nPlease let me know if you have any questions. We appreciate your time and effort in this process"
  },
  {
    id: "G22",
    category: "Tech Test",
    situation: "Rejected",
    message: "Thank you so much for your interest in the role and for the effort you put into your application. Unfortunately, the client has informed that your test results were not accepted. If we get specific feedback we'll be sure to let you know!\n\nI'd love to keep your profile on file and reach out when similar roles at other clients become available.\n\nIf so, you may hear from someone on my team or from me directly, either from linked-in, whatsapp, or success@theitbc.com, if we need any further details. Does that work for you?"
  },
  {
    id: "G23",
    category: "Interview Request",
    situation: "AnF LI",
    message: "Fantastic news! We've received an interview request. We've sent you a whatsapp message, we use whatsapp to coordinate interviews for simplicity, could you please review it when you have a moment?"
  },
  {
    id: "G24",
    category: "Interview Request",
    situation: "AnF Whatsapp",
    message: "Congrats! The client has requested an interview for you :)\n\nMichel from CBTS is copied here, our onsite partner at AnF, he will coordinate with the manager on a time. Once confirmed look for a calendar invite from cbtsconsulting@cbtsconsulting.com.\n\nYour interview will be with the AnF/Tech Lead. Both personality and technical skills will need to shine. For technical, take some time after we schedule to review the skills below, I grouped these into ones you indicated you have more and less exp with.\n\nStrengths (years of experience):\n\nLess Experience (years of experience):\n\nThe more you can speak to these skills and your hands-on experience with examples, the better. \n\nThis is a great client and team, and if you can bring your A game into the interview and focus on these skillsets I think you'd love working here.\n\nBest of luck! Michel will send time slots soon—let us know if you have any questions!"
  },
  {
    id: "G25",
    category: "Interview Request",
    situation: "Non-AnF",
    message: "Congrats! The client has requested an interview for you :) please keep an eye out for a calendar invite and please accept it, if the time does not work for you, let me know ASAP! Remeber this is an interview, so you should really try to make the time scheduled before asking for a re-schedule. \n\nThe interview may be with a Tech Lead or someone from HR. So both personality and technical skills need to shine.\n\nFor technical, please take some time before your interview to review the skills below and be ready to discuss them in detail:\n\nSkills:\n-xxxx\n-xxxx\n-xxxx\n\nThe more you can speak to these skills and your hands-on experience with examples, the better.\n\nFor HR, please be ready to answer\n\nThis client is big on engagement - please bring 2 questions about the role, and 2 questions about the company to ask the interviewer - if you do not ask questions at the end of the interview they will likely pass on your profile, as they've complianed about this with past submissions.\n\nBest of luck—let us know if you have any questions!"
  },
  {
    id: "G26",
    category: "Interview Prep",
    situation: "AnF - Teams Reminder Day Before",
    message: "Just a quick reminder to prep for your interview as [ROLE NAME]:\n\n-Download Microsoft Teams on your desktop and make sure video calls work.\n-Download Teams on your phone as a backup and enable cell data in case of computer or Wi-Fi issues.\n-Find a quiet place with strong internet for the interview.\n-If you can't make it, let us know ASAP so we can reschedule.\n\nP.S. If you'd like to test a Teams call before, we're happy to help!"
  },
  {
    id: "G27",
    category: "Interview Prep",
    situation: "Non AnF - Reminder Day Before",
    message: "Just a quick reminder to prep for your interview as [ROLE NAME]:\n\n-Prepare your computer, test video and mic.\n-Download Teams/Meet on your phone as a backup and enable cell data in case of computer or Wi-Fi issues.\n-Find a quiet place with strong internet for the interview.\n-If you can't make it, let us know ASAP so we can reschedule.\n\nP.S. Please feel free to reach out if you have any questions or need assistance before the interview"
  },
  {
    id: "G28",
    category: "Interview Prep",
    situation: "AnF - Morning of interview",
    message: "Good luck today!\n\nJust a quick check-in before your interview. Expect a mix of personality and deep technical questions.\n\nReminders:\n-Be in a quiet space with a strong internet connection\n-Join a few minutes early and be on camera\n-Be ready to discuss your skills and ask questions\n-Highlight your achievements and growth in past roles, keep reasons for leaving positive and professional, and focus on future opportunities.\n-Have Teams ready on your phone in case of Wi-Fi issues\n-The culture values teamwork, accountability, and getting things done. They appreciate high energy and a positive attitude.\n\nThey'll want to see that you're ready to contribute. Strong communication and confidence will be important.\n\nLet me know if you have any questions."
  },
  {
    id: "G29",
    category: "Interview Prep",
    situation: "Non AnF - Morning of Interview",
    message: "Good luck today!\n\nJust a quick check-in before your interview. Expect a mix of personality and deep technical questions.\n\nReminders:\n-Be in a quiet space with a strong internet connection\n-Join a few minutes early and be on camera\n-Be ready to discuss your skills and ask questions\n-Highlight your achievements and growth in past roles, keep reasons for leaving positive and professional, and focus on future opportunities.\n-Have Teams/Meet ready on your phone in case of Wi-Fi issues\n-The culture values teamwork, accountability, and getting things done. They appreciate high energy and a positive attitude.\n\nThey'll want to see that you're ready to contribute. Strong communication and confidence will be important.\n\nLet me know if you have any questions."
  },
  {
    id: "G30",
    category: "Interview Results",
    situation: "Keeping warm & it's been a while",
    message: "Hey! Just wanted to keep you in the loop that we're still waiting on the client for this. I appreciate your patience! If you're applying for other roles and anything is seemingly going to progress, please let me know. It will not disqualify you, it just helps us prepare and be aware. I hope you're doing well!"
  },
  {
    id: "G31",
    category: "Interview Results",
    situation: "After Interview",
    message: "Hey! How are you feeling after your interview? Any questions for us? :)\n\nWe typically hear back from the client within a few days, but sometimes it can take a week or more for them to make a decision. We will keep you updated as we get feedback. \n\nIf you have questions at any point in time, please feel free to reach out here. Great work today! "
  },
  {
    id: "G32",
    category: "Interview Results",
    situation: "Have not forgotten about you",
    message: "Hey! We have not forgotten about you! Just waiting to align on final details with the client and internally :)\n"
  },
  {
    id: "G33",
    category: "Offer & Onboard",
    situation: "Offer",
    message: "Hey! Great news! We got a verbal offer from the client, can you respond here with a verbal acceptance as well as to the offer email?"
  },
  {
    id: "G34",
    category: "Support - Slack",
    situation: "Morning First Day",
    message: "Hi {firstName}\n\nGood luck today on your first day at {client}! \n\nA few reminders, during your first week please be extra proactive and reach out to your manager and team members frequently to start to form a good working relationship.\n\nDon't wait to receive tasks from your manager, reach out to them and offer to help and jump in on things, take your onboarding into your own hands.\n\nWhen given a task:\n- Check if there's an existing method (if so follow it).\n- If not, create an approach and get feedback early (once you are 10% into that approach you are creating).\n- Refine, templatize, and share the new process with others.\n\nFor more details, please refer to our ITBC - First Week Guide provided below.\nFirst Week Guide\n\nWe're very excited for you to join the team, please reach out if you have any questions!"
  },
  {
    id: "G35",
    category: "Support - Slack",
    situation: "Mid-End First Week",
    message: "Hey! I hope you're settling in well in your first week!\n\nAs you are a few days in now, it's a great time to assess your progress and reflect on your experiences so far. Here are a few things to focus on:\n\n-Evaluate how much progress you've made on key tasks or projects.\n-Take note of how feedback is being shared and received within your team.\n-Based on the feedback you've gathered, consider whether any internal processes (like sprint planning, code reviews, or testing workflows) may need adjustment or fine-tuning.\n-Please continue to stay proactive, reach out to your manager and teammates for guidance, and offer to assist where you can.\n\nAlso, have you been able to make progress towards out first week guide? If so, how has it been going?\nhttps://docs.google.com/document/d/1CwwPVqkWBcG-gB1GJ32iD4ZT44DI-bpIuswJdQhP608/\n\nIf you have any questions or need any clarification, don't hesitate to reach out! We're excited to see your contributions."
  },
  {
    id: "G36",
    category: "Reopened Role",
    situation: "Reopened",
    message: "Hi! This position has reopened - are you interested? :)"
  },
  {
    id: "G37",
    category: "Reopened Role",
    situation: "New Seat",
    message: "Hey - just checking in we just had a new seat open up at the same client with a similar job description as the previous role I had reached out to you about. Would you be interested in learning more?"
  },
  {
    id: "G38",
    category: "General",
    situation: "Reopen Aquarium",
    message: "Hey! A similar role with the same skills might reopen. Interested in hearing more?"
  },
  {
    id: "G39",
    category: "Offer & Onboard",
    situation: "Email Thread with the client",
    message: "Hey {firstName}, we're adding you to the email thread with the client. Please keep in mind that first impressions matter, so make sure your grammar and formatting are clear and professional.\n\nIf you need any help or want me to review your message, feel free to reach out"
  },
  {
    id: "G40",
    category: "Aquarium",
    situation: "Closeout - aquarium invite",
    message: "Hi {firstName}, we just got an update and I would like to thank you so much for your interest in the role and for the effort you put into your application. Unfortunately, the client has informed us that they're no longer reviewing or accepting candidates.\n\nI'd love to keep your profile on file and reach out when similar roles become available.\n\nWould you like to continue the vetting process and be prioritized for future openings?\nThanks again for your time, and I hope we can stay in touch!"
  },
  {
    id: "G41",
    category: "General",
    situation: "Long waiting without notice",
    message: "Hi, {firstName}, I hope you're doing well! I wanted to reach out and acknowledge that it's been a while since we last connected. First, my sincere apologies for the delay—we've had a lot of movement on our end, and the process took longer than expected.\n\nThat said, we really appreciate your patience and continued interest. If you're still open to it, we'd love to pick things back up and move forward in the process. Let me know your availability, and we can set up the next steps.\n\nLooking forward to hearing from you!"
  }
];

export function useMessageTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>(initialTemplates);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Simulate loading from a database
  useEffect(() => {
    // In a real app, you'd fetch from an API here
    const loadTemplates = async () => {
      try {
        // For now, just use the initial data
        setTemplates(initialTemplates);
        setLoading(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load message templates",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    loadTemplates();
  }, [toast]);

  const updateTemplate = (updatedTemplate: MessageTemplate) => {
    setTemplates(currentTemplates => 
      currentTemplates.map(template => 
        template.id === updatedTemplate.id ? updatedTemplate : template
      )
    );
    
    toast({
      title: "Template Updated",
      description: `Template ${updatedTemplate.id} has been updated.`
    });
  };

  return {
    templates,
    loading,
    updateTemplate
  };
}
