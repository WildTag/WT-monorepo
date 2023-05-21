import { createStyles, getStylesRef } from "@mantine/core";

export const useStyles = createStyles((theme, _params) => {
  const icon = getStylesRef("icon");
  return {
    navbar: {
      backgroundColor: theme.colors.dark[7],
    },
    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: `calc(theme.spacing.md * 1.5)`,
      borderBottom: `1px solid ${theme.colors.dark[8]}`,
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${theme.colors.dark[8]}`,
    },

    link: {
      display: "flex",
      gap: "10px",
      alignItems: "center",
      fontSize: theme.fontSizes.sm,
      color: theme.colors.dark[1],
      padding: theme.spacing.sm,
      borderRadius: theme.radius.sm,
      marginBottom: "5px",

      "&:hover": {
        backgroundColor: theme.colors.dark[6],
        color: theme.white,
        width: "100%",

        [`& .${icon}`]: {
          color: theme.white,
        },
      },
    },

    linkIcon: {
      ref: icon,
      color: theme.colors.dark[8],
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      fontWeight: 500,
      "&, &:hover": {
        backgroundColor: theme.colors.dark[6],
        color: theme.white,
      },
    },
  };
});
