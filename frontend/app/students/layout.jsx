import Layout from "@/components/layout/Layout";

// Force dynamic rendering for all pages using this layout
export const dynamic = "force-dynamic";
const StudentLayout = ({ children }) => {
  return <Layout>{children}</Layout>;
};

export default StudentLayout;
