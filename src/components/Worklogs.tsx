import { createResource, createSignal } from "solid-js";
import { WorklogForm } from "@/components/WorklogForm";
import { Worklog } from "@/components/Worklog";
import { context } from "@/context";
import { For, Show, Suspense } from "solid-js";
import { WorklogData } from "@/api";

type WorklogsProps = {
  range: () => { from: string; to: string };
};

export function Worklogs(props: WorklogsProps) {
  const { api } = context();

  const [worklogs, { refetch: refetchWorklogs, mutate: mutateWorklogs }] =
    createResource(
      props.range, // eslint-disable-line solid/reactivity -- props.range is already an accessor
      async (range) => {
        const res = await api.worklog.$get({ query: range });
        return res.json();
      },
      { initialValue: [] },
    );

  const [editingWorklog, setEditingWorklog] = createSignal<WorklogData>();

  function deleteWorklog(wl: WorklogData) {
    mutateWorklogs((prevWorklogs) =>
      prevWorklogs.filter((item) => item.id !== wl.id),
    );
  }

  const editProps = {
    worklog: editingWorklog,
    onSubmitted: () => {
      setEditingWorklog(undefined);
      refetchWorklogs();
    },
    cancel: () => setEditingWorklog(undefined),
  };

  return (
    <ul class="worklog-list">
      <Suspense fallback={<li>Loading...</li>}>
        <Show
          when={!worklogs.error}
          fallback={<li>{`Error: ${worklogs.error?.message}`}</li>}
        >
          <For each={worklogs()}>
            {(worklog) => (
              <li>
                <Show when={worklog.id !== editingWorklog()?.id}>
                  <Worklog
                    worklog={worklog}
                    onDeleted={() => deleteWorklog(worklog)}
                    onEdit={() => setEditingWorklog(worklog)}
                  />
                </Show>
              </li>
            )}
          </For>
          <Show when={worklogs().length === 0}>
            <li class="empty-state">
              <strong>No work logged yet</strong>
              <span>Add the first entry below.</span>
            </li>
          </Show>
        </Show>
      </Suspense>
      <li class="forms">
        <WorklogForm {...editProps} />
      </li>
    </ul>
  );
}
