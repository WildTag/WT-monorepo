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
  Group,
} from "@mantine/core";
import CustomAppShell from "../../components/appShell/CustomAppShell";
import { useEffect, useMemo, useState } from "react";
import { Post } from "../../types/Post";
import ms from "ms";
import { Calendar } from "tabler-icons-react";

const PostManagement = () => {
  const [showImages, setShowImages] = useState(true);
  const [sortByNewest, setSortByNewest] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const theme = useMantineTheme();

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
  }, []);

  useMemo(() => {
    posts.sort((a, b) => {
      if (sortByNewest) {
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      }
      return new Date(a.created).getTime() - new Date(b.created).getTime();
    });
  }, [sortByNewest]);

  useMemo(() => {
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
  }, [searchQuery, isFetched, posts]);

  return (
    <CustomAppShell selected={2}>
      <TextInput
        mb={10}
        label={"Search..."}
        placeholder="Search for a post title, email or account name"
        onChange={(element) => {
          setSearchQuery(element.currentTarget.value);
        }}
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
            </Flex>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Flex wrap="wrap" gap={40} mt={20}>
        {filteredPosts.map((post) => {
          return <PostComponent post={post} theme={theme} showImages={showImages} />;
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
}

const PostComponent = ({ post, theme, showImages }: PostProps) => {
  const [secondsPassed, setSecondsPassed] = useState("");

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsPassed(ms(new Date().getTime() - new Date(post.created).getTime()));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [post.created]);

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
          width: "100%",
        }}
      >
        <div>
          <Badge p={theme.spacing.sm}>
            <Flex align={"center"} gap={5}>
              <Calendar />
              <Text>{secondsPassed} ago</Text>
            </Flex>
          </Badge>
          <Group>
            <Text>{post.uploader?.username}</Text>
            <Text>{post.uploader?.email}</Text>
          </Group>
          <Title>{post.title}</Title>
          <Text>{post.description}</Text>
          {showImages && (
            <Image
              src={`data:image/jpeg;base64,${post.image}`}
              height={256}
              radius={theme.radius.md}
            />
          )}
        </div>
        <Flex gap={5} mt={5}>
          <Text>Tags:</Text>
          {post.postTags.map((tag) => {
            return (
              <Badge p={theme.spacing.sm} radius={theme.radius.md} color={"blue"}>
                {tag.tag}
              </Badge>
            );
          })}
        </Flex>
        <Flex gap={10} mt={10}>
          <Button color={"yellow"}>Delete</Button>
          <Button color={"red"}>Ban</Button>
        </Flex>
      </div>
    </div>
  );
};
