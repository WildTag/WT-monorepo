import {
  Accordion,
  Badge,
  Checkbox,
  Flex,
  Title,
  useMantineTheme,
  Text,
  MantineTheme,
  Image,
  Button,
  TextInput,
  Divider,
  Avatar,
} from "@mantine/core";
import CustomAppShell from "../../components/appShell/CustomAppShell";
import { useEffect, useMemo, useState } from "react";
import { Post } from "../../types/Post";
import ms from "ms";
import { Calendar } from "tabler-icons-react";
import { useSearchParams } from "react-router-dom";
import TagComponent from "../../components/badges/TagComponent";
import { notifications } from "@mantine/notifications";
import { getRandomProfilePicture } from "../../helpers/getRandomProfilePicture";

const PostManagement = () => {
  const [showImages, setShowImages] = useState(false);
  const [sortByNewest, setSortByNewest] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [refetch, setRefetch] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [reportedOnly, setReportedOnly] = useState(false);
  const [searchParams] = useSearchParams();
  const theme = useMantineTheme();
  const accessToken = localStorage.getItem("sessionToken");

  useEffect(() => {
    setSearchQuery(searchParams.get("accountId") || "");
  }, [searchParams]);

  useEffect(() => {
    const reportedPosts = posts.filter((post) => post.reported);
    if (reportedPosts.length === 0) return setReportedOnly(false);
    setReportedOnly(true);
  }, [posts]);

  useEffect(() => {
    async function fetchPosts() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (response.status !== 200) {
        return (window.location.href = "/login");
      }

      setPosts(data);

      setIsFetched(true);
    }
    setIsFetched(false);
    fetchPosts();
  }, [refetch]);

  useMemo(() => {
    posts.sort((a, b) => {
      if (sortByNewest) {
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      }
      return new Date(a.created).getTime() - new Date(b.created).getTime();
    });
  }, [sortByNewest]);

  useMemo(() => {
    console.log(reportedOnly);
    if (reportedOnly) return setFilteredPosts(posts.filter((post) => post.reported));
    if (!searchQuery) return setFilteredPosts(posts);
    setFilteredPosts(
      posts.filter((post) => {
        return (
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.uploader?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.uploader?.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    );
  }, [searchQuery, isFetched, posts, reportedOnly, sortByNewest]);

  const handleUserUnban = async (userId: number) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/unban`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken || "",
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
    setRefetch(!refetch);
  };

  const handleUserBan = async (userId: number) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/ban`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken || "",
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
    setRefetch(!refetch);
  };

  const handlePostDelete = async (postId: number) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken || "",
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
    setRefetch(!refetch);
  };

  return (
    <CustomAppShell selected={2}>
      <TextInput
        mb={10}
        label={"Search..."}
        placeholder="Search for a post title, email or account name"
        onChange={(element) => {
          setSearchQuery(element.currentTarget.value);
        }}
        value={searchQuery}
      />
      <Accordion defaultValue="customization" variant="contained">
        <Accordion.Item value="customization">
          <Accordion.Control>
            <Title size={20}>Filters</Title>
          </Accordion.Control>
          <Accordion.Panel>
            <Flex gap={20}>
              <Checkbox label="Show images" onChange={() => setShowImages(!showImages)} />
              <Checkbox label="Sort by newest" onChange={() => setSortByNewest(!showImages)} />
              <Checkbox
                label="Show reported items only"
                checked={reportedOnly}
                onChange={() => setReportedOnly(!reportedOnly)}
              />
            </Flex>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Flex wrap="wrap" gap={40} mt={20}>
        {filteredPosts.map((post) => {
          return (
            <PostComponent
              post={post}
              theme={theme}
              showImages={showImages}
              handleUserBan={handleUserBan}
              handleUserUnban={handleUserUnban}
              handlePostDelete={handlePostDelete}
            />
          );
        })}
      </Flex>
    </CustomAppShell>
  );
};

export default PostManagement;

interface PostProps {
  post: Post;
  theme: MantineTheme;
  showImages: boolean;
  handleUserBan: (accountId: number) => Promise<void>;
  handleUserUnban: (accountId: number) => Promise<void>;
  handlePostDelete: (postId: number) => Promise<void>;
}

const PostComponent = ({
  post,
  theme,
  showImages,
  handleUserBan,
  handleUserUnban,
  handlePostDelete,
}: PostProps) => {
  const [secondsPassed, setSecondsPassed] = useState("");

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsPassed(ms(new Date().getTime() - new Date(post.created).getTime()));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [post.created]);

  if (!post.uploader) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.colors.dark[6],
        padding: theme.spacing.md,
        borderRadius: theme.radius.sm,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "400px",
        }}
      >
        <div>
          <Badge p={theme.spacing.sm}>
            <Flex align={"center"} gap={5}>
              <Calendar />
              <Text>{secondsPassed} ago</Text>
            </Flex>
          </Badge>
          <Flex align="center" justify={"space-between"}>
            <Flex align={"center"} gap={5}>
              <Avatar
                src={
                  post.uploader.profileImage
                    ? `data:image/jpeg;base64,${post.uploader.profileImage || ""}`
                    : getRandomProfilePicture()
                }
                radius={theme.radius.md}
                style={{ backgroundColor: theme.colors.blue[5] }}
              />
              <Text>{post.uploader?.username}</Text>
              <Text>{post.uploader?.email}</Text>
            </Flex>
            {post.reported && <Badge color={"yellow"}>Post reported</Badge>}
          </Flex>
          <Title size={20}>{post.title}</Title>
          <Divider />
          <Text>{post.description}</Text>
          {showImages && (
            <Image src={`data:image/jpeg;base64,${post.image}`} radius={theme.radius.md} />
          )}
        </div>
        <Flex gap={5} mt={5}>
          {post.postTags.map((tag) => {
            return <TagComponent tag={tag} theme={theme} />;
          })}
        </Flex>
        <Flex gap={10} mt={10}>
          <Button
            color={"yellow"}
            onClick={() => {
              handlePostDelete(post.pictureId);
            }}
          >
            Delete
          </Button>
          <Button
            onClick={() => {
              if (!post.uploader) return null;
              if (post.uploader?.banned) {
                return handleUserUnban(post.uploader.accountId);
              }
              return handleUserBan(post.uploader.accountId);
            }}
            color={!post.uploader.banned ? "red" : "green"}
          >
            {!post.uploader.banned ? "Ban" : "Unban"}
          </Button>
        </Flex>
      </div>
    </div>
  );
};
