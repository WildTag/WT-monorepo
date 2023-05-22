import Map from "../../components/map/Map";
import { useMantineTheme, Center, Button } from "@mantine/core";
import { Upload } from "tabler-icons-react";

function Home() {
  const theme = useMantineTheme();
  return (
    <div style={{ position: "relative" }}>
      <Map />

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Button
          style={{
            padding: "0px",
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: theme.colors.dark["4"],
            opacity: "80%",
            zIndex: 5, // Ensure the button appears above the overlay
          }}
        >
          <Upload size={20} strokeWidth={3} />
        </Button>
      </div>
    </div>
  );
}

export default Home;
