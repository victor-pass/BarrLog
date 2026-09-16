import {
  createSignal,
  createEffect,
  onMount,
  Show,
  createMemo,
  Accessor,
  Setter,
} from "solid-js";
import { context } from "@/context";
import { createStore } from "solid-js/store";
import { Select, createOptions } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";
import { WorklogData, LabelData } from "@/api";

interface WorkLogFormProps {
  worklog: () => undefined | WorklogData;
  labels: () => LabelData[];
  onLabelsCreated: () => void;
  onSubmitted: () => void;
  expanded: Accessor<boolean>;
  setExpanded: Setter<boolean>;
}

export function WorklogForm(props: WorkLogFormProps) {
  const { api, time } = context();

  const defaultState = (): WorklogData => ({
    id: NaN,
    time: time.defaultTime(),
    duration: "1 hour",
    name: "",
    notes: "",
    labels: [],
  });

  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));

  const { expanded, setExpanded } = props;
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [state, setState] = createStore<WorklogData>(defaultState());
  const usedLabels = createMemo(
    () => new Set(state.labels.map(({ name }) => name)),
  );

  createEffect(() => {
    const { time: propTime } = props.worklog() ?? { time: undefined };
    const { time: defaultTime } = defaultState();
    setState({
      ...defaultState(),
      ...props.worklog(),
      time: propTime ? time.toLocalTime(propTime) : defaultTime,
    });
  });

  const selectProps = createOptions(() => props.labels(), {
    key: "name",
    createable: true,
    disable: (name: string) => usedLabels().has(name),
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.worklog.$post({
        json: {
          ...state,
          time: time.toISOTime(state.time),
        },
      });
      if (!res.ok) throw new Error("Failed to save worklog entry");
      const result = await res.json();
      if (result.createdLabels) props.onLabelsCreated();

      setState(defaultState());
      props.onSubmitted();
    } catch (err) {
      // TODO: Can probably recreate this using an <ErrorBoundary>
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input hidden name="id" value={state.id} />
      <ul class="worklogForm" classList={{ expanded: expanded() }}>
        {error() && <li class="error">{error()}</li>}
        <li class="name expandable">
          <input
            name="name"
            value={state.name}
            onInput={(e) => setState("name", e.currentTarget.value)}
          />
        </li>
        <li class="time expandable">
          <input
            type="time"
            name="time"
            value={state.time}
            onInput={(e) =>
              setState("time", time.toISOTime(e.currentTarget.value))
            }
          />
        </li>
        <li class="duration expandable">
          <input
            name="duration"
            type="text"
            value={state.duration ?? ""}
            onInput={(e) => setState("duration", e.currentTarget.value)}
          />
        </li>
        <li class="notes expandable">
          <textarea
            name="notes"
            rows="5"
            cols="40"
            placeholder="Notes..."
            onInput={(e) => setState("notes", e.currentTarget.value)}
            value={state.notes ?? ""}
          />
        </li>
        <li class="labels expandable">
          <Show when={mounted()}>
            <Select
              name="labels"
              multiple
              {...selectProps}
              initialValue={state.labels}
              onChange={(selected: LabelData[]) => setState("labels", selected)}
            />
          </Show>
        </li>
        <li class="action">
          <button type="submit" disabled={submitting()} name="save">
            {submitting() ? "Saving..." : "Log"}
          </button>
          <button
            name="expand"
            type="button"
            class="expand"
            onclick={() => setExpanded((prev) => !prev)}
          >
            {expanded() ? "↓" : "Log ↑"}
          </button>
        </li>
      </ul>
    </form>
  );
}
