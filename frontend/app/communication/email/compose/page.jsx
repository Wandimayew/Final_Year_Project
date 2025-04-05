import MailBoxFolder from "@/components/email/MailBoxFolder";
import ComposeEmail from "@/components/email/ComposeEmail";
export const dynamic = "force-dynamic";

const ComposePage = () => {
  return (
    <div className="relative top-20" style={{ display: 'flex' }}>
      <MailBoxFolder />
      <ComposeEmail />
    </div>
  );
};

export default ComposePage;