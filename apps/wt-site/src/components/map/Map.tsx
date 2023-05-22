import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker, OverlayView } from "@react-google-maps/api";
import { Popover, useMantineTheme } from "@mantine/core";

function Map() {
  const [open, setOpen] = useState(false);
  const theme = useMantineTheme();
  const containerStyle = {
    display: "flex",
    width: "100%",
    height: "100vh",
  };

  const center = {
    lat: 53.1047,
    lng: -1.5624,
  };

  return (
    <>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_API_GOOGLEMAP}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={8}>
          <Marker
            position={center}
            icon={""}
            onClick={() => {
              setOpen(!open);
            }}
          ></Marker>

          {open && (
            <OverlayView mapPaneName={"floatPane"} position={center}>
              <div
                style={{
                  borderColor: theme.colors.dark["9"],
                }}
              >
                <div
                  style={{
                    backgroundColor: theme.colors.dark["7"],
                    padding: theme.spacing.xl,
                    borderRadius: theme.radius.md,
                  }}
                >
                  <h1>hey sisters</h1>
                </div>
              </div>
            </OverlayView>
          )}
        </GoogleMap>
      </LoadScript>
    </>
  );
}

export default Map;
