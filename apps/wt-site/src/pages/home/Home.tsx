import Map from "../../components/map/Map";
import { useMantineTheme, Button, Flex, Menu } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { Logout, Settings, Upload } from "tabler-icons-react";
import CreatePostModal from "../../components/modals/CreatePostModal";

function Home() {
  const [postModalOpened, setPostModalOpened] = useState(false);
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const theme = useMantineTheme();

  const form = useForm({
    initialValues: {
      account_id: 1,
      animals: [],
      title: "",
      description: [],
      gps_lat: 51.232,
      gps_long: -1.232,
      images: files,
    },
  });

  useEffect(() => {
    form.setFieldValue("images", files);
  }, [files]);

  useEffect(() => {
    async function getAccountInfo() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/create`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data);
    }
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
    return data;
  };

  const handlePublishPost = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form.values),
    });

    const data = await response.json();
  };

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
        <Map />
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Flex align={"center"} gap={5}>
            <Button>filters</Button>
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
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button>Toggle menu</Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Options</Menu.Label>
                <Menu.Item icon={<Settings size={14} />}>Profile</Menu.Item>
                <Menu.Item icon={<Settings size={14} />}>Settings</Menu.Item>
                <Menu.Divider />
                <Menu.Label>Danger zone</Menu.Label>
                <Menu.Item color="red" icon={<Logout size={14} />}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Flex>
        </div>
      </div>
    </>
  );
}

export default Home;
