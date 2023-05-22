import { Anchor, Button, Center, Flex, PasswordInput, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

interface LoginCredentials {
  username: string;
  password: string;
}

const Login = () => {
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

    sessionStorage.setItem("sessionToken", data.session_token);
    window.location.href = "/";
  };

  return (
    <>
      <Center>
        <form onSubmit={form.onSubmit((credentials: LoginCredentials) => handleLogin(credentials))}>
          <div>
            <Flex direction={"column"} gap={5}>
              <Title>Login</Title>
              <TextInput
                withAsterisk
                label="Username or email"
                placeholder="Username or email"
                {...form.getInputProps("username")}
              />
              <PasswordInput
                withAsterisk
                label="Password"
                placeholder="Password"
                {...form.getInputProps("password")}
              />
              <Button type="submit">Login</Button>
            </Flex>
            <Anchor href="/register">Or register an account...</Anchor>
          </div>
        </form>
      </Center>
    </>
  );
};

export default Login;
