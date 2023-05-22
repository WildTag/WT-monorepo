import {
  Box,
  CloseButton,
  Flex,
  MultiSelect,
  MultiSelectValueProps,
  SelectItemProps,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { forwardRef } from "react";
import { Flag } from "tabler-icons-react";

const categoriesData = [
  { label: "Duck", value: "duck" },
  { label: "Swan", value: "swan" },
  { label: "Heron", value: "heron" },
];

const flags = {
  US: Flag,
  GB: Flag,
};

const AnimalMultiSelect = () => {
  const theme = useMantineTheme();
  function Value({
    value,
    label,
    onRemove,
    classNames,
    ...others
  }: MultiSelectValueProps & { value: string }) {
    const Flag = flags["GB"];
    return (
      <div {...others}>
        <Box
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            cursor: "default",
            backgroundColor: theme.colors.dark[8],
            borderRadius: theme.radius.sm,
            paddingLeft: theme.spacing.xs,
          })}
        >
          <Box mr={10}>
            <Flag />
          </Box>
          <Box sx={{ lineHeight: 1, fontSize: rem(12) }}>{label}</Box>
          <CloseButton
            onMouseDown={onRemove}
            variant="transparent"
            size={22}
            iconSize={14}
            tabIndex={-1}
          />
        </Box>
      </div>
    );
  }

  const Item = forwardRef<HTMLDivElement, SelectItemProps>(({ label, value, ...others }, ref) => {
    const Flag = flags["US"];
    return (
      <div ref={ref} {...others}>
        <Flex align="center">
          <Box mr={10}>
            <Flag />
          </Box>
          <div>{label}</div>
        </Flex>
      </div>
    );
  });

  return (
    <MultiSelect
      withinPortal
      data={categoriesData}
      limit={20}
      valueComponent={Value}
      itemComponent={Item}
      searchable
      defaultValue={undefined}
      placeholder=""
      label="Choose an animal"
    />
  );
};

export default AnimalMultiSelect;
