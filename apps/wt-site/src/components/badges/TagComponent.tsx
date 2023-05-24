import { Badge, MantineTheme } from "@mantine/core";
import { PostTags } from "../../types/PostTags";

interface TagComponentProps {
  tag: PostTags;
  theme: MantineTheme;
}

const TagComponent = ({ tag, theme }: TagComponentProps) => {
  return (
    <Badge p={theme.spacing.sm} radius={theme.radius.md} color={"blue"}>
      {tag.tag}
    </Badge>
  );
};

export default TagComponent;
