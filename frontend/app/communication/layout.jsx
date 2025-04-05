import Layout from "@/components/layout/Layout";

// Force dynamic rendering for all pages using this layout
export const dynamic = "force-dynamic";

const CommunicationLayout = ({ children }) => {
  return <Layout className="relative top-20">{children}</Layout>;
};

export default CommunicationLayout;
