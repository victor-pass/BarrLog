import { DeleteWorklog } from "@/components/DeleteWorklog";
import { For } from "solid-js";
import { WorklogData } from "@/api";
import { context } from "@/context";

interface WorklogProps {
  worklog: WorklogData;
  onDeleted: () => void;
  onEdit: () => void;
  editing: boolean;
}

export const Worklog = (props: WorklogProps) => {
  const { time } = context();
  const worklogTime = time.displayDateTime(props.worklog.time);
  return (
    <ul
      class="worklog"
      classList={{ editing: props.editing }}
      id={props.worklog.id.toString()}
    >
      <li class="name">
        <button
          class="edit"
          type="button"
          aria-label={props.editing ? "Stop editing worklog" : "Edit worklog"}
          onClick={props.onEdit}
        >
          {props.editing ? "✕" : "✎"}
        </button>
        {props.worklog.name}
      </li>
      <li class="notes">{props.worklog.notes}</li>
      <li class="duration">{props.worklog.duration}</li>
      <li class="time">{worklogTime}</li>
      <li class="labels">
        <For each={props.worklog.labels}>
          {(label) => <span>{label.name}</span>}
        </For>
      </li>
      <li>
        <DeleteWorklog id={props.worklog.id} onDeleted={props.onDeleted} />
      </li>
    </ul>
  );
};
