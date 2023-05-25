import {
  Title,
  useMantineTheme,
  Text,
  Avatar,
  Button,
  Flex,
  TextInput,
  Modal,
  Select,
  Badge,
} from "@mantine/core";
import CustomAppShell from "../../components/appShell/CustomAppShell";
import { useEffect, useMemo, useState } from "react";
import { Account } from "../../types/Account";
import { Loading } from "../../components/loading/Loading";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";

const UserManagement = () => {
  const theme = useMantineTheme();
  const [users, setUsers] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<Account[]>([]);
  const [isFetched, setIsFetched] = useState(false);
  const [refetch, setRefetch] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Account>();
  const [opened, { open, close }] = useDisclosure(false);
  const accessToken = localStorage.getItem("sessionToken");

  useEffect(() => {
    async function fetchUsers() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken || "",
        },
      });
      const data = await response.json();

      if (response.status !== 200) {
        return (window.location.href = "/");
      }

      setUsers(data);

      setIsFetched(true);
    }
    setIsFetched(false);
    fetchUsers();
  }, [refetch]);

  const form = useForm({
    initialValues: {
      user_id: -1,
      username: "",
      email: "",
      password: "",
      permission: "",
      profile_image: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  useEffect(() => {
    if (!selectedUser) return;
    form.setValues({
      user_id: selectedUser.accountId,
      username: selectedUser.username,
      email: selectedUser.email,
      password: "",
      permission: selectedUser.permission,
    });
  }, [selectedUser]);

  useMemo(() => {
    console.log(1);
    // if (!searchQuery) setFilteredUsers(users);
    const tmpUsers = users.filter((user) => {
      return (
        user.username?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery?.toLowerCase())
      );
    });

    setFilteredUsers(tmpUsers);
  }, [searchQuery, isFetched, users]);

  const handleUserBan = async (userId: number) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/ban`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken || "",
      },
    });

    const data = await response.json();
    if (response.status !== 200) {
      return notifications.show({
        title: "Error",
        message: data.detail,
        color: "red",
      });
    }
    notifications.show({
      title: "Success",
      message: data.detail,
      color: "green",
    });
    setRefetch(!refetch);
  };

  const handleUserUnban = async (userId: number) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/unban`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken || "",
      },
    });

    const data = await response.json();
    if (response.status !== 200) {
      return notifications.show({
        title: "Error",
        message: data.detail,
        color: "red",
      });
    }
    notifications.show({
      title: "Success",
      message: data.detail,
      color: "green",
    });

    setRefetch(!refetch);
  };

  const handleEditUser = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users/${selectedUser?.accountId}/edit`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken || "",
        },
        body: JSON.stringify(form.values),
      }
    );
    const data = await response.json();
    if (response.status !== 200) {
      return notifications.show({
        title: "Error",
        message: data.detail,
        color: "red",
      });
    }

    const tmpUsers = JSON.parse(JSON.stringify(users));
    const index = tmpUsers.findIndex((user: Account) => user.accountId === selectedUser?.accountId);
    tmpUsers[index] = data.user;
    setUsers(tmpUsers);

    console.log(data.user.username);

    notifications.show({
      title: "Success",
      message: data.detail,
      color: "green",
    });
  };

  if (!isFetched) return <Loading />;

  return (
    <>
      <Modal opened={opened} onClose={close} title={"Edit user"}>
        <TextInput
          label={"Username"}
          placeholder="Enter a username..."
          {...form.getInputProps("username")}
        />
        <TextInput
          label={"email"}
          placeholder="Enter an email..."
          {...form.getInputProps("email")}
        />
        <TextInput
          label={"Password"}
          placeholder="Enter a password..."
          {...form.getInputProps("password")}
        />
        <Select
          label={"Permission"}
          data={[
            { value: "USER", label: "User" },
            { value: "ADMINISTRATOR", label: "Administrator" },
            { value: "MODERATOR", label: "Moderator" },
          ]}
          {...form.getInputProps("permission")}
        />
        <Button type="submit" mt={10}>
          Edit user
        </Button>
      </Modal>
      <Modal opened={opened} onClose={close} title={"Edit user"}>
        <form onSubmit={form.onSubmit((values) => handleEditUser())}>
          <TextInput
            label={"Username"}
            placeholder="Enter a username..."
            {...form.getInputProps("username")}
          />
          <TextInput
            label={"email"}
            placeholder="Enter an email..."
            {...form.getInputProps("email")}
          />
          <TextInput
            label={"Password"}
            placeholder="Enter a password..."
            {...form.getInputProps("password")}
          />
          <Select
            label={"Permission"}
            data={[
              { value: "USER", label: "User" },
              { value: "ADMINISTRATOR", label: "Administrator" },
              { value: "MODERATOR", label: "Moderator" },
            ]}
            {...form.getInputProps("permission")}
          />
          <Button type="submit" mt={10}>
            Edit user
          </Button>
        </form>
      </Modal>
      <CustomAppShell selected={1}>
        <Title>User list</Title>
        <TextInput
          placeholder="Search for a user..."
          onChange={(element) => {
            setSearchQuery(element.target.value);
          }}
        />
        {filteredUsers.map((user) => {
          return (
            <div
              key={user.accountId}
              style={{
                display: "flex",
                marginTop: theme.spacing.md,
                backgroundColor: theme.colors.dark[6],
                padding: theme.spacing.md,
                borderRadius: theme.radius.sm,
                alignItems: "center",
                gap: theme.spacing.sm,
                justifyContent: "space-between",
              }}
            >
              <Flex gap={5}>
                <Avatar src="/animalImages/lowPolyDuck.png" w={64} h={64} />
                <div>
                  <Title>{user.username}</Title>
                  <Text>{user.email}</Text>
                  <Text>{new Date(user.created).toDateString()}</Text>
                  <Badge
                    color={
                      user.permission === "ADMINISTRATOR"
                        ? "orange"
                        : user.permission === "MODERATOR"
                        ? "pink"
                        : "blue"
                    }
                  >
                    {user.permission}
                  </Badge>
                </div>
              </Flex>
              <Flex gap={10}>
                <Button
                  onClick={() => {
                    setSelectedUser(user);
                    open();
                  }}
                >
                  Edit user
                </Button>
                <Button
                  component="a"
                  href={`/admin/post_management?accountId=${user.accountId}`}
                  color={"green"}
                >
                  Posts
                </Button>
                <Button
                  color={!user.banned ? "red" : "green"}
                  onClick={() => {
                    if (!user.banned) return handleUserBan(user.accountId);
                    handleUserUnban(user.accountId);
                  }}
                >
                  Ban
                </Button>
              </Flex>
            </div>
          );
        })}
      </CustomAppShell>
    </>
  );
};

export default UserManagement;
