import { Box, Typography, } from "@mui/material";

const CenteredBackdrop = ({ imgPath, title, children }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column", // Align title and children in a column
        paddingTop: { xs: "10%", sm: "8%", md: "5%" },
        justifyContent: "flex-start", // Align items from the start
        alignItems: "center", // Center content horizontally
        textAlign: "center",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${imgPath})`, // Dynamic image path
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          opacity: 0.4,
          zIndex: -1,
        },
      }}
    >
      {/* Title Section */}
      <Typography
        variant="h4"
        fontWeight="700"
        sx={{
          padding: "1rem",
          borderRadius: "8px",
          maxWidth: "90%",
          zIndex: 1,
        }}
      >
        {title}
      </Typography>

      {/* Container for selection options */}
      <Box
        sx={{
          marginTop: "2rem", // Space between title and children
          zIndex: 2, // Ensure content appears above the backdrop
          display: "flex",
          flexDirection: "column", // Stack children vertically
          alignItems: "center",
          width: "100%",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default CenteredBackdrop;