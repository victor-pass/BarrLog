import { context } from "@/context";
import {
  Accessor,
  createMemo,
  createSignal,
  JSXElement,
  onCleanup,
  Show,
} from "solid-js";

const SECONDS = 1000;

export function DeleteWorklog(props: { id: number; onDeleted: () => void }) {
  const { api } = context();

  const [deleting, setDeleting] = createSignal(false);
  let timer: NodeJS.Timeout | undefined = undefined;

  const deleteWorklog = async () => {
    const res = await api.worklog.$delete({ json: { id: props.id } });
    if (!res.ok) throw new Error("Failed to delete worklog entry");
    props.onDeleted();
    return await res.json();
  };

  const startDelete = () => {
    setDeleting(true);
    timer = setTimeout(deleteWorklog, 5 * SECONDS);
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
