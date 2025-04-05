"use client";

import React, { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSchool } from "@/lib/api/tenantService/school";
import { useUserCounts } from "@/lib/api/userManagementService/user";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Avatar,
  Divider,
} from "@mui/material";
import { styled } from "@mui/system";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
  },
}));

const StatBadge = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(1, 2),
  borderRadius: "20px",
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.grey[800],
  fontWeight: 600,
}));

const SchoolDetails = () => {
  const router = useRouter();
  const  schoolId  = useParams().id;
  console.log("school iid is : ", schoolId);
  
  const {
    data: school,
    isLoading: schoolLoading,
    error: schoolError,
  } = useSchool(schoolId);
  const {
    data: userCounts,
    isLoading: countsLoading,
    error: countsError,
  } = useUserCounts(schoolId);

  const schoolDetails = useMemo(() => {
    if (!school || !userCounts) return null;
    return {
      name: school.school_name || "Unknown",
      address: school.addresses?.[0]
        ? `${school.addresses[0].address_line}, ${school.addresses[0].city}, ${school.addresses[0].country}`
        : "No address",
      contact: school.contact_number || "N/A",
      email: school.email_address || "N/A",
      type: school.school_type || "N/A",
      established: school.establishment_date || "N/A",
      joined: school.created_at || "N/A", // Use created_at as join date
      info: school.school_information || "No additional information",
      logo: school.logo || "/default-school-logo.png",
      students: userCounts.students || 0,
      parents: userCounts.parents || 0,
      teachers: userCounts.teachers || 0,
      staff: userCounts.staff || 0,
      totalUsers:
        (userCounts.students || 0) +
        (userCounts.parents || 0) +
        (userCounts.teachers || 0) +
        (userCounts.staff || 0),
    };
  }, [school, userCounts]);

  if (schoolLoading || countsLoading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (schoolError || countsError) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Typography color="error">
          Error: {schoolError?.message || countsError?.message}
        </Typography>
      </Box>
    );
  }

  if (!schoolDetails) return null;

  return (
    <Box className="min-h-screen bg-gray-100 p-6">
      <Button
        variant="contained"
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/school")}
        className="mb-6 bg-blue-600 hover:bg-blue-700 text-white"
      >
        Back to Schools
      </Button>

      <Paper className="p-6 rounded-xl shadow-lg max-w-5xl mx-auto">
        <Box className="flex items-center gap-4 mb-6">
          <Avatar
            src={schoolDetails.logo}
            alt={schoolDetails.name}
            className="w-20 h-20"
          />
          <Box>
            <Typography variant="h4" className="font-bold text-gray-800">
              {schoolDetails.name}
            </Typography>
            <Typography variant="subtitle1" className="text-gray-600">
              {schoolDetails.type}
            </Typography>
          </Box>
        </Box>

        <Divider className="mb-6" />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography
                  variant="h6"
                  className="font-semibold text-gray-700 mb-2"
                >
                  School Information
                </Typography>
                <Box className="space-y-2">
                  <Typography className="text-gray-600">
                    <strong>Address:</strong> {schoolDetails.address}
                  </Typography>
                  <Typography className="text-gray-600">
                    <strong>Contact:</strong> {schoolDetails.contact}
                  </Typography>
                  <Typography className="text-gray-600">
                    <strong>Email:</strong> {schoolDetails.email}
                  </Typography>
                  <Typography className="text-gray-600">
                    <strong>Established:</strong> {schoolDetails.established}
                  </Typography>
                  <Typography className="text-gray-600">
                    <strong>Joined System:</strong> {schoolDetails.joined}
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography
                  variant="h6"
                  className="font-semibold text-gray-700 mb-2"
                >
                  Additional Details
                </Typography>
                <Typography className="text-gray-600">
                  {schoolDetails.info}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        <Typography variant="h5" className="font-bold text-gray-800 mt-6 mb-4">
          User Statistics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <StyledCard className="bg-blue-50">
              <CardContent className="text-center">
                <Typography variant="h6" className="text-blue-700">
                  Students
                </Typography>
                <StatBadge className="mt-2">{schoolDetails.students}</StatBadge>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StyledCard className="bg-green-50">
              <CardContent className="text-center">
                <Typography variant="h6" className="text-green-700">
                  Parents
                </Typography>
                <StatBadge className="mt-2">{schoolDetails.parents}</StatBadge>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StyledCard className="bg-purple-50">
              <CardContent className="text-center">
                <Typography variant="h6" className="text-purple-700">
                  Teachers
                </Typography>
                <StatBadge className="mt-2">{schoolDetails.teachers}</StatBadge>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StyledCard className="bg-orange-50">
              <CardContent className="text-center">
                <Typography variant="h6" className="text-orange-700">
                  Staff
                </Typography>
                <StatBadge className="mt-2">{schoolDetails.staff}</StatBadge>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        <Box className="mt-6 flex justify-end gap-4">
          {/* <Button
            variant="outlined"
            onClick={() => router.push(`/schools/update/${schoolId}`)}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Edit School
          </Button> */}
          <Button
            variant="contained"
            onClick={() => router.push(`/school`)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            View All Schools
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default React.memo(SchoolDetails);
