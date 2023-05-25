import {
  Button,
  Flex,
  MantineTheme,
  Modal,
  TextInput,
  Textarea,
  Text,
  Image,
  Stepper,
  Group,
  AspectRatio,
  Title,
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
  theme,
  modalOpened,
  setModalOpened,
  form,
  handleUploadFiles,
  handlePublishPost,
  files,
  setFiles,
}: CreatePostModalProps) => {
  const [activeStep, setActiveStep] = useState(0);

  const validateStep = {
    images: (): boolean => {
      return form.validateField("images").hasError;
    },
    gps_lat: (): boolean => {
      return form.validateField("gps_lat").hasError;
    },
    postData: (): boolean => {
      const response = [
        form.validateField("title"),
        form.validateField("description"),
        form.validateField("animals"),
        form.validateField("images"),
        form.validateField("date_time_original"),
      ];

      const hasError = response.some((res) => res.hasError);
      return hasError;
    },
  };

  const steps = {
    0: "images",
    1: "gps_lat",
    2: "postData",
  };

  const nextStep = () => {
    if (activeStep === Object.keys(steps).length) {
      setActiveStep(0);
      setModalOpened(false);
      return handlePublishPost();
    }
    const response = validateStep[steps[activeStep]]();
    if (response) return;

    setActiveStep((current) => (current < 3 ? current + 1 : current));
  };
  const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));
  const [displayPinPointMap, setDisplayPinPointMap] = useState<boolean>(false);
  const matches = useMediaQuery("(min-width: 56.25em)");
  const dropzoneRef = useRef<() => void>(null);

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
          active={activeStep}
          onStepClick={setActiveStep}
          breakpoint="sm"
          allowNextStepsSelect={false}
        >
          <Stepper.Step label="First step" description="Upload an image">
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

                  console.log(data);

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
                            maxWidth: "250px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {file.filename}
                        </Text>
                      </Flex>
                      <AspectRatio ratio={16 / 9} maw={400} mx="auto">
                        <Image key={index} src={`data:image/jpeg;base64,${file.image}`} />
                      </AspectRatio>
                    </>
                  );
                })}
              </Dropzone>
            </div>
          </Stepper.Step>
          <Stepper.Step label="Second step" description="Pick a location">
            <TextInput
              label={"Select a location by clicking a position on the map"}
              disabled
              {...form.getInputProps("gps_lat")}
              value={`${form.values.gps_lat || ""} ${form.values.gps_long || ""}`}
            />
            <PinPointMap form={form} />
          </Stepper.Step>
          <Stepper.Step label="Final step" description="Create post">
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
          </Stepper.Step>
          <Stepper.Completed>
            <Title>Post is ready to be created...</Title>
          </Stepper.Completed>
        </Stepper>

        <Group position="center" mt="xl">
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
          <Button onClick={nextStep}>{activeStep === 3 ? "Create post" : "Next"}</Button>
        </Group>
      </form>
    </Modal>
  );
};

export default CreatePostModal;
