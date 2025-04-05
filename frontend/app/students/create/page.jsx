"use client";
import { useEffect, useState } from "react";
import { Mail, User, Phone, School } from "lucide-react";
import { useCreateStudent } from "@/lib/api/studentService/students";
import {
  useParentGuardianByContact,
  useCreateParentGuardian,
  useParentGuardians,
} from "@/lib/api/studentService/parentGuardian";
import { useCreateUser } from "@/lib/api/users";
import InputField from "@/components/InputField";
import ImageUpload from "@/components/ImageUpload";
import SectionHeader from "@/components/SectionHeader";
export const dynamic = "force-dynamic";

const AdmissionForm = () => {
  const [showProfilePicture, setShowProfilePicture] = useState(null);
  const [showGuardianPicture, setShowGuardianPicture] = useState(null);
  const [guardianExists, setGuardianExists] = useState(false);
  const [parentId, setParentId] = useState(null);

  const createUserMutation = useCreateUser();
  const createParentGuardianMutation = useCreateParentGuardian();
  const { data: parentData = [], refetch } = useParentGuardians();
  const { mutateAsync: createStudent } = useCreateStudent();

  useEffect(() => {
    if (guardianExists) {
      refetch();
    }
  }, [guardianExists, refetch]); // Added refetch to dependencies

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("start handleSubmit");
    const userData = {
      schoolId: 1,
      username:
        e.target.firstName.value.toLowerCase() +
        e.target.lastName.value.charAt(0).toLowerCase(),
      email: e.target.firstName.value.toLowerCase() + "@student.com",
      password:
        e.target.firstName.value.toLowerCase() + e.target.registerNo.value,
      roles: ["STUDENT"],
    };

    try {
      const userResponse = await createUserMutation.mutateAsync(userData);
      let guardianId;
      if (!guardianExists) {
        const parentGuardianData = {
          schoolId: 1,
          fatherName: e.target.fatherName.value,
          motherName: e.target.motherName.value,
          otherFamilyMemberName: e.target.guardianName.value,
          relation: e.target.guardianRelation.value,
          occupation: e.target.guardianOccupation.value,
          education: e.target.guardianEducation.value,
          phoneNumber: e.target.guardianMobile.value,
          email: e.target.guardianEmail.value,
          address: {
            city: e.target.guardianCity.value,
            state: e.target.guardianState.value,
          },
        };
        const parentGuardianResponse =
          await createParentGuardianMutation.mutateAsync(parentGuardianData);
        guardianId = parentGuardianResponse.parentId;
      }

      await createStudent({
        schoolId: 1,
        userId: userResponse.userId,
        registId: e.target.registerNo.value,
        roll: e.target.roll.value,
        admissionDate: e.target.admissionDate.value,
        classId: e.target.class.value,
        sectionId: e.target.section.value,
        category: e.target.category.value,
        firstName: e.target.firstName.value,
        lastName: e.target.lastName.value || e.target.firstName.value,
        nationalId: e.target.registerNo.value,
        dateOfBirth: e.target.dateOfBirth.value,
        gender: e.target.gender.value,
        contactInfo: "+251987654321",
        address: { city: "Addis Ababa", state: "Addis Ababa" },
        username:
          e.target.firstName.value.toLowerCase() +
          e.target.lastName.value.charAt(0).toLowerCase(),
        isActive: "ACTIVE",
        isPassed: "PASSED",
        parentId: guardianExists ? parentId : guardianId,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl rounded-lg bg-white p-6 shadow-lg">
        <h1 className="mb-6 flex items-center text-2xl font-bold text-gray-800">
          <School className="mr-2 h-6 w-6" />
          Create Admission
        </h1>
        <form onSubmit={handleSubmit}>
          <section className="mb-8">
            <SectionHeader icon="🎓" title="Academic Details" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <InputField
                label="Academic Year"
                name="academicYear"
                type="select"
                required
              >
                <option>2025-2026</option>
              </InputField>
              <InputField
                label="Register No"
                name="registerNo"
                defaultValue="ISC-0001"
                required
              />
              <InputField label="Roll" name="roll" />
              <InputField
                label="Admission Date"
                name="admissionDate"
                type="date"
                defaultValue="2025-01-12"
                required
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <InputField label="Class" name="class" type="select" required>
                <option>Select Class</option>
                <option value={1}>Class One</option>
                <option value={2}>Class Two</option>
              </InputField>
              <InputField label="Section" name="section" type="select" required>
                <option>Select Section</option>
                <option value={1}>A</option>
                <option value={2}>B</option>
              </InputField>
              <InputField
                label="Category"
                name="category"
                type="select"
                required
              >
                <option>Select</option>
              </InputField>
            </div>
          </section>
          <section className="mb-8">
            <SectionHeader icon="👤" title="Student Details" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <InputField
                label="First Name"
                name="firstName"
                icon={User}
                required
              />
              <InputField
                label="Last Name"
                name="lastName"
                icon={User}
                required
              />
              <InputField label="Gender" name="gender" type="select">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </InputField>
              <InputField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <InputField
                label="Present Address"
                name="presentAddress"
                type="textarea"
                rows={3}
              />
              <InputField
                label="Permanent Address"
                name="permanentAddress"
                type="textarea"
                rows={3}
              />
            </div>
            <ImageUpload
              label="Profile Picture"
              name="profilePicture"
              image={showProfilePicture}
              onChange={(file) =>
                setShowProfilePicture(URL.createObjectURL(file))
              }
            />
          </section>
          <section className="mb-8">
            <SectionHeader icon="👥" title="Guardian Details" />
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="guardianExists"
                  className="rounded border-gray-300"
                  onChange={(e) => setGuardianExists(!guardianExists)}
                  checked={guardianExists}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Guardian Already Exist
                </span>
              </label>
            </div>
            {guardianExists && (
              <div className="mt-4">
                <InputField
                  label="Select Guardian"
                  name="parentId"
                  type="select"
                  onChange={(e) => setParentId(e.target.value)}
                >
                  <option value="">Select a guardian</option>
                  {parentData.map((parent) => (
                    <option key={parent.parentId} value={parent.parentId}>
                      {parent.fatherName} & {parent.motherName}
                    </option>
                  ))}
                </InputField>
              </div>
            )}
            {!guardianExists && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="Name" name="guardianName" required />
                  <InputField
                    label="Relation"
                    name="guardianRelation"
                    required
                  />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <InputField label="Father Name" name="fatherName" />
                  <InputField label="Mother Name" name="motherName" />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <InputField
                    label="Occupation"
                    name="guardianOccupation"
                    required
                  />
                  <InputField
                    label="Education"
                    name="guardianEducation"
                    required
                  />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <InputField label="City" name="guardianCity" />
                  <InputField label="State" name="guardianState" />
                  <InputField
                    label="Mobile No"
                    name="guardianMobile"
                    icon={Phone}
                    required
                  />
                  <InputField
                    label="Email"
                    name="guardianEmail"
                    icon={Mail}
                    type="email"
                    required
                  />
                </div>
                <ImageUpload
                  label="Guardian Picture"
                  name="guardianPicture"
                  image={showGuardianPicture}
                  onChange={(file) =>
                    setShowGuardianPicture(URL.createObjectURL(file))
                  }
                />
              </>
            )}
          </section>
          <section className="mb-8">
            <SectionHeader
              icon={<School className="mr-2 h-6 w-6" />}
              title="Previous School Details"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="School Name" name="previousSchoolName" />
              <InputField
                label="Qualification"
                name="previousSchoolQualification"
              />
            </div>
            <div className="mt-4">
              <InputField
                label="Remarks"
                name="remarks"
                type="textarea"
                rows={3}
              />
            </div>
          </section>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdmissionForm;
