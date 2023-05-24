import { useEffect, useState } from "react";
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
  Textarea,
  Menu,
  UnstyledButton,
} from "@mantine/core";
import ms from "ms";
import { AlertCircle, ChevronDown, Pencil, Send, Trash } from "tabler-icons-react";
import { getRandomProfilePicture } from "../../helpers/getRandomProfilePicture";
import TagComponent from "../badges/TagComponent";
import { Account } from "../../types/Account";
import { Role } from "../../types/Role";

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
  hare: "/markerImages/hareMarker.png",
  kestrel: "/markerImages/kestrelMarker.png",
  other: "/markerImages/otherMarker.png",
};

interface MapProps {
  posts: Post[] | null;
  account: Account | null;
  handlePostDelete: (postId: number) => void;
  handlePostComment: (postId: number, commentText: string) => void;
}

export default function Map({ posts, account, handlePostDelete, handlePostComment }: MapProps) {
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

  useEffect(() => {
    if (!selectedPost || !posts) return;
    const newSelectedPost = posts.find((post) => post.pictureId === selectedPost.pictureId);
    setSelectedPost(newSelectedPost);
  }, [posts]);

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
          <Flex align={"center"} gap={5} justify={"space-between"}>
            <Flex gap={10}>
              <Avatar
                p={2}
                src={
                  selectedPost?.uploader?.profileImage
                    ? `data:image/jpeg;base64,${selectedPost?.uploader.profileImage || ""}`
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
            <Menu shadow="md" width={200} withinPortal>
              <Menu.Target>
                <UnstyledButton>
                  <ChevronDown cursor={"pointer"} />
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Public</Menu.Label>
                {(selectedPost?.uploader?.accountId === account?.accountId ||
                  account?.permission === Role.ADMINISTRATOR) && (
                  <Menu.Item icon={<Pencil size={15} />}>Edit post</Menu.Item>
                )}
                {selectedPost?.uploader?.accountId !== account?.accountId && (
                  <Menu.Item icon={<AlertCircle size={15} />}>Report post</Menu.Item>
                )}
                {account?.permission === Role.ADMINISTRATOR && (
                  <>
                    <Menu.Divider />
                    <Menu.Label>Moderation</Menu.Label>
                    <Menu.Item
                      color="red"
                      icon={<Trash size={15} />}
                      onClick={() => {
                        if (!selectedPost?.pictureId) return;
                        handlePostDelete(selectedPost.pictureId);
                        setOpenDrawer(false);
                      }}
                    >
                      Delete post
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
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
          <Textarea
            autosize
            label="Create comment"
            value={commentText}
            style={{
              userSelect: "none",
              background: theme.colors.dark[6],
              padding: theme.spacing.sm,
              borderRadius: theme.radius.sm,
              marginTop: "10px",
            }}
            placeholder="How does this post make you feel?"
            onChange={(element) => {
              setCommentText(element.currentTarget.value);
            }}
            rightSection={
              <Send
                size="25"
                cursor={"pointer"}
                onClick={() => {
                  if (!selectedPost?.pictureId) return;
                  handlePostComment(selectedPost.pictureId, commentText);
                  setCommentText("");
                }}
              />
            }
          />
          <div style={{ paddingTop: theme.spacing.sm }}>
            {selectedPost?.comments?.map((comment) => (
              <Group
                key={comment.commentId}
                style={{
                  marginTop: 10,
                  padding: theme.spacing.sm,
                  background: theme.colors.dark[6],
                  borderRadius: 10,
                }}
              >
                <Flex align={"start"} gap={10}>
                  <Flex direction={"column"} gap={5} align={"center"}>
                    <Avatar
                      src={
                        comment.commenter.profileImage
                          ? `data:image/jpeg;base64,${comment.commenter.profileImage || ""}`
                          : getRandomProfilePicture()
                      }
                      radius={theme.radius.md}
                      style={{ backgroundColor: theme.colors.blue[5] }}
                    />
                    <Text size={10} color={theme.colors.gray[6]}>
                      {ms(new Date().getTime() - new Date(comment.created).getTime())} ago
                    </Text>
                  </Flex>
                  <div>
                    <Flex direction={"column"} gap={5}>
                      <Title size={20} style={{ marginBottom: 0 }}>
                        {comment.commenter.username}
                      </Title>
                      <Text>{comment.commentText}</Text>
                    </Flex>
                  </div>
                </Flex>
              </Group>
            ))}
          </div>
        </Drawer>
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={position}
            zoom={6}
            options={{
              minZoom: 2,
              maxZoom: 16,
              fullscreenControl: false,
              styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
            }}
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
