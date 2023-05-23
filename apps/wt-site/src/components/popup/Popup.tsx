import { Title, useMantineTheme, Text } from "@mantine/core";
import { OverlayView } from "@react-google-maps/api";

interface PopupProps {
  latitude: number;
  longitude: number;
  post: any;
}

export default function Popup({ latitude, longitude, post }: PopupProps) {
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
            backgroundColor: theme.colors.dark["7"],
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
          }}
        >
          <Title>{post.title}</Title>
          <Text>{post.description}</Text>
        </div>
      </OverlayView>
    </>
  );
}
