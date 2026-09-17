import { expect, vi, describe, it } from "vitest";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@solidjs/testing-library";
import { Worklogs } from "./Worklogs";
import { TestContext } from "@/test/TestContext";
import { jsonResponse } from "@/test/fixtures";
import { WorklogsView } from "@/test/WorklogsView";

const mockJSONRequest = (object: any) =>
  vi.fn().mockResolvedValue(jsonResponse(object));

describe("Worklogs", () => {
  it("contains apiResults", async () => {
    const range = () => ({
      from: "2026-08-28T18:00:00-06:00",
      to: "2026-08-29T18:00:00-06:00",
    });
    const api = {
      worklog: {},
    };
    const $get = mockJSONRequest([
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

    expect($get).toHaveBeenCalledExactlyOnceWith({
      query: range(),
    });

    await waitForElementToBeRemoved(() => screen.getByText("Loading..."));

    const worklogs = new WorklogsView(container).worklogs();
    expect(worklogs.map((wl) => wl.values())).toStrictEqual([
      {
        name: "✎Testing",
        notes: "notes",
        time: "8/29/2026, 5:59 PM UTC",
        duration: "01:00:00",
        labels: ["label"],
      },
    ]);
  });
});
