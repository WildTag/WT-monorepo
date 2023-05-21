import { Loader, LoadingOverlay, Stack, Text } from "@mantine/core";

export function Loading() {
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
