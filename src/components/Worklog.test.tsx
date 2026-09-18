import {
  expect,
  vi,
  describe,
  it,
  Mock,
  VitestUtils,
  beforeEach,
} from "vitest";
import { render } from "@solidjs/testing-library";
import { TestContext } from "@/test/TestContext";
import { Worklog } from "@/components/Worklog";
import { WorklogView } from "@/test/WorklogView";
import { mockJSONRequest } from "@/test/fixtures";

describe("Worklog", () => {
  const wl = {
    id: 1,
    name: "Testing",
    notes: "notes",
    time: "2026-08-29T17:59:00.000Z",
    duration: "01:00:00",
    user: "1",
    labels: [{ name: "label", id: 1 }],
  };
  let $delete: VitestUtils["fn"];
  let deleted: VitestUtils["fn"];
  let edit: VitestUtils["fn"];
  let worklog: WorklogView;

  beforeEach(() => {
    $delete = mockJSONRequest({});
    deleted = vi.fn().mockName("deleted");
    edit = vi.fn().mockName("edit");
    const { container } = render(() => (
      <TestContext api={{ worklog: { $delete } }}>
        <Worklog
          editing={false}
          onDeleted={deleted}
          onEdit={edit}
          worklog={wl}
        />
      </TestContext>
    ));
    worklog = new WorklogView(container);
  });

  it("renders the worklog", () => {
    expect(worklog.values()).toStrictEqual({
      name: "Testing",
      notes: "notes",
      time: "8/29/2026, 5:59 PM UTC",
      duration: "01:00:00",
      labels: ["label"],
    });
  });

  it("can be edited and deleted", () => {
    expect(worklog.buttons()).toStrictEqual({
      edit: "✎",
      delete: "⌫",
      cancelDelete: undefined,
    });
  });

  describe("Edit", () => {
    it("can be toggled on", async () => {
      worklog.actions().toggleEdit();
      expect(edit).toHaveBeenCalledOnce();
    });
  });

  describe("Delete", () => {
    it("can be started", () => {
      vi.useFakeTimers();
      worklog.actions().delete();
      expect($delete).not.toHaveBeenCalled();
    });
    it("can be canceled", () => {
      vi.useFakeTimers();
      worklog.actions().delete();
      expect(worklog.buttons()).toStrictEqual({
        edit: "✎",
        delete: undefined,
        cancelDelete: "✕",
      });
      worklog.actions().cancelDelete();
      expect(worklog.buttons()).toStrictEqual({
        edit: "✎",
        delete: "⌫",
        cancelDelete: undefined,
      });
    });
    it("eventually deletes", () => {
      vi.useFakeTimers();
      worklog.actions().delete();
      vi.advanceTimersByTime(5000);

      expect($delete).toHaveBeenCalled();
    });
  });
});
