import Layout from "@/components/layout/Layout";

// Force dynamic rendering for all pages using this layout
export const dynamic = "force-dynamic";

const FinanceLayout = ({ children }) => {
  return <Layout>{children}</Layout>;
};

export default FinanceLayout;
