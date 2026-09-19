import { Worklogs } from "@/components/Worklogs";
import { Component, createMemo } from "solid-js";
import { context } from "@/context";

export interface AppProps {
  timezone: string;
  selectedDay: () => string;
  onSelectedDayChange: (date: string) => void;
}

const App: Component<AppProps> = (props) => {
  const { time } = context();

  const range = createMemo(() => time.dayTimeRange(props.selectedDay()));

  return (
    <div class="app-shell">
      <header class="app-header">
        <div>
          <p class="eyebrow">Daily time log</p>
          <h1>BarrLog</h1>
        </div>
        <label class="filter">
          <span>Viewing</span>
          <input
            type="date"
            value={props.selectedDay()}
            onInput={(e) => props.onSelectedDayChange(e.currentTarget.value)}
          />
        </label>
      </header>
      <main>
        <Worklogs range={range} />
      </main>
    </div>
  );
};

export default App;
