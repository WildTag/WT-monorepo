import { notifications } from "@mantine/notifications";
import { Account } from "../types/Account";

interface HandleEditUserProps {
  selectedUser: Account;
  accessToken: string;
  form: any;
  users: Account[] | Account | null;
  setUsers: (users: Account[] | Account) => void;
  noEditRole?: boolean;
}

export const handleEditUser = async ({
  selectedUser,
  accessToken,
  form,
  users,
  setUsers,
}: HandleEditUserProps) => {
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

  if (Array.isArray(users)) {
    const tmpUsers = JSON.parse(JSON.stringify(users));
    const index = tmpUsers.findIndex((user) => user.accountId === selectedUser?.accountId);
    tmpUsers[index] = data.user;
    setUsers(tmpUsers);
  } else {
    setUsers(data.user);
  }

  notifications.show({
    title: "Success",
    message: data.detail,
    color: "green",
  });
};
