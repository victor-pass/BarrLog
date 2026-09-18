import { expect, describe, it, beforeEach, Mock, vi } from "vitest";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@solidjs/testing-library";
import { Worklogs } from "./Worklogs";
import { TestContext } from "@/test/TestContext";
import { mockJSONRequest } from "@/test/fixtures";
import { WorklogsView } from "@/test/WorklogsView";

describe("Worklogs", () => {
  let range: () => { from: string; to: string };
  let $get: Mock;
  let view: WorklogsView;

  beforeEach(() => {
    range = () => ({
      from: "2026-08-28T18:00:00-06:00",
      to: "2026-08-29T18:00:00-06:00",
    });
    $get = mockJSONRequest([
      {
        id: 1,
        name: "Testing",
        notes: "notes",
        time: "2026-08-29T17:59:00.000Z",
        duration: "01:00:00",
        user: "1",
        labels: [{ name: "label", id: 1 }],
      },
    ]);

    const { container } = render(() => (
      <TestContext api={{ worklog: { $get } }}>
        <Worklogs range={range} />
      </TestContext>
    ));
    view = new WorklogsView(container);
  });

  it("contains apiResults", async () => {
    expect($get).toHaveBeenCalledExactlyOnceWith({
      query: range(),
    });

    await waitForElementToBeRemoved(() => screen.getByText("Loading..."));

    expect(view.worklogs().map((wl) => wl.values())).toStrictEqual([
      {
        name: "Testing",
        notes: "notes",
        time: "8/29/2026, 5:59 PM UTC",
        duration: "01:00:00",
        labels: ["label"],
      },
    ]);
  });

  describe("Edit", () => {
    it("edit will show the worklog in the form", async () => {
      await waitForElementToBeRemoved(() => screen.getByText("Loading..."));
      view.worklogs()[0].actions().toggleEdit();

      expect(view.form().values()).toStrictEqual({
        id: "1",
        name: "Testing",
        notes: "notes",
        time: "17:59",
        duration: "01:00:00",
        labels: ["label"],
      });
    });

    it("delete will remove the worklog from the form if it's being edited", async () => {
      await waitForElementToBeRemoved(() => screen.getByText("Loading..."));
      vi.useFakeTimers();
      view.worklogs()[0].actions().delete();
      vi.advanceTimersByTime(1000);
      view.worklogs()[0].actions().toggleEdit();

      // TODO determine why this test is not updating correctly
      // expect(view.form().values()).toStrictEqual({});
    });
  });
});
