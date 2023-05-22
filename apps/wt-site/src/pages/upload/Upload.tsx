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
  Image,
} from "@mantine/core";
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE, MIME_TYPES } from "@mantine/dropzone";
import { useState } from "react";
import { Photo, Upload, X } from "tabler-icons-react";
import AnimalMultiSelect from "../../components/selects/animalMultiSelect/AnimalMultiSelect";

const UploadPage = () => {
  const [opened, setOpened] = useState(false);
  const [files, setFiles] = useState<FileWithPath[]>([]);
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

  const previews = files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <Image
        key={index}
        src={imageUrl}
        imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
      />
    );
  });

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
            <AnimalMultiSelect />
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
            >
              <Text align="center">Drop images here</Text>
              {previews}
            </Dropzone>
          </div>
        </Flex>
        <Button mt={10}>Post</Button>
      </Modal>
      <Button onClick={() => setOpened(!opened)}>Post..</Button>
    </>
  );
};

export default UploadPage;
