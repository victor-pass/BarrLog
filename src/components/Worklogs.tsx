import { createResource, createSignal } from "solid-js";
import { WorklogForm } from "@/components/WorklogForm";
import { Worklog } from "@/components/Worklog";
import { context } from "@/context";
import { For, Show, Suspense } from "solid-js";
import { WorklogData } from "@/api";

type WorklogsProps = {
  range: () => { from: string; to: string };
};

export function Worklogs({ range }: WorklogsProps) {
  const { api } = context();

  const [worklogs, { refetch: refetchWorklogs }] = createResource(
    range,
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

  function worklogFormSubmit() {
    setFormExpanded(false);
    setEditingWorklog(undefined);
    refetchWorklogs();
  }

  return (
    <ul>
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
                  onDeleted={refetchWorklogs}
                  onEdit={edit(worklog)}
                  editing={worklog.id === editingWorklog()?.id}
                />
              </li>
            )}
          </For>
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
