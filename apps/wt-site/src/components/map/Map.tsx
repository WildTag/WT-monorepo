import { useEffect, useState } from "react";
import { GoogleMap, Marker, MarkerClusterer, useJsApiLoader } from "@react-google-maps/api";
import { Post } from "../../types/Post";
import {
  Drawer,
  ScrollArea,
  Image,
  Text,
  useMantineTheme,
  Divider,
  Avatar,
  Flex,
  Title,
  Textarea,
  Menu,
  UnstyledButton,
  Modal,
  Button,
  TextInput,
  MediaQuery,
} from "@mantine/core";
import ms from "ms";
import {
  AlertCircle,
  AspectRatio,
  ChevronDown,
  Pencil,
  Rotate,
  Send,
  ThumbUp,
  Trash,
} from "tabler-icons-react";
import { getRandomProfilePicture } from "../../helpers/getRandomProfilePicture";
import TagComponent from "../badges/TagComponent";
import { Account } from "../../types/Account";
import { Role } from "../../types/Role";
import AnimalMultiSelect from "../selects/animalMultiSelect/AnimalMultiSelect";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Comment } from "../../types/Post";
import { useFullscreen } from "@mantine/hooks";

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

const containerStyle = {
  display: "flex",
  width: "100%",
  height: "100vh",
};
interface MapProps {
  posts: Post[] | null;
  account: Account | null;
  handlePostDelete: (postId: number) => void;
  handlePostComment: (postId: number, commentText: string) => void;
  setPosts: (posts: Post[]) => void;
}

