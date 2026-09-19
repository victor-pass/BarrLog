export function EditWorklog(props: { editing: boolean; onEdit: () => void }) {
  return (
    <button
      class="edit"
      type="button"
      aria-label={props.editing ? "Stop editing worklog" : "Edit worklog"}
      onClick={props.onEdit} // eslint-disable-line solid/reactivity -- onEdit is a stable prop function
    >
      {props.editing ? "✕" : "✎"}
    </button>
  );
}
