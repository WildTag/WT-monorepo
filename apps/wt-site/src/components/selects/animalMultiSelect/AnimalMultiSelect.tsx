import {
  Box,
  CloseButton,
  Flex,
  MultiSelect,
  MultiSelectValueProps,
  SelectItemProps,
  rem,
  Image,
} from "@mantine/core";
import { forwardRef } from "react";

const categoriesData = [
  { label: "Duck", value: "duck" },
  { label: "Swan", value: "swan" },
  { label: "Heron", value: "heron" },
  { label: "Pidgeon", value: "pidgeon" },
  { label: "Magpie", value: "magpie" },
  { label: "Chaffinch", value: "chaffinch" },
  { label: "Badger", value: "badger" },
  { label: "Stoat", value: "stoat" },
  { label: "Squirrel", value: "squirrel" },
  { label: "Other", value: "other" },
];

const icons = {
  duck: "/animalImages/lowPolyDuck.png",
  swan: "/animalImages/lowPolySwan.png",
  heron: "/animalImages/lowPolyHeron.png",
  pidgeon: "/animalImages/lowPolyPidgeon.png",
  magpie: "/animalImages/lowPolyMagpie.png",
  chaffinch: "/animalImages/lowPolyChaffinch.png",
  badger: "/animalImages/lowPolyBadger.png",
  stoat: "/animalImages/lowPolyStoat.png",
  squirrel: "/animalImages/lowPolySquirrel.png",
  other: "/animalImages/lowPolyQuestionmark.png",
};

interface AnimalMultiSelectProps {
  form: any;
}

const AnimalMultiSelect = ({ form }: AnimalMultiSelectProps) => {
  function Value({
    value,
    label,
    onRemove,
    classNames,
    ...others
  }: MultiSelectValueProps & { value: string }) {
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
            <Image src={icons[value]} width={24} height={24} />
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
    return (
      <div ref={ref} {...others}>
        <Flex align="center">
          <Box mr={10}>
            <Image src={icons[value]} width={24} height={24} />
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
      placeholder="Select an animal..."
      label="Choose an animal"
      {...form.getInputProps("animals")}
    />
  );
};

export default AnimalMultiSelect;
