export function EditWorklog(props: { onEdit: () => void }) {
  return (
    <button
      class="edit"
      type="button"
      aria-label="Edit worklog"
      onClick={props.onEdit} // eslint-disable-line solid/reactivity -- onEdit is a stable prop function
    >
      ✎
    </button>
  );
}
