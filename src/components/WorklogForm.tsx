import {
  createSignal,
  createEffect,
  onMount,
  Show,
  createMemo,
  createResource,
} from "solid-js";
import { context } from "@/context";
import { createStore } from "solid-js/store";
import { Select, createOptions } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";
import { WorklogData, LabelData } from "@/api";

interface WorklogFormProps {
  worklog: () => undefined | WorklogData;
  onSubmitted: () => void;
  cancel: () => void;
}

export function WorklogForm(props: WorklogFormProps) {
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

  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [state, setState] = createStore<WorklogData>(defaultState());
  const [expanded, setExpanded] = createSignal(false);
  const show = createMemo(() => expanded() || !!props.worklog());
  const usedLabels = createMemo(
    () => new Set(state.labels.map(({ name }) => name)),
  );

  const [labels, { refetch: refetchLabels }] = createResource(
    async () => {
      const res = await api.label.$get();
      return res.json();
    },
    { initialValue: [] },
  );

  createEffect(() => {
    const { time: worklogTime } = props.worklog() ?? { time: undefined };
    const { time: defaultTime } = defaultState();
    setState({
      ...defaultState(),
      ...props.worklog(),
      time: worklogTime ? time.localInputTime(worklogTime) : defaultTime,
    });
  });

  const selectProps = createOptions(() => labels(), {
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
          time: time.dateTime(state.time),
        },
      });
      if (!res.ok) throw new Error("Failed to save worklog entry");
      const result = await res.json();
      if (result.createdLabels) refetchLabels();

      setState(defaultState());
      setExpanded(false);
      props.onSubmitted();
    } catch (err) {
      // TODO: Can probably recreate this using an <ErrorBoundary>
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      class="worklog-form"
      classList={{ expanded: show() }}
      onSubmit={handleSubmit}
    >
      <input hidden name="id" value={state.id} />
      <ul>
        {error() && <li class="error">{error()}</li>}
        <li class="top">
          <button
            class="toggle-open"
            type="button"
            aria-label={show() ? "Close worklog form" : "Add worklog"}
            onClick={() =>
              setExpanded((prev) => {
                if (prev) props.cancel();
                return !prev;
              })
            }
          >
            {show() ? "✕" : "Add worklog"}
          </button>
        </li>
        <li class="name expandable">
          <label>
            <span>What did you work on?</span>
            <input
              name="name"
              placeholder="e.g. Project planning"
              value={state.name}
              onInput={(e) => setState("name", e.currentTarget.value)}
            />
          </label>
        </li>
        <li class="time expandable">
          <label>
            <span>Start</span>
            <input
              type="time"
              name="time"
              value={state.time}
              onInput={(e) => setState("time", e.currentTarget.value)}
            />
          </label>
        </li>
        <li class="duration expandable">
          <label>
            <span>Duration</span>
            <input
              name="duration"
              type="text"
              placeholder="e.g. 1 hour"
              value={state.duration ?? ""}
              onInput={(e) => setState("duration", e.currentTarget.value)}
            />
          </label>
        </li>
        <li class="notes expandable">
          <label>
            <span>Notes</span>
            <textarea
              name="notes"
              rows="4"
              cols="40"
              placeholder="Add context, decisions, or next steps"
              onInput={(e) => setState("notes", e.currentTarget.value)}
              value={state.notes ?? ""}
            />
          </label>
        </li>
        <li class="labels expandable">
          <div class="field-label">
            <span>Labels</span>
            <Show when={mounted()}>
              <Select
                name="labels"
                multiple
                {...selectProps}
                initialValue={state.labels}
                onChange={(selected: LabelData[]) =>
                  setState("labels", selected)
                }
              />
            </Show>
          </div>
        </li>
        <li class="action expandable">
          <button type="submit" disabled={submitting()} name="save">
            {submitting() ? "Saving…" : "Save entry"}
          </button>
        </li>
      </ul>
    </form>
  );
}
