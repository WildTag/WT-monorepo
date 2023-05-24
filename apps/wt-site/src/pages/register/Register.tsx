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
import { At, Lock, User } from "tabler-icons-react";

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

const Register = () => {
  const theme = useMantineTheme();
  const form = useForm({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    validate: {
      username: (value) => (value.length < 3 ? "Username is too short" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (value.length < 3 ? "Password is too short" : null),
    },
  });

  const handleRegister = async (credentials: RegisterCredentials) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/register`, {
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

    localStorage.setItem("sessionToken", data.access_token);
    return (window.location.href = "/");
  };

  return (
    <>
      <Center style={{ paddingTop: "10%" }}>
        <form
          onSubmit={form.onSubmit((credentials: RegisterCredentials) =>
            handleRegister(credentials)
          )}
        >
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
              <Title>Register</Title>
              <TextInput
                icon={<User size={15}></User>}
                withAsterisk
                label="Username"
                placeholder="Username"
                {...form.getInputProps("username")}
                sx={{ label: { marginBottom: 5, fontWeight: "bold" } }}
              />
              <TextInput
                withAsterisk
                label="Email"
                icon={<At size={15}></At>}
                placeholder="Email"
                {...form.getInputProps("email")}
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
                <Button type="submit">Register</Button>
                <Anchor href="/login">Or login...</Anchor>
              </Group>
            </Flex>
          </div>
        </form>
      </Center>
    </>
  );
};

export default Register;
