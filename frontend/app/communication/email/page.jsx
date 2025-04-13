import MailBoxFolder from "@/components/email/MailBoxFolder";
import EmailList from "@/components/email/EmailList";
export const dynamic = "force-dynamic";

const InboxPage = () => {
  return <EmailList folder="inbox" />;
};

export default InboxPage;
