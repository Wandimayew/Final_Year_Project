import MailBoxFolder from "@/components/email/MailBoxFolder";
import EmailList from "@/components/email/EmailList";

const InboxPage = () => {
  return (
    <div className="relative top-20" style={{ display: 'flex' }}>
      <MailBoxFolder />
      <EmailList folder="inbox" />
    </div>
  );
};

export default InboxPage;