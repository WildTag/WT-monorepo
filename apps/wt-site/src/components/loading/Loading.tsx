import { Loader, LoadingOverlay, Stack, Text } from "@mantine/core";

export function Loading() {
  /*
  component to display throbber when a resouce is in the process of loading / being fetched
  
  */
  return (
    <>
      <LoadingOverlay
        visible={true}
        loader={
          <>
            <Stack align="center">
              <Loader />
              <Text color="dimmed">Loading...</Text>
            </Stack>
          </>
        }
      />
    </>
  );
}
