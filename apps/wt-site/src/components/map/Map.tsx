import { useState } from "react";
import { GoogleMap, Marker, MarkerClusterer, useJsApiLoader } from "@react-google-maps/api";
import { Post } from "../../types/Post";
import {
  Drawer,
  ScrollArea,
  Image,
  Group,
  Text,
  useMantineTheme,
  Divider,
  Avatar,
  Flex,
  Title,
  TextInput,
  Loader,
} from "@mantine/core";
import ms from "ms";
import { ArrowRightCircle, BrandSublimeText, Send } from "tabler-icons-react";
import { notifications } from "@mantine/notifications";
import { getRandomProfilePicture } from "../../helpers/getRandomProfilePicture";
import TagComponent from "../badges/TagComponent";

interface MapProps {
  posts: Post[] | null;
}

const markers = {
  duck: "/markerImages/duckMarker.png",
  swan: "/markerImages/swanMarker.png",
  heron: "/markerImages/heronMarker.png",
  pidgeon: "/markerImages/pidgeonMarker.png",
  magpie: "/markerImages/magpieMarker.png",
  chaffinch: "/markerImages/chaffinchMarker.png",
  badger: "/markerImages/badgerMarker.png",
  stoat: "/markerImages/stoatMarker.png",
  squirrel: "/markerImages/squirrelMarker.png",
  other: "/markerImages/otherMarker.png",
};

export default function Map({ posts }: MapProps) {
  const theme = useMantineTheme();
  const [selectedPost, setSelectedPost] = useState<Post | null>();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [position, setPosition] = useState<any>({
    lat: 53.1047,
    lng: -1.5624,
  });
  const containerStyle = {
    display: "flex",
    width: "100%",
    height: "100vh",
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_API_GOOGLEMAP,
  });

  const handlePostComment = async () => {
    if (!selectedPost || !selectedPost.pictureId) {
      return notifications.show({
        title: "Error",
        message: "Invalid postId",
        color: "red",
      });
    }
    const response = await fetch(`${import.meta.env.VITE_API_URL}/comments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("sessionToken") || "",
      },
      body: JSON.stringify({
        picture_id: selectedPost.pictureId,
        comment_text: commentText,
      }),
    });

    const data = await response.json();
    if (response.status !== 200) {
      return notifications.show({
        title: "Error",
        message: data.detail,
        color: "red",
      });
    }

    notifications.show({
      title: "Success",
      message: data.detail,
      color: "green",
    });
  };

  return (
    <>
      <div>
        <Drawer
          opened={openDrawer}
          onClose={() => {
            setOpenDrawer(false);
            setSelectedPost(null);
          }}
          scrollAreaComponent={ScrollArea.Autosize}
          styles={{
            title: {
              fontSize: theme.fontSizes.xl,
              fontWeight: "bold",
            },
          }}
        >
          <Group>
            <Flex align={"center"} gap={5}>
              <Avatar
                p={2}
                src={
                  selectedPost?.uploader?.profilePicture
                    ? `data:image/jpeg;base64,${selectedPost?.uploader?.profilePicture || ""}`
                    : getRandomProfilePicture()
                }
                radius={theme.radius.md}
                style={{ backgroundColor: theme.colors.blue[5], paddingTop: "" }}
              />
              <div>
                <Title size={20}>{selectedPost?.uploader?.username}</Title>
                <Text size={10} color={theme.colors.gray[6]}>
                  {new Date(selectedPost?.created || "").toDateString()} (
                  {ms(new Date().getTime() - new Date(selectedPost?.created || 0).getTime())} ago)
                </Text>
              </div>
            </Flex>
            <div
              style={{
                background: theme.colors.dark[6],
                borderRadius: theme.radius.sm,
                padding: theme.spacing.sm,
                width: "100%",
                marginBottom: "10px",
              }}
            >
              <Title size={17} mb={5}>
                {selectedPost?.title}
              </Title>
              <Divider size="md" />
              <Text>{selectedPost?.description}</Text>
            </div>
          </Group>
          <Flex gap={5} mb={10}>
            {selectedPost?.postTags.map((tag) => {
              return <TagComponent tag={tag} theme={theme} />;
            })}
          </Flex>
          <Image
            src={`data:image/jpeg;base64,${selectedPost?.image || ""}`}
            fit="contain"
            radius={10}
          />
          <TextInput
            label="Add Comment"
            style={{
              userSelect: "none",
              background: theme.colors.dark[6],
              padding: theme.spacing.sm,
              borderRadius: theme.radius.sm,
              marginTop: "10px",
            }}
            onKeyDownCapture={(e) => {
              if (e.key === "Enter") handlePostComment();
            }}
            placeholder="How does this post make you feel?"
            onChange={(element) => {
              setCommentText(element.currentTarget.value);
            }}
            rightSection={<Send size="25" cursor={"pointer"} onClick={() => handlePostComment()} />}
          />

          {selectedPost?.comments?.map((comment) => (
            <Group key={comment.commentId}>
              <Flex align={"center"} gap={5}>
                <Avatar
                  src={"/animalImages/lowPolyBadger.png"}
                  radius={theme.radius.md}
                  style={{ backgroundColor: theme.colors.blue[5] }}
                />
                <div>
                  <Title size={20}>{comment.commenter.username}</Title>
                  <Text>{comment.commentText}</Text>
                  <Text size={10} color={theme.colors.gray[6]}>
                    {new Date(comment.created).toDateString()} (
                    {ms(new Date().getTime() - new Date(comment.created).getTime())} ago)
                  </Text>
                </div>
              </Flex>
            </Group>
          ))}
        </Drawer>
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={position}
            zoom={6}
            options={{ minZoom: 2, maxZoom: 16 }}
          >
            <MarkerClusterer
              options={{
                gridSize: 50,
                maxZoom: 15,
              }}
            >
              {(clusterer) => (
                <>
                  {posts?.map((post: Post) => (
                    <Marker
                      key={post.pictureId}
                      position={{ lat: post.GPSLat, lng: post.GPSLong }}
                      icon={{
                        url: markers[post.postTags[0].tag.toLowerCase()],
                        scaledSize: new window.google.maps.Size(40, 60),
                      }}
                      onClick={() => {
                        setSelectedPost(post);
                        setOpenDrawer(true);
                        setPosition({ lat: post.GPSLat, lng: post.GPSLong });
                      }}
                      clusterer={clusterer}
                    />
                  ))}
                </>
              )}
            </MarkerClusterer>
          </GoogleMap>
        )}
      </div>
    </>
  );
}
