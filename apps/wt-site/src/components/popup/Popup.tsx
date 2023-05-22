import React from "react";
import { useMantineTheme } from "@mantine/core";
import { OverlayView } from "@react-google-maps/api";

interface PopupProps {
  latitude: number;
  longitude: number;
}

export default function Popup({ latitude, longitude }: PopupProps) {
  const theme = useMantineTheme();
  return (
    <>
      <OverlayView
        mapPaneName={"floatPane"}
        position={{
          lat: latitude,
          lng: longitude,
        }}
      >
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
    </>
  );
}
