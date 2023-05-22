import { Anchor, Button, Center, Flex, PasswordInput, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

const Register = () => {
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

    sessionStorage.setItem("sessionToken", data.access_token);
    return (window.location.href = "/");
  };

  return (
    <>
      <Center>
        <form
          onSubmit={form.onSubmit((credentials: RegisterCredentials) =>
            handleRegister(credentials)
          )}
        >
          <div>
            <Flex direction={"column"} gap={5}>
              <Title>Register</Title>
              <TextInput
                withAsterisk
                label="Username"
                placeholder="Username"
                {...form.getInputProps("username")}
              />
              <TextInput
                withAsterisk
                label="Email"
                placeholder="Email"
                {...form.getInputProps("email")}
              />
              <PasswordInput
                withAsterisk
                label="Password"
                placeholder="Password"
                {...form.getInputProps("password")}
              />
              <Button type="submit">Register</Button>
            </Flex>
            <Anchor href="/login">Or login...</Anchor>
          </div>
        </form>
      </Center>
    </>
  );
};

export default Register;
