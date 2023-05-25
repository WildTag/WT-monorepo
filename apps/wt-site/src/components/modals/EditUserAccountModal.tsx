import { Button, Modal, Select, TextInput } from "@mantine/core";
import { handleEditUser } from "../../helpers/handleEditUser";
import { Account } from "../../types/Account";
import { useClickOutside } from "@mantine/hooks";
import { useState } from "react";

interface EditUserAccountModalProps {
  form: any;
  modalOpened: boolean;
  setModalOpened: (modalOpened: boolean) => void;
  selectedUser: Account | undefined;
  accessToken: string | null;
  users: Account[] | Account;
  setUsers: (users: Account[] | Account | null) => void;
  noEditRole?: boolean;
}

const EditUserAccountModal = ({
  form,
  modalOpened,
  setModalOpened,
  selectedUser,
  accessToken,
  users,
  setUsers,
  noEditRole,
}: EditUserAccountModalProps) => {
  const [opened, setOpened] = useState(false);
  const ref = useClickOutside(() => setOpened(false));

  return (
    <Modal opened={modalOpened} onClose={close} title={"Edit user"}>
      <form
        onSubmit={form.onSubmit(() => {
          if (!selectedUser || !accessToken) return;

          handleEditUser({
            selectedUser: selectedUser,
            accessToken: accessToken,
            form: form,
            users: users,
            setUsers: setUsers,
            noEditRole: noEditRole,
          });
          setModalOpened(!modalOpened);
        })}
      >
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
        {!noEditRole && (
          <Select
            label={"Permission"}
            data={[
              { value: "USER", label: "User" },
              { value: "ADMINISTRATOR", label: "Administrator" },
              { value: "MODERATOR", label: "Moderator" },
            ]}
            {...form.getInputProps("permission")}
          />
        )}
        <Button type="submit" mt={10}>
          Edit user
        </Button>
      </form>
    </Modal>
  );
};

export default EditUserAccountModal;
