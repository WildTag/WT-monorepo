import Map from "../../components/map/Map";
import {
  Text,
  useMantineTheme,
  Modal,
  Button,
  Flex,
  TextInput,
  Textarea,
  Image,
  Center,
} from "@mantine/core";
import { Dropzone, FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { useEffect, useRef, useState } from "react";
import { Trash } from "tabler-icons-react";
import AnimalMultiSelect from "../../components/selects/animalMultiSelect/AnimalMultiSelect";
import { useForm } from "@mantine/form";
import { Upload } from "tabler-icons-react";

function Home() {
  const [opened, setOpened] = useState(false);
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const dropzoneRef = useRef<() => void>(null);
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

  const uploadFiles = async (files: any) => {
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
      <Modal title={"Upload"} opened={opened} onClose={() => setOpened(!opened)} size={"xl"}>
        <Flex gap={20}>
          <div
            style={{
              backgroundColor: theme.colors.dark[5],
              padding: theme.spacing.md,
              borderRadius: theme.radius.sm,
              width: "100%",
            }}
          >
            <TextInput label={"Post title"} placeholder={"Look what I found..."} />
            <Textarea
              autosize
              label={"Post description"}
              placeholder={"I found this pigeon at Darley bank, it was incredible!"}
              {...form.getInputProps("description")}
            />
            <AnimalMultiSelect form={form} />
          </div>
          <div
            style={{
              backgroundColor: theme.colors.dark[5],
              padding: theme.spacing.md,
              borderRadius: theme.radius.sm,
              width: "100%",
            }}
          >
            <Dropzone
              style={{
                cursor: "default",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              openRef={dropzoneRef}
              activateOnClick={false}
              accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.webp]}
              onDrop={(files) => {
                uploadFiles(files)
                  .then((data) => {
                    console.log("Upload successful:", data);
                    setFiles(files);
                  })
                  .catch((error) => {
                    console.log("Upload failed:", error);
                  });
              }}
              styles={{ inner: { pointerEvents: "all" } }}
              {...form.getInputProps("images")}
            >
              <Text align="center">Drop images here</Text>
              {files.length === 0 ? (
                <Button
                  fullWidth
                  onClick={() => (dropzoneRef?.current ? dropzoneRef.current() : null)}
                >
                  Select files
                </Button>
              ) : null}
              {files.map((file, index) => {
                const imageUrl = URL.createObjectURL(file);
                return (
                  <>
                    <Flex mb={5}>
                      <Trash
                        style={{
                          cursor: "pointer",
                        }}
                        color="red"
                        onClick={() => {
                          setFiles(files.filter((_, i) => i !== index));
                        }}
                      />
                      <Text>{file.name}</Text>
                    </Flex>
                    <Image
                      key={index}
                      src={imageUrl}
                      imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
                    />
                  </>
                );
              })}
            </Dropzone>
          </div>
        </Flex>
        <Button mt={10} onClick={() => handlePublishPost()}>
          Post
        </Button>
      </Modal>
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
          <Button
            style={{
              padding: "0px",
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              backgroundColor: theme.colors.dark[4],
              zIndex: 5,
            }}
          >
            <Upload size={20} strokeWidth={3} />
          </Button>
        </div>
      </div>
    </>
  );
}

export default Home;
