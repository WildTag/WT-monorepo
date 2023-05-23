import { Title, useMantineTheme, Text, Avatar, Button, Flex, TextInput } from "@mantine/core";
import CustomAppShell from "../../components/appShell/CustomAppShell";
import { useEffect, useMemo, useState } from "react";
import { Account } from "../../types/Account";
import { Loading } from "../../components/loading/Loading";

const UserManagement = () => {
  const theme = useMantineTheme();
  const [users, setUsers] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<Account[]>([]);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      setUsers(data);
      setIsFetched(true);
    }
    setIsFetched(false);
    fetchUsers();
  }, []);

  useMemo(() => {
    if (!searchQuery) setFilteredUsers(users);
    const tmpUsers = users.filter((user) => {
      return (
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    setFilteredUsers(tmpUsers);
  }, [searchQuery, isFetched]);

  if (!isFetched) return <Loading />;
  console.log(filteredUsers);

  return (
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
              </div>
            </Flex>
            <Flex gap={10}>
              <Button>Posts</Button>
              <Button color="red">Ban</Button>
            </Flex>
          </div>
        );
      })}
    </CustomAppShell>
  );
};

export default UserManagement;
