import { Worklogs } from "@/components/Worklogs";
import { Component, createMemo } from "solid-js";
import { context } from "@/context";

export interface AppProps {
  timezone: string;
  selectedDay: () => string;
  onSelectedDayChange: (date: string) => void;
}

const App: Component<AppProps> = ({ selectedDay, onSelectedDayChange }) => {
  const { time } = context();

  const range = createMemo(() => time.dayTimeRange(selectedDay()));

  return (
    <>
      <div class="filter">
        <input
          type="date"
          value={selectedDay()}
          onInput={(e) => onSelectedDayChange(e.currentTarget.value)}
        />
      </div>
      <Worklogs range={range} />
    </>
  );
};

export default App;
