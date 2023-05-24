import { Button, Flex, MantineTheme, Modal, TextInput, Textarea, Text, Image } from "@mantine/core";
import AnimalMultiSelect from "../selects/animalMultiSelect/AnimalMultiSelect";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useRef } from "react";
import { Trash } from "tabler-icons-react";
import { UploadedImage } from "../../types/UploadedImage";

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
      <form onSubmit={form.onSubmit(() => handlePublishPost())}>
        <Flex gap={20}>
          <div
            style={{
              backgroundColor: theme.colors.dark[5],
              padding: theme.spacing.md,
              borderRadius: theme.radius.sm,
              width: "100%",
            }}
          >
            <TextInput
              label={"Post title"}
              placeholder={"Look what I found..."}
              {...form.getInputProps("title")}
            />
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
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              backgroundColor: theme.colors.dark[5],
              padding: theme.spacing.md,
              borderRadius: theme.radius.sm,
              width: "100%",
            }}
          >
            <TextInput
              readOnly
              label="Images"
              {...form.getInputProps("images")}
              value={form.values.images?.length >= 1 ? form.values.images[0]?.filename : ""}
            />
            <Dropzone
              style={{
                cursor: "default",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "100%",
              }}
              openRef={dropzoneRef}
              activateOnClick={false}
              accept={[
                MIME_TYPES.png,
                MIME_TYPES.jpeg,
                MIME_TYPES.webp,
                "image/heic",
                "image/heif",
              ]}
              onDrop={(files) => {
                handleUploadFiles(files).catch((error) => {
                  console.log("Upload failed:", error);
                });
              }}
              styles={{ inner: { pointerEvents: "all" } }}
              {...form.getInputProps("images")}
            >
              <Text align="center">Drop images here</Text>
              {!files || files?.length === 0 ? (
                <Button
                  fullWidth
                  onClick={() => (dropzoneRef?.current ? dropzoneRef.current() : null)}
                >
                  Select files
                </Button>
              ) : null}
              {form.values.images?.map((file: UploadedImage, index: number) => {
                return (
                  <>
                    <Flex mb={5}>
                      <Trash
                        style={{
                          cursor: "pointer",
                        }}
                        color="red"
                        onClick={() => {
                          form.setFieldValue("images", []);
                          setFiles(files.filter((_: any, i: number) => i !== index));
                        }}
                      />
                      <Text>{file.filename}</Text>
                    </Flex>
                    <Image key={index} src={`data:image/jpeg;base64,${file.image}`} />
                  </>
                );
              })}
            </Dropzone>
          </div>
        </Flex>
        <Button mt={10} type="submit">
          Post
        </Button>
      </form>
    </Modal>
  );
};

export default CreatePostModal;
