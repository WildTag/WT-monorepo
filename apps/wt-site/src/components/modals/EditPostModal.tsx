import { Button, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Comment } from "../../types/Post";
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";

interface EditCommentModalProps {
  modalOpened: boolean;
  setModalOpened: (modalOpened: boolean) => void;
  comment: Comment | null;
  handleEditComment: () => void;
}

const EditCommentModal = ({
  modalOpened,
  setModalOpened,
  comment,
  handleEditComment,
}: EditCommentModalProps) => {
  return (
    <Modal
      zIndex={1000}
      title={"Upload"}
      opened={modalOpened}
      onClose={() => setModalOpened(!modalOpened)}
      size={"xl"}
    >
      <form
        onSubmit={form.onSubmit(() => {
          handleEditComment();
        })}
      >
        <TextInput label={"Comment"} {...form.getInputProps("comment_text")} />
        <Button mt={10} type="submit">
          Edit comment
        </Button>
      </form>
    </Modal>
  );
};

export default EditCommentModal;
