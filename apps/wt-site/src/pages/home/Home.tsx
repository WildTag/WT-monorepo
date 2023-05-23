import Map from "../../components/map/Map";
import {
  useMantineTheme,
  Button,
  Group,
  Input,
  Menu,
  Flex,
  Drawer,
  ScrollArea,
} from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { Upload, Filter, User, Settings, Logout } from "tabler-icons-react";

import CreatePostModal from "../../components/modals/CreatePostModal";
import { Loading } from "../../components/loading/Loading";
import { Post } from "../../types/Post";
import { notifications } from "@mantine/notifications";

function Home() {
  const [postModalOpened, setPostModalOpened] = useState(false);
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<any>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const sessionToken = sessionStorage.getItem("sessionToken");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useMantineTheme();

  const initialValues = {
    session_token: sessionToken,
    animals: [],
    title: "",
    description: "",
    gps_lat: 0,
    gps_long: 0,
    images: files,
  };

  const form = useForm({
    initialValues: initialValues,
    validate: {
      title: (value) => (value.trim().length <= 0 ? "A post must have a title" : null),
      description: (value) => (value.trim().length <= 0 ? "A post must have a description" : null),
      gps_lat: (value) => !value,
      gps_long: (value) => !value,
      animals: (value) => (value.length <= 0 ? "A post must have at least one animal tag" : null),
      images: (value) => (value.length <= 0 ? "A post must have at least one image" : null),
    },
  });

  useEffect(() => {
    form.setFieldValue("images", files);
  }, [files]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    async function getAccountInfo() {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/account/${sessionToken}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setAccountInfo(data);
      setIsFetching(false);
    }
    setIsFetching(true);
    getAccountInfo();
  }, []);

  const handleUploadImage = async (files: any) => {
    const formData = new FormData();

    files.forEach((file: any) => {
      formData.append("file", file);
    });

    const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/upload_image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("File upload failed");
    }
    const data = await response.json();
    setUploadedImage(data);
    form.setFieldValue("gps_lat", data.metadata.GPSLatitude);
    form.setFieldValue("gps_long", data.metadata.GPSLongitude);
    return data;
  };

  const handlePublishPost = async () => {
    // Create a FormData instance
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

    // If form.values.images is an array of File objects, append each to formData
    form.values.images.forEach((image) => {
      formData.append(`images`, image);
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
        <Map posts={posts} />
        <div
          style={{
            position: "absolute",
            top: "5%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <Input placeholder="Search?" radius="xl" />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Drawer
            title="Filters"
            opened={drawerOpen}
            onClose={() => {
              setDrawerOpen(false);
            }}
            scrollAreaComponent={ScrollArea.Autosize}
          ></Drawer>
          <Group position="center">
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
                    <Menu.Label>Options</Menu.Label>
                    <Menu.Item icon={<Settings size={14} />}>Profile</Menu.Item>
                    <Menu.Item icon={<Settings size={14} />}>Settings</Menu.Item>
                    <Menu.Divider />
                    <Menu.Label>Danger zone</Menu.Label>
                    <Menu.Item
                      color="red"
                      icon={<Logout size={14} />}
                      onClick={() => {
                        sessionStorage.removeItem("sessionToken");
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
          </Group>
        </div>
      </div>
    </>
  );
}

export default Home;
