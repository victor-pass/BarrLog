import { fireEvent } from "@solidjs/testing-library";

interface Values {
  id: string;
  duration: string;
  time: string;
  name: string;
  notes: string;
  labels: string[];
}
interface LabelAction {
  input?: string;
  select: string;
}
interface SettableValues {
  duration: string;
  time: string;
  name: string;
  notes: string;
  labels: LabelAction[];
}

export class WorklogFormView {
  container: HTMLElement;

  #input = (key: string) =>
    this.container.querySelector<HTMLInputElement>(`input[name="${key}"]`)!
      .value;
  #text = (key: string) =>
    this.container.querySelector<HTMLTextAreaElement>(
      `textarea[name="${key}"]`,
    )!.value;
  #solidSelect = (key: string) =>
    [
      ...this.container.querySelectorAll<HTMLSpanElement>(
        `li.${key} .solid-select-multi-value > span`,
      ),
    ].map((span) => span.textContent);

  #setInput(name: string, value: string) {
    const input = this.container.querySelector<HTMLInputElement>(
      `input[name="${name}"]`,
    )!;

    input.value = value;
    fireEvent.change(input);
  }

  #setters: {
    [K in keyof SettableValues]: (value: SettableValues[K]) => void;
  } = {
    duration: (duration) => this.#setInput("duration", duration),
    time: (time) => this.#setInput("time", time),
    name: (name) => this.#setInput("name", name),
    notes: (notes) => {
      const textarea = this.container.querySelector<HTMLTextAreaElement>(
        'textarea[name="notes"]',
      )!;
      fireEvent.input(textarea, { target: { value: notes } });
    },
    labels: (labels: LabelAction[]) => {
      const input = this.container.querySelector<HTMLInputElement>(
        'input[name="labels"]',
      )!;
      for (const label of labels) {
        if (label.input) {
          fireEvent.input(input, { target: { value: label.input } });
        }

        const createLabelOption = [
          ...this.container.querySelectorAll<HTMLDivElement>(
            "li.labels .solid-select-list > div.solid-select-option",
          ),
        ].find((div) => div.textContent === label.select)!;

        fireEvent.click(createLabelOption);
      }
    },
  };

  constructor(container: HTMLElement) {
    this.container = container;
  }

  values(): Values {
    return {
      id: this.#input("id"),
      duration: this.#input("duration"),
      time: this.#input("time"),
      name: this.#input("name"),
      notes: this.#text("notes"),
      labels: this.#solidSelect("labels"),
    };
  }

  setValues(values: Partial<SettableValues>) {
    const entries = Object.entries(values) as [
      keyof SettableValues,
      SettableValues[keyof SettableValues],
    ][];
    for (const [field, value] of entries) {
      (this.#setters[field] as (value: unknown) => void)(value);
    }
  }

  submit() {
    fireEvent.click(this.container.querySelector("button[type='submit']")!);
  }
}
