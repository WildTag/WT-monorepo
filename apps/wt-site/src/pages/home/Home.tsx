import Map from "../../components/map/Map";
import { useMantineTheme, Button, Stack, Group, Text } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { Upload, Filter, User } from "tabler-icons-react";
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

  const handleUploadImage = async (files: any) => {
    const formData = new FormData();

    files.forEach((file: any, index: number) => {
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
          <Group position="center">
            <Button
              leftIcon={<Filter size="1rem" strokeWidth={2} />}
              style={{ backgroundColor: theme.colors.dark[3] }}
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
            <Button
              rightIcon={<User size="1rem" strokeWidth={2} />}
              style={{ backgroundColor: theme.colors.dark[3] }}
              onClick={() => {}}
            >
              Account
            </Button>
          </Group>
        </div>
      </div>
    </>
  );
}

export default Home;
