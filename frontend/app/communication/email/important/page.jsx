import ImportantEmails from "@/components/email/ImportantEmails";
import MailBoxFolder from "@/components/email/MailBoxFolder";

export default function ImportantPage() {
  return (
    <div className="relative top-20">
      <MailBoxFolder />
      <ImportantEmails />
    </div>
  );
}
