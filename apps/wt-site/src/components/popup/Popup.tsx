import { Title, useMantineTheme, Text, Image, Stack } from "@mantine/core";
import { OverlayView } from "@react-google-maps/api";
import { X } from "tabler-icons-react";
import { Post } from "../../types/Post";

interface PopupProps {
  latitude: number;
  longitude: number;
  post: Post;
  setSelectedPost: (value: Post | null) => void;
}

export default function Popup({ latitude, longitude, post, setSelectedPost }: PopupProps) {
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
        <>
          <div
            style={{
              display: "flex",
              backgroundColor: theme.colors.dark["7"],
              borderRadius: theme.radius.lg,
              padding: theme.radius.md,
              cursor: "default",
              maxWidth: "50%", // Limit the maximum width if needed
            }}
          >
            <div style={{ display: "flex", paddingRight: "100px", flex: 1 }}>
              <Stack>
                <Title style={{ width: theme.spacing.lg }}>{post.title}</Title>
                <Text>{post.description}</Text>
                <Text
                  style={{
                    // backgroundColor: theme.colors.dark[3],
                    position: "absolute",
                  }}
                >
                  Uploaded by: {post.uploader?.username}
                </Text>
              </Stack>
            </div>
            <div style={{}}>
              <Image
                src={`data:image/jpeg;base64,${post.image}`}
                width={"100%"}
                height={"75%"}
                fit="contain"
                radius={10}
              />
            </div>
          </div>
        </>
      </OverlayView>
    </>
  );
}
