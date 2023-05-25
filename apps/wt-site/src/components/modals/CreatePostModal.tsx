import {
  Button,
  Flex,
  MantineTheme,
  Modal,
  TextInput,
  Textarea,
  Text,
  Image,
  SimpleGrid,
  Stepper,
  Group,
} from "@mantine/core";
import AnimalMultiSelect from "../selects/animalMultiSelect/AnimalMultiSelect";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useEffect, useRef, useState } from "react";
import { Trash } from "tabler-icons-react";
import { UploadedImage } from "../../types/UploadedImage";
import { useMediaQuery } from "@mantine/hooks";
import PinPointMap from "../map/PinPointMap";
import { DatePickerInput } from "@mantine/dates";

interface CreatePostModalProps {
  theme: MantineTheme;
  modalOpened: boolean;
  setModalOpened: (modalOpened: boolean) => void;
  form: any;
  handleUploadFiles: (files: any) => Promise<any>;
  handlePublishPost: () => Promise<void>;
  files: any;
  setFiles: (files: any) => void;
}

const CreatePostModal = ({
  modalOpened,
  setModalOpened,
  form,
  handlePublishPost,
}: CreatePostModalProps) => {
  const [active, setActive] = useState(1);
  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const [displayPinPointMap, setDisplayPinPointMap] = useState<boolean>(false);

  useEffect(() => {
    if (modalOpened) return;
    setDisplayPinPointMap(false);
  }, [modalOpened]);

  return (
    <Modal
      title={"Upload"}
      opened={modalOpened}
      onClose={() => setModalOpened(!modalOpened)}
      size={"xl"}
    >
      <form
        onSubmit={form.onSubmit(() => {
          handlePublishPost();
        })}
      >
        <Stepper
          active={active}
          onStepClick={setActive}
          breakpoint="sm"
          allowNextStepsSelect={false}
        >
          <Stepper.Step label="First step" description="">
            Step 1 content: Create an account
          </Stepper.Step>
          <Stepper.Step label="Second step" description="Verify email">
            Step 2 content: Verify email
          </Stepper.Step>
          <Stepper.Step label="Final step" description="Get full access">
            Step 3 content: Get full access
          </Stepper.Step>
          <Stepper.Completed>
            Completed, click back button to get to previous step
          </Stepper.Completed>
        </Stepper>

        <Group position="center" mt="xl">
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
          <Button onClick={nextStep}>Next step</Button>
        </Group>
        {/* <SimpleGrid cols={!matches ? 1 : 2}>
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
            <AnimalMultiSelect form={form} label={"Choose an animal"} />
            <DatePickerInput
              popoverProps={{ withinPortal: true }}
              clearable
              label="When was this picture taken?"
              placeholder="Pick a date range..."
              {...form.getInputProps("date_time_original")}
            />
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
              onDrop={async (files) => {
                const data = await handleUploadFiles(files).catch((error) => {
                  console.log("Upload failed:", error);
                });
                if (!data) return;

                if (
                  !data.image_data.metadata.gps_latitude ||
                  !data.image_data.metadata.gps_longitude
                )
                  return setDisplayPinPointMap(true);

                setDisplayPinPointMap(false);
              }}
              styles={{ inner: { pointerEvents: "all" } }}
              {...form.getInputProps("images")}
            >
              {!form.values.images || form.values.images?.length === 0 ? (
                <>
                  <Text align="center">Drop images here</Text>
                  <Button
                    fullWidth
                    onClick={() => (dropzoneRef?.current ? dropzoneRef.current() : null)}
                  >
                    Select files
                  </Button>
                </>
              ) : null}
              {form.values.images?.map((file: UploadedImage, index: number) => {
                return (
                  <>
                    <Flex mb={5}>
                      <Trash
                        color="red"
                        onClick={() => {
                          form.setFieldValue("images", []);
                          setDisplayPinPointMap(false);
                          setFiles(files.filter((_: any, i: number) => i !== index));
                        }}
                      />

                      <Text
                        style={{
                          maxWidth: "250px", // adjust as per requirement
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file.filename}
                      </Text>
                    </Flex>
                    <Image key={index} src={`data:image/jpeg;base64,${file.image}`} />
                  </>
                );
              })}
            </Dropzone>
          </div>
        </SimpleGrid> */}
        {/* <PinPointMap displayPinPointMap={displayPinPointMap} form={form} /> */}
        {/* <Button mt={10} type="submit">
          Post
        </Button> */}
      </form>
    </Modal>
  );
};

export default CreatePostModal;