export default function Map({
  posts,
  account,
  handlePostDelete,
  handlePostComment,
  setPosts,
}: MapProps) {
  const theme = useMantineTheme();
  const [selectedPost, setSelectedPost] = useState<Post | null>();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [toggleRef, setToggleRef] = useState(false);
  const [editPostModalOpened, setEditPostModalOpened] = useState(false);
  const [position, setPosition] = useState({
    lat: 53.1047,
    lng: -1.5624,
  });
  const [editCommentModalOpened, setEditCommentModalOpened] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_API_GOOGLEMAP,
  });

  const editPostForm = useForm({
    initialValues: {
      post_id: -1,
      title: "",
      description: "",
      animals: [],
    },
  });

  useEffect(() => {
    if (!selectedPost || !posts) return;
    const newSelectedPost = posts.find((post) => post.pictureId === selectedPost.pictureId);
    setSelectedPost(newSelectedPost);
  }, [posts]);

  useEffect(() => {
    if (!selectedPost || !editPostModalOpened) return;
    editPostForm.setValues({
      post_id: selectedPost.pictureId,
      title: selectedPost.title,
      description: selectedPost.description,
      animals: selectedPost.postTags.map((tag) => tag.tag.toLowerCase()),
    });
  }, [editPostModalOpened]);

  const handleEditComment = async () => {
    if (!selectedComment) return;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/comments/${selectedComment.commentId}/edit`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("sessionToken") || "",
        },
        body: JSON.stringify(editCommentForm.values),
      }
    );

    const data = await response.json();
    if (response.status !== 200) {
      return notifications.show({
        title: "Error",
        message: data.detail,
      });
    }
    notifications.show({
      title: "Success",
      message: data.detail,
    });

    const tmpPosts = JSON.parse(JSON.stringify(posts)) as Post[];
    tmpPosts.map((post) => {
      if (post.pictureId === selectedPost?.pictureId) {
        post.comments.map((comment) => {
          if (comment.commentId === selectedComment.commentId) {
            comment.commentText = editCommentForm.values.comment_text || "";
          }
        });
      }
    });

    setPosts(tmpPosts);
    setEditCommentModalOpened(false);
  };

  const handleEditPost = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/posts/${selectedPost?.pictureId}/edit`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("sessionToken") || "",
        },
        body: JSON.stringify(editPostForm.values),
      }
    );
    const data = await response.json();
    if (response.status !== 200) {
      return notifications.show({
        title: "Error",
        message: data.detail,
        color: "red",
      });
    }
    setSelectedPost(data.post);
    setEditPostModalOpened(!editPostModalOpened);

    return notifications.show({
      title: "Success",
      message: data.detail,
      color: "green",
    });
  };

  const handleDeleteComment = async (commentId: number) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/comments/${commentId}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("sessionToken") || "",
      },
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

    const tmpPosts = JSON.parse(JSON.stringify(posts)) as Post[];
    const newPosts = tmpPosts.map((post) => {
      if (post.pictureId !== selectedPost?.pictureId) return post;
      post.comments = post.comments.filter((comment) => comment.commentId !== commentId);
      return post;
    });
    setPosts(newPosts);
  };

  const handleReportPost = async (postId: number) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/report`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("sessionToken") || "",
      },
    });
    const data = await response.json();
    if (response.status !== 200) {
      return notifications.show({
        title: "Error",
        message: data.detail,
        color: "red",
      });
    }

    return notifications.show({
      title: "Success",
      message: data.detail,
      color: "green",
    });
  };

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({
          lat: coords.latitude,
          lng: coords.longitude,
        });
      },
      (error) => {
        setPosition((prevState) => ({
          ...prevState,
          loaded: true,
          error,
        }));
      }
    );
  }, []);

  const editCommentForm = useForm({
    initialValues: {
      comment_id: selectedComment?.commentId,
      comment_text: selectedComment?.commentText,
    },
  });

  useEffect(() => {
    editCommentForm.setFieldValue("comment_id", selectedComment?.commentId);
    editCommentForm.setFieldValue("comment_text", selectedComment?.commentText);
  }, [selectedComment]);

  return (
    <>
      <Modal
        zIndex={1000}
        title={"Upload"}
        opened={editCommentModalOpened}
        onClose={() => setEditCommentModalOpened(!editCommentModalOpened)}
        size={"xl"}
      >
        <form
          onSubmit={editCommentForm.onSubmit(() => {
            handleEditComment();
          })}
        >
          <TextInput label={"Comment"} {...editCommentForm.getInputProps("comment_text")} />
          <Button mt={10} type="submit">
            Edit comment
          </Button>
        </form>
      </Modal>
      <Modal
        zIndex={1000}
        title={"Edit post"}
        opened={editPostModalOpened}
        onClose={() => setEditPostModalOpened(false)}
      >
        <form onSubmit={editPostForm.onSubmit(() => handleEditPost())}>
          <Textarea autosize label={"title"} {...editPostForm.getInputProps("title")} />
          <Textarea autosize label={"description"} {...editPostForm.getInputProps("description")} />
          <AnimalMultiSelect form={editPostForm} label={"Edit tags"} />
          <Button type="submit" mt={10}>
            Edit post
          </Button>
        </form>
      </Modal>
      <div>
        <Drawer
          title="Wildtag"
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
          <Flex align={"center"} justify={"space-between"}>
            <Flex gap={8}>
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
                  <Menu.Item
                    icon={<Pencil size={15} />}
                    onClick={() => setEditPostModalOpened(!editPostModalOpened)}
                  >
                    Edit post
                  </Menu.Item>
                )}
                {selectedPost?.uploader?.accountId !== account?.accountId && (
                  <Menu.Item
                    icon={<AlertCircle size={15} />}
                    onClick={() => {
                      if (!selectedPost?.pictureId) return;
                      handleReportPost(selectedPost?.pictureId);
                    }}
                  >
                    Report post
                  </Menu.Item>
                )}
                {(account?.permission === Role.ADMINISTRATOR ||
                  account?.permission === Role.MODERATOR) && (
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
              marginBottom: theme.spacing.sm,
              marginTop: theme.spacing.sm,
            }}
          >
            <Title size={17} mb={5}>
              {selectedPost?.title}
            </Title>
            <Divider size="md" />
            <Text>{selectedPost?.description}</Text>
          </div>
          <Flex gap={5} mb={10} wrap={"wrap"}>
            {selectedPost?.postTags.map((tag) => {
              return <TagComponent tag={tag} theme={theme} />;
            })}
          </Flex>

          <UnstyledButton
            onClick={() => {
              if (window.innerWidth > 757) {
                setToggleRef(true);
              }
            }}
          >
            <Image
              src={`data:image/jpeg;base64,${selectedPost?.image || ""}`}
              fit="cover"
              radius={10}
            />
          </UnstyledButton>

          <Modal
            transitionProps={{ transition: "fade", duration: 200 }}
            opened={toggleRef}
            onClose={() => setToggleRef(false)}
            fullScreen
            display={"block"}
          >
            <div style={{ maxWidth: "100%", maxHeight: "50%", objectFit: "contain" }}>
              <Image
                src={`data:image/jpeg;base64,${selectedPost?.image || ""}`}
                fit="contain"
                radius={10}
                style={{
                  display: "block",
                  width: "120vh",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
            </div>
          </Modal>
          <Textarea
            autosize
            label="Create a comment"
            value={commentText}
            style={{
              userSelect: "none",
              background: theme.colors.dark[6],
              padding: theme.spacing.sm,
              borderRadius: theme.radius.sm,
              marginTop: theme.spacing.sm,
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
          <div>
            {selectedPost?.comments?.map((comment) => (
              <>
                <Flex
                  direction={"column"}
                  style={{
                    marginTop: theme.spacing.sm,
                    background: theme.colors.dark[6],
                    padding: theme.spacing.sm,
                    borderRadius: theme.radius.sm,
                  }}
                  justify={"flex-end"}
                >
                  <Flex align={"center"} justify={"space-between"}>
                    <Flex align="center" gap="sm">
                      <Flex direction="column" align="center">
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
                        <Title size={18}>{comment.commenter.username}</Title>
                        <Text size={12}>{comment.commentText}</Text>
                      </div>
                    </Flex>
                    {(comment.commenter.accountId === account?.accountId ||
                      account?.permission === Role.ADMINISTRATOR ||
                      account?.permission === Role.MODERATOR) && (
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <UnstyledButton>
                            <ChevronDown cursor={"pointer"} />
                          </UnstyledButton>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Label>Application</Menu.Label>
                          <Menu.Item
                            onClick={() => {
                              if (!comment) return;
                              setSelectedComment(comment);
                              setEditCommentModalOpened(!editCommentModalOpened);
                            }}
                            icon={<Pencil color={theme.colors.blue[6]} size={14} />}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            onClick={() => {
                              handleDeleteComment(comment.commentId);
                            }}
                            icon={<Trash color={theme.colors.red[5]} size={14} />}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    )}
                  </Flex>
                  <Flex justify={"flex-end"} align="center">
                    {/* <ThumbUp color={theme.colors.blue[5]} cursor={"pointer"} /> */}
                    {/* <Text size={12}>{comment.likes}</Text> */}
                  </Flex>
                </Flex>
              </>
            ))}
          </div>
        </Drawer>
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={position}
            zoom={12}
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
