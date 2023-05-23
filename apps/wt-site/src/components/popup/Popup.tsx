import { Title, useMantineTheme, Text, Image } from "@mantine/core";
import { OverlayView } from "@react-google-maps/api";
import { X } from "tabler-icons-react";
import { Post } from "../../types/Post";

interface PopupProps {
  latitude: number;
  longitude: number;
  post: Post;
}

export default function Popup({ latitude, longitude, post }: PopupProps) {
  const theme = useMantineTheme();

  console.log(post.image);

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
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              cursor: "default",
              gap: "10px",
            }}
          >
            <div>
              <Title>{post.title}</Title>
              <Text>{post.description}</Text>
              <Text>Uploaded by: {post.uploader?.username}</Text>
              <Image src={`data:image/jpeg;base64,${post.image}`} width={256} height={256} />
            </div>
            <X cursor="pointer" color="red" />
          </div>
        </>
      </OverlayView>
    </>
  );
}
