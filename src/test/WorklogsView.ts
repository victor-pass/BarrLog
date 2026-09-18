import { WorklogFormView } from "./WorklogFormView";
import { WorklogView } from "./WorklogView";

export class WorklogsView {
  container: HTMLElement;

  #querySelectorAll = <T extends Element>(selectors: string) => [
    ...this.container.querySelectorAll<T>(selectors),
  ];
  #querySelector = <T extends Element>(selectors: string) =>
    this.container.querySelector<T>(selectors);

  worklogs() {
    return this.#querySelectorAll<HTMLElement>(".worklog").map(
      (ul) => new WorklogView(ul),
    );
  }

  form() {
    return new WorklogFormView(this.#querySelector("ul")!);
  }

  constructor(container: HTMLElement) {
    this.container = container;
  }
}
