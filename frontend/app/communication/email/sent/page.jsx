import SentEmails from '@/components/email/SentEmails';
import MailBoxFolder from '@/components/email/MailBoxFolder';
export const dynamic = "force-dynamic";

export default function SentPage() {
  return (
    <div className="relative top-20">
        <MailBoxFolder />
      <SentEmails />
    </div>
  );
}