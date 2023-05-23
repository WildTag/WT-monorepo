import { Group, Navbar, Title, Image } from "@mantine/core";
import { useEffect, useState } from "react";
import { Dashboard, Icon } from "tabler-icons-react";
import { useStyles } from "./dashboardNavbar.styles";
import { Loading } from "../loading/Loading";

export interface NavBarLinks {
  link: string;
  label: string;
  icon: Icon | null;
  adminOnly?: boolean;
}

const data: NavBarLinks[] = [
  { link: "/admin", label: "admin", icon: Dashboard },
  { link: "/admin/user_management", label: "User management", icon: Dashboard },
  { link: "/admin/post_management", label: "Post management", icon: Dashboard },
];

interface Props {
  opened: boolean;
  selected: number;
}

export function DashboardNavbar({ opened, selected }: Props) {
  const { classes, cx } = useStyles();
  const [active, setActive] = useState(selected);
  const [user, setUser] = useState<any>();
  const [fetched, setFetched] = useState(false);
  const sessionToken = sessionStorage.getItem("sessionToken");

  useEffect(() => {
    async function fetchAccountInfo() {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/account/${sessionToken}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      setUser(data);
      setFetched(true);
    }
    fetchAccountInfo();
    setFetched(false);
  }, []);

  if (!sessionToken) return <h1>No permissions</h1>;
  if (!fetched) return <Loading />;

  const links = data.map((item, index) => {
    return (
      <>
        {item.adminOnly && user?.permission !== "ADMIN" ? null : (
          <>
            {item.link && item.icon ? (
              <a
                className={cx(classes.link, { [classes.linkActive]: index === active })}
                href={item.link}
                key={item.label}
                onClick={() => setActive(index)}
              >
                <item.icon color={"white"} />
                <span>{item.label}</span>
              </a>
            ) : (
              <Title size={20}>{item.label}</Title>
            )}
          </>
        )}
      </>
    );
  });

  return (
    <>
      <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 250, md: 250, lg: 250 }}>
        <Navbar.Section grow>
          <Group spacing={10}>
            <Image radius={50} src={"/animalImages/lowPolySwan.png"} width={32} height={32} />
            <h2>WildTag</h2>
          </Group>
          <div style={{ paddingTop: "10px", paddingBottom: "10px" }}></div>
          {links}
        </Navbar.Section>
      </Navbar>
    </>
  );
}
