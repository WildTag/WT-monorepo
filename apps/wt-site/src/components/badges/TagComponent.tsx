import { Badge, MantineTheme } from "@mantine/core";
import { PostTags } from "../../types/PostTags";

interface TagComponentProps {
  tag: PostTags;
  theme: MantineTheme;
}

const TagComponent = ({ tag, theme }: TagComponentProps) => {
  /*
This is the component that creates the tags for the posts e.g. animal types 

ARGS: Tag type, Theme

RETURNS: Tag component for creating tags in style of theme 


*/
  return (
    <Badge p={theme.spacing.sm} radius={theme.radius.md} color={"blue"}>
      {tag.tag}
    </Badge>
  );
};

export default TagComponent;
