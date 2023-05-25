import Map from "../../components/map/Map";
import {
  useMantineTheme,
  Button,
  Group,
  Input,
  Menu,
  Drawer,
  ScrollArea,
  Anchor,
  MediaQuery,
  Radio,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "@mantine/form";
import { Upload, Filter, User, Settings, Logout, Hammer } from "tabler-icons-react";
import CreatePostModal from "../../components/modals/CreatePostModal";
import { Loading } from "../../components/loading/Loading";
import { Post } from "../../types/Post";
import { notifications } from "@mantine/notifications";
import { UploadedImage } from "../../types/UploadedImage";
import AnimalMultiSelect from "../../components/selects/animalMultiSelect/AnimalMultiSelect";
import { DatePickerInput } from "@mantine/dates";
import { Account } from "../../types/Account";
import { Role } from "../../types/Role";

function Home() {
  const [postModalOpened, setPostModalOpened] = useState(false);
  const [files, setFiles] = useState<UploadedImage[]>([]);
  const [accountInfo, setAccountInfo] = useState<Account | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const accessToken = localStorage.getItem("sessionToken");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refetchPosts, setRefetchPosts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useMemo(() => {
    setFilteredPosts(posts);
    if (!posts) return;
    setFilteredPosts(
      posts.filter((post) => {
        if (!post) return;
        return (
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.uploader?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.uploader?.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    );
  }, [searchQuery, posts]);

  const theme = useMantineTheme();

  const initialValues = {
    session_token: accessToken,
    animals: [],
    title: "",
    description: "",
    gps_lat: 0,
    gps_long: 0,
    images: files,
    date_time_original: new Date(),
  };

  const form = useForm({
    initialValues: initialValues,
    validate: {
      title: (value) => {
        return value.trim().length <= 0 ? "A post must have a title" : null;
      },
      description: (value) => {
        return value.trim().length <= 0 ? "A post must have a description" : null;
      },
      gps_lat: (value) => {
        return !value ? "You must choose a location" : null;
      },
      gps_long: (value) => {
        return !value ? "You must choose a location" : null;
      },
      animals: (value) => {
        return value.length <= 0 ? "A post must have at least one animal tag" : null;
      },
      images: (value) => {
        return value.length <= 0 ? "A post must have at least one image" : null;
      },
      date_time_original: (value) => {
        return !value ? "A post must have a created time" : null;
      },
    },
  });

  useEffect(() => {
    const fetchPosts = async () => {
      const queryParams = new URLSearchParams({
        animals: filtersForm.values.animals.join(","),
        date_range: filtersForm.values.dateRange.join(","),
      });
      if (filtersForm.values.season !== "all") {
        queryParams.append("season", filtersForm.values.season);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/posts?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setPosts(data);

      if (response.status !== 200) {
        return notifications.show({
          title: "Error",
          message: data.detail,
          color: "red",
        });
      }
      return notifications.show({
        title: "Success",
        message: `Fetched ${data.length} posts`,
        color: "green",
      });
    };
    fetchPosts();
    setRefetchPosts(false);
  }, [refetchPosts]);

  useEffect(() => {
    async function getAccountInfo() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/account/get`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken || "",
        },
      });
      const data = await response.json();
      setAccountInfo(data.user);
      setIsFetching(false);
    }
    setIsFetching(true);
    getAccountInfo();
  }, []);

  const handleUploadImage = async (files: any): Promise<any> => {
    const formData = new FormData();

    files.forEach((file: any) => {
      formData.append("file", file);
    });

    const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/upload_image`, {
      method: "POST",
      body: formData,
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
      color: data?.color ? data.color : "green",
    });

    form.setFieldValue("gps_lat", data.image_data.metadata.gps_latitude);
    form.setFieldValue("gps_long", data.image_data.metadata.gps_longitude);
    form.setFieldValue("images", [data.image_data]);
    form.setFieldValue(
      "date_time_original",
      data.image_data.metadata.date_time_original
        ? new Date(data.image_data.metadata.date_time_original)
        : new Date()
    );
    return data;
  };

  const handlePublishPost = async () => {
    const formData = new FormData();

    if (!form.values.session_token) {
      return notifications.show({
        title: "Error",
        message: "You must be logged in to post",
        color: "red",
      });
    }

    // Append all fields to formData
    formData.append("session_token", form.values.session_token);
    form.values.animals.forEach((animal) => {
      formData.append("animals", animal);
    });
    formData.append("title", form.values.title || "null");
    formData.append("description", form.values.description);
    formData.append("gps_lat", form.values.gps_lat.toString());
    formData.append("gps_long", form.values.gps_long.toString());
    formData.append("date_time_original", form.values.date_time_original.toString());

    // If form.values.images is an array of File objects, append each to formData
    form.values.images.forEach((image) => {
      formData.append(`images`, image.image);
    });

    // Send the POST request
    const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/create`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.status !== 200) {
      return notifications.show({
        title: "Error",
        message: data.message,
        color: "red",
      });
    }
    setPostModalOpened(!postModalOpened);

    const tmpPosts = JSON.parse(JSON.stringify(posts));
    tmpPosts.push(data.post);

    setPosts(tmpPosts);
    form.setValues(initialValues);
    return notifications.show({
      title: "Success",
      message: data.detail,
      color: "green",
    });
  };

  const filtersForm = useForm({
    initialValues: {
      animals: [
        "duck",
        "swan",
        "heron",
        "pidgeon",
        "magpie",
        "chaffinch",
        "badger",
        "stoat",
        "squirrel",
        "other",
      ],
      dateRange: [
        new Date("2000-01-01T00:00:00"),
        new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      ],
      season: "all",
    },
  });

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
    setRefetchPosts(!refetchPosts);
  };

  const handlePostComment = async (pictureId: number, commentText: string) => {
    if (!pictureId) {
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
        picture_id: pictureId,
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
    setRefetchPosts(!refetchPosts);
  };

  if (isFetching) return <Loading />;

  return (
    <>
      <CreatePostModal
        theme={theme}
        modalOpened={postModalOpened}
        setModalOpened={setPostModalOpened}
        form={form}
        handleUploadFiles={handleUploadImage}
        handlePublishPost={handlePublishPost}
        files={files}
        setFiles={setFiles}
      />
      <div style={{ position: "relative" }}>
        <Map
          posts={filteredPosts}
          setPosts={setPosts}
          account={accountInfo}
          handlePostDelete={handlePostDelete}
          handlePostComment={handlePostComment}
        />
        <div
          style={{
            position: "absolute",
            top: "4%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <MediaQuery
            smallerThan="lg"
            styles={{
              marginTop: "100px",
            }}
          >
            <Input
              placeholder="Search..."
              radius="xl"
              onChange={(element) => setSearchQuery(element.target.value)}
            />
          </MediaQuery>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
          }}
        >
          <Drawer
            title="Filters"
            opened={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            scrollAreaComponent={ScrollArea.Autosize}
          >
            <form
              onSubmit={filtersForm.onSubmit(() => {
                setRefetchPosts(true);
              })}
            >
              <AnimalMultiSelect label={"Selected animals"} form={filtersForm} />
              <DatePickerInput
                mt={20}
                popoverProps={{ withinPortal: true }}
                clearable
                type="range"
                label="Pick a date range"
                placeholder="Pick a date range..."
                mx="auto"
                maw={400}
                {...filtersForm.getInputProps("dateRange")}
              />
              <Radio.Group
                name="seasonRange"
                label="Seasons"
                description="Choose a season to filter photos for"
                mt={20}
                {...filtersForm.getInputProps("season")}
              >
                <Group mt="xs">
                  <Radio label="All" value="all" />
                  <Radio label="Winter" value="winter" />
                  <Radio label="Autumn" value="autumn" />
                  <Radio label="Summer" value="summer" />
                  <Radio label="Spring" value="spring" />
                </Group>
              </Radio.Group>
              <Button mt={15} type="submit">
                Filter
              </Button>
            </form>
          </Drawer>
          <div
            style={{
              position: "fixed",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "5px",
              bottom: 1,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            {accountInfo && (
              <>
                <Button
                  leftIcon={<Filter size="1rem" strokeWidth={2} />}
                  style={{ backgroundColor: theme.colors.dark[3] }}
                  onClick={() => {
                    setDrawerOpen(true);
                  }}
                >
                  Filter
                </Button>
                <Button
                  style={{
                    padding: "0px",
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: theme.colors.dark[4],
                    zIndex: 5,
                  }}
                  onClick={() => setPostModalOpened(!postModalOpened)}
                >
                  <Upload size={20} strokeWidth={3} />
                </Button>
              </>
            )}
            <Menu shadow="md" width={200} position="top-start">
              <Menu.Target>
                <Button
                  rightIcon={<User size="1rem" strokeWidth={2} />}
                  style={{ backgroundColor: theme.colors.dark[3] }}
                  onClick={() => {
                    if (accountInfo) return;
                    window.location.href = "/login";
                  }}
                >
                  {accountInfo ? "Profile" : "Login"}
                </Button>
              </Menu.Target>
              {accountInfo ? (
                <>
                  <Menu.Dropdown>
                    {accountInfo.permission === Role.ADMINISTRATOR && (
                      <>
                        <Menu.Label>Admin</Menu.Label>
                        <Anchor underline={false} href="/admin">
                          <Menu.Item icon={<Hammer size={20} />}>admin</Menu.Item>
                        </Anchor>
                      </>
                    )}
                    <Menu.Label>Options</Menu.Label>
                    <Menu.Item href={"/profile"} component={"a"} icon={<User size={20} />}>
                      Profile
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Label>Danger zone</Menu.Label>
                    <Menu.Item
                      color="red"
                      icon={<Logout size={14} />}
                      onClick={() => {
                        localStorage.removeItem("sessionToken");
                        window.location.href = "/";
                      }}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </>
              ) : (
                <></>
              )}
            </Menu>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
