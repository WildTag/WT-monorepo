import Map from "../../components/map/Map";
import { useMantineTheme, Center, Button } from "@mantine/core";

function Home() {
  const theme = useMantineTheme();
  return (
    <div style={{ position: "relative" }}>
      <Map />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          opacity: "70%",
          left: 0,
          width: "100%",
          backgroundColor: theme.colors.dark["9"], // Customize the overlay background color and opacity
          zIndex: 1, // Adjust the z-index to position the overlay correctly
        }}
      >
        <Center>
          <Button></Button>
        </Center>
      </div>
    </div>
  );
}

export default Home;
