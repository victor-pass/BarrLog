import { context } from "@/context";

export function DeleteWorklog(props: { id: number; onDeleted: () => void }) {
  const { api } = context();

  const deleteWorklog = async (id: number) => {
    const res = await api.worklog.$delete({ json: { id } });
    if (!res.ok) throw new Error("Failed to delete worklog entry");
    props.onDeleted();
    return await res.json();
  };

  return (
    <button
      class="delete"
      type="button"
      aria-label="Delete worklog"
      onClick={() => deleteWorklog(props.id)}
    >
      ☒
    </button>
  );
}
