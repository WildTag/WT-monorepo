import { AppShell, Burger, Header, MediaQuery, Text, useMantineTheme } from "@mantine/core";
import { useState } from "react";
import { DashboardNavbar } from "../navbars/DashboardNavbar";

interface Props {
  children: React.ReactNode;
  selected: number;
}

const CustomAppShell = ({ children, selected }: Props) => {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);

  return (
    <AppShell
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      sx={(theme) => ({
        [`@media (min-width: ${theme.breakpoints.sm})`]: {
          "--mantine-header-height": 0,
          marginTop: "10px",
        },
      })}
      navbar={<DashboardNavbar selected={selected} opened={opened} />}
      header={
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Header height={{ base: 50, md: 70 }} p="md">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
              <Text>WildTag</Text>
            </div>
          </Header>
        </MediaQuery>
      }
    >
      {children}
    </AppShell>
  );
};

export default CustomAppShell;
