import { Button, Flex, MantineTheme, Modal, TextInput, Textarea, Text, Image } from "@mantine/core";
import AnimalMultiSelect from "../selects/animalMultiSelect/AnimalMultiSelect";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useRef } from "react";
import { Trash } from "tabler-icons-react";

interface CreatePostModalProps {
  theme: MantineTheme;
  modalOpened: boolean;
  setModalOpened: (modalOpened: boolean) => void;
  form: any;
  handleUploadFiles: (files: any) => Promise<void>;
  handlePublishPost: () => Promise<void>;
  files: any;
  setFiles: (files: any) => void;
}

const CreatePostModal = ({
  theme,
  modalOpened,
  setModalOpened,
  form,
  handleUploadFiles,
  handlePublishPost,
  files,
  setFiles,
}: CreatePostModalProps) => {
  const dropzoneRef = useRef<() => void>(null);

  return (
    <Modal
      title={"Upload"}
      opened={modalOpened}
      onClose={() => setModalOpened(!modalOpened)}
      size={"xl"}
    >
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
            accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.webp, "image/heic", "image/heif"]}
            onDrop={(files) => {
              handleUploadFiles(files)
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
            {files.map((file: any, index: number) => {
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
                        setFiles(files.filter((_: any, i: number) => i !== index));
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
  );
};

export default CreatePostModal;
