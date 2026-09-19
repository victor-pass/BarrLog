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
  const [labels, { refetch: refetchLabels }] = createResource(
    async () => {
      const res = await api.label.$get();
      return res.json();
    },
    { initialValue: [] },
  );

  const [editingWorklog, setEditingWorklog] = createSignal<WorklogData>();
  const [formExpanded, setFormExpanded] = createSignal(false);

  function edit(wl: WorklogData) {
    return () => {
      setFormExpanded(true);
      if (wl.id === editingWorklog()?.id) {
        setEditingWorklog(undefined);
      } else {
        setEditingWorklog(wl);
      }
    };
  }

  function deleteWorklog(wl: WorklogData) {
    mutateWorklogs((prevWorklogs) =>
      prevWorklogs.filter((item) => item.id !== wl.id),
    );
    if (editingWorklog() == wl) setEditingWorklog(undefined);
  }

  function worklogFormSubmit() {
    setFormExpanded(false);
    setEditingWorklog(undefined);
    refetchWorklogs();
  }

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
                <Worklog
                  worklog={worklog}
                  onDeleted={() => deleteWorklog(worklog)}
                  onEdit={edit(worklog)}
                  editing={worklog.id === editingWorklog()?.id}
                />
              </li>
            )}
          </For>
          <Show when={worklogs().length === 0}>
            <li class="empty-state">
              <strong>No work logged yet</strong>
              <span>Add the first entry for this day below.</span>
            </li>
          </Show>
        </Show>
      </Suspense>
      <li class="forms">
        <WorklogForm
          worklog={editingWorklog}
          labels={labels}
          onLabelsCreated={refetchLabels}
          onSubmitted={worklogFormSubmit}
          expanded={formExpanded}
          setExpanded={setFormExpanded}
        />
      </li>
    </ul>
  );
}
