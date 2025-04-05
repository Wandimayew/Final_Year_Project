import TrashEmails from '@/components/email/TrashEmails';
import MailBoxFolder from '@/components/email/MailBoxFolder';
export const dynamic = "force-dynamic";

export default function TrashPage() {
  return (
    <div className="relative top-20">
        <MailBoxFolder />
      <TrashEmails />
    </div>
  );
}