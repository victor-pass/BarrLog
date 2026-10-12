import { Component, onMount, createSignal, Show, splitProps } from "solid-js";
import { renderToStringAsync } from "solid-js/web";
import { Route, Router, useNavigate, useParams } from "@solidjs/router";
import App from "@/App";
import { AppContext } from "@/context";
import { TimeAPI } from "@/TimeAPI";
import "temporal-polyfill/global";
import { ApiClient } from "@/persistence/api";
import { StorageEngine } from "@/persistence/store";

interface Props {
  client: ApiClient;
  url?: string;
  store: StorageEngine;
}

function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

const RedirectDefaults: Component = () => {
  const navigate = useNavigate();

  onMount(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = Temporal.Now.plainDateISO(timezone).toString();
    navigate(`/${timezone.replace(/\//g, "~")}/${date}`, { replace: true });
  });

  return <p>Loading...</p>;
};

const WorklogRoute: Component<{ client: ApiClient; store: StorageEngine }> = (
  props,
) => {
  const params = useParams<{ timezone: string; date: string }>();
  const navigate = useNavigate();

  const timezone = params.timezone.replace(/~/g, "/");

  const [date, setDate] = createSignal(params.date);
  const time = new TimeAPI(timezone, date);

  onMount(() => {
    if (!isValidTimezone(timezone) || !isValidDate(date())) {
      navigate("/", { replace: true });
    }
  });

  return (
    <Show
      when={isValidTimezone(timezone) && isValidDate(date())}
      fallback={<p>Loading...</p>}
    >
      <AppContext.Provider
        value={
          /* eslint-disable-next-line solid/reactivity -- props don't change */
          { api: props.client, time, store: props.store }
        }
      >
        <App
          timezone={timezone}
          selectedDay={date}
          onSelectedDayChange={(date) => {
            setDate(date);
            navigate(`/${params.timezone}/${date}`, { replace: true });
          }}
        />
      </AppContext.Provider>
    </Show>
  );
};

export const ContextRouter: Component<Props> = (props) => (
  <Router url={props.url}>
    <Route path="/" component={RedirectDefaults} />
    <Route
      path="/:timezone/:date"
      component={() => (
        <WorklogRoute client={props.client} store={props.store} />
      )}
    />
  </Router>
);

export const renderContextRouter = async (props: Props) => {
  return renderToStringAsync(() => <ContextRouter {...props} />);
};
