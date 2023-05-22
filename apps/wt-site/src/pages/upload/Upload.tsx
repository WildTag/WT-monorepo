import {
  Group,
  Text,
  useMantineTheme,
  rem,
  Modal,
  Button,
  Flex,
  TextInput,
  Textarea,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useState } from "react";
import { Photo, Upload, X } from "tabler-icons-react";

const UploadPage = () => {
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();

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
            />
            <TextInput label={"Image tags"} placeholder={"bird"} />
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
              onDrop={(files) => {
                uploadFiles(files)
                  .then((data) => {
                    console.log("Upload successful:", data);
                  })
                  .catch((error) => {
                    console.log("Upload failed:", error);
                  });
              }}
              onReject={(files) => console.log("rejected files", files)}
              maxSize={3 * 1024 ** 2}
              accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.webp]}
            >
              <Group
                position="center"
                spacing="xl"
                style={{ minHeight: rem(220), pointerEvents: "none" }}
              >
                <Dropzone.Accept>
                  <Upload
                    size="3.2rem"
                    stroke={"1.5"}
                    color={theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 4 : 6]}
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <X
                    size="3.2rem"
                    stroke={"1.5"}
                    color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
                  />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <Photo size="3.2rem" stroke={"1.5"} />
                </Dropzone.Idle>

                <div>
                  <Text size="xl" inline>
                    Upload an image, max file size 5mb
                  </Text>
                </div>
                <Button fullWidth>Upload image...</Button>
              </Group>
            </Dropzone>
          </div>
        </Flex>
      </Modal>
      <Button onClick={() => setOpened(!opened)}>Post..</Button>
    </>
  );
};

export default UploadPage;
