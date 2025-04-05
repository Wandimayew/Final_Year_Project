import AttendanceView from "@/components/attendance/AttendanceView";
import Layout from "@/components/layout/Layout";
export const dynamic = 'force-dynamic';

const ViewPage = () => {
  return (
    <Layout>
      < AttendanceView />
    </Layout>
  );
};

export default ViewPage;