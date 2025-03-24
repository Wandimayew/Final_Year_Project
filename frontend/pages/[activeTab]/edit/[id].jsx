import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { staffService } from "../../../services/api";
import EditForm from "../../../components/employee/EditForm";
import { toast } from "react-toastify";

export default function EditPage() {
  const router = useRouter();
  const { activeTab, id } = router.query;
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState(null);

  const fetchStaffData = useCallback(
    async (id) => {
      try {
        let response;
        if (activeTab === "teacher") {
          response = await staffService.getTeacherById(id);
        } else {
          response = await staffService.getStaffById(id);
        }
        setStaffData(response.data);
      } catch (error) {
        toast.error("Failed to fetch staff data");
        console.error("Error fetching staff data:", error);
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    if (id && activeTab) {
      fetchStaffData(id);
    }
  }, [fetchStaffData, id, activeTab]); // Added activeTab

  return (
    <div className="mt-8">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h1 className="text-2xl font-semibold mb-4 text-center font-sans">
            Edit {activeTab}
          </h1>
          <EditForm staff={staffData} activeTab={activeTab || "staff"} />
        </div>
      )}
    </div>
  );
}
