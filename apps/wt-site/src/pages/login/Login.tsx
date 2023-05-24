import {
  Anchor,
  Button,
  Center,
  Flex,
  Group,
  PasswordInput,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Lock, User } from "tabler-icons-react";

interface LoginCredentials {
  username: string;
  password: string;
}

const Login = () => {
  const theme = useMantineTheme();
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: (value) => (value.length < 3 ? "Username is too short" : null),
      password: (value) => (value.length < 3 ? "Password is too short" : null),
    },
  });

  const handleLogin = async (credentials: LoginCredentials) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
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

    localStorage.setItem("sessionToken", data.session_token);
    window.location.href = "/";
  };

  return (
    <>
      <Center style={{ paddingTop: "10%" }}>
        <form onSubmit={form.onSubmit((credentials: LoginCredentials) => handleLogin(credentials))}>
          <div
            style={{
              width: "300px",
              background: theme.colors.dark[6],
              borderRadius: theme.radius.sm,
              padding: theme.spacing.sm,
              marginBottom: "10px",
            }}
          >
            <Flex direction={"column"} gap={10}>
              <Title>Login</Title>
              <TextInput
                icon={<User size={15}></User>}
                withAsterisk
                label="Username or email"
                placeholder="Username or email"
                {...form.getInputProps("username")}
                sx={{ label: { marginBottom: 5, fontWeight: "bold" } }}
              />
              <PasswordInput
                icon={<Lock size={15}></Lock>}
                withAsterisk
                label="Password"
                placeholder="Password"
                {...form.getInputProps("password")}
                sx={{ label: { marginBottom: 5, fontWeight: "bold" } }}
              />
              <Group spacing={20}>
                <Button type="submit">Login</Button>
                <Anchor href="/register">Or register an account...</Anchor>
              </Group>
            </Flex>
          </div>
        </form>
      </Center>
    </>
  );
};

export default Login;
