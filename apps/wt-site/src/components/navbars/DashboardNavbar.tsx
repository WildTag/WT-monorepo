import { Group, Navbar, Title, Image } from "@mantine/core";
import { useEffect, useState } from "react";
import { Dashboard, Icon, FileText, Home2 } from "tabler-icons-react";
import { useStyles } from "./dashboardNavbar.styles";
import { Loading } from "../loading/Loading";
import { Account } from "../../types/Account";
import { notifications } from "@mantine/notifications";

export interface NavBarLinks {
  link: string;
  label: string;
  icon: Icon | null;
  adminOnly?: boolean;
  onClick?: () => void;
}

const data: NavBarLinks[] = [
  { link: "/", label: "Back to Map", icon: Home2, adminOnly: true },
  { link: "/admin/user_management", label: "User management", icon: Dashboard, adminOnly: true },
  { link: "/admin/post_management", label: "Post management", icon: Dashboard, adminOnly: false },
  { link: "/admin", label: "Audit Log", icon: Dashboard, adminOnly: true },
];

interface Props {
  opened: boolean;
  selected: number;
}

export function DashboardNavbar({ opened, selected }: Props) {
  const { classes, cx } = useStyles();
  const [active, setActive] = useState(selected);
  const [user, setUser] = useState<Account | null>(null);
  const [fetched, setFetched] = useState(false);
  const accessToken = localStorage.getItem("sessionToken");

  const getCSV = async () => {
    const accessToken = localStorage.getItem("sessionToken");
    const response = await fetch(`${import.meta.env.VITE_API_URL}/data`, {
      method: "GET",
      headers: {
        "Content-Type": "text/csv",
        Authorization: accessToken || "",
      },
    });

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    async function fetchAccountInfo() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/account/get`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken || "",
        },
      });
      const data = await response.json();
      if (data.user.permission !== "ADMINISTRATOR" && data.user.permission !== "MODERATOR") {
        return (window.location.href = "/");
      }
      if (data) setUser(data.user);
      setFetched(true);
    }
    fetchAccountInfo();
    setFetched(false);
  }, []);

  if (!accessToken) return <h1>No permissions</h1>;
  if (!fetched) return <Loading />;

  const links = data
    .concat([{ link: "#", label: "Download Data CSV", icon: FileText, onClick: getCSV }])
    .map((item, index) => {
      return (
        <>
          {item.adminOnly && user?.permission !== "ADMINISTRATOR" ? null : (
            <>
              {item.link && item.icon ? (
                <a
                  className={cx(classes.link, { [classes.linkActive]: index === active })}
                  href={item.link}
                  key={item.label}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    } else {
                      setActive(index);
                    }
                  }}
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
            <Image radius={50} src={"/animalImages/lowPolyDuck.png"} width={32} height={32} />
            <h2>WildTag</h2>
          </Group>
          <div style={{ paddingTop: "10px", paddingBottom: "10px" }}></div>
          {links}
        </Navbar.Section>
      </Navbar>
    </>
  );
}
