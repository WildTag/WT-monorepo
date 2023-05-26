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
  /*
HANDLES THE EDIT USER SO THAT WHEN AN ADMIN OR A USER WANTS TO EDIT ACCOUNT INFORMATION 


PARAMETERS: SELECTED USER IS THE CURRENT USER THAT YOU WANT TO EDIT, 
ACCESS TOKEN IS THE AUTHENTICATION TO CHECK IF THE USER HAS PERMISSION TO EDIT THE CURRENT USER, 
FORM IS TO COLLECT AND SEND DATA TO THE API, 
USERS THE USER OR A LIST OF USERS SO THAT IT CAN CHANGE THE SET STATE WHEN THE USER IS EDITED SO THAT THE PAGE CAN BE RERENDERED
SETUSERS IS THE UPDATE FUNCTION FOR THE USERS USE STATE

RETURN VOID

  */
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
