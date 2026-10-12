import { context } from "@/context";
import { createSignal, onCleanup, Show } from "solid-js";

export function DeleteWorklog(props: { id: number; onDeleted: () => void }) {
  const { store } = context();

  const [deleting, setDeleting] = createSignal(false);
  let timer: NodeJS.Timeout | undefined = undefined;

  const deleteWorklog = async () => {
    await store.deleteWorklog(props.id);
    props.onDeleted();
  };

  const startDelete = () => {
    setDeleting(true);
    timer = setTimeout(deleteWorklog, 4500);
  };

  const cancelDelete = () => {
    setDeleting(false);
    clearTimeout(timer);
  };

  onCleanup(() => {
    if (timer) clearTimeout(timer);
  });

  const DeleteButton = () => (
    <button
      class="delete"
      type="button"
      aria-label="Delete worklog"
      onClick={startDelete}
    >
      ⌫
    </button>
  );

  const CancelDeleteButton = () => (
    <button
      class="cancel-delete"
      type="button"
      aria-label="Cancel Delete worklog"
      onClick={cancelDelete}
    >
      ✕
    </button>
  );

  return (
    <Show when={deleting()} fallback={<DeleteButton />}>
      <CancelDeleteButton />
    </Show>
  );
}
