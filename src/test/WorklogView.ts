import { fireEvent } from "@solidjs/testing-library";

interface Values {
  duration: string;
  time: string;
  name: string;
  notes: string;
  labels: string[];
}

export class WorklogView {
  container: HTMLElement;

  #querySelector = (selectors: string) =>
    this.container.querySelector(selectors);
  #field = (name: string) => this.#querySelector(`li.${name}`)!;
  #button = (name: string) => this.#querySelector(`button.${name}`);

  constructor(container: HTMLElement) {
    this.container = container;
  }

  values(): Values {
    return {
      duration: this.#field("duration").textContent,
      time: this.#field("time").textContent,
      name: this.#field("name").textContent,
      notes: this.#field("notes").textContent,
      labels: [...this.#field("labels").querySelectorAll("span")].map(
        (span) => span.textContent,
      ),
    };
  }

  classes() {
    return [...this.#querySelector(".worklog")!.classList];
  }

  buttons() {
    return {
      edit: this.#button("edit")?.textContent,
      delete: this.#button("delete")?.textContent,
      cancelDelete: this.#button("cancel-delete")?.textContent,
    };
  }
  actions() {
    return {
      toggleEdit: () => fireEvent.click(this.#button("edit")!),
      delete: () => fireEvent.click(this.#button("delete")!),
      cancelDelete: () => fireEvent.click(this.#button("cancel-delete")!),
    };
  }
}
