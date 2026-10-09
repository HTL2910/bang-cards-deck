import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createRoleState, drawRole } from "../model";
import { saveRoleState } from "../storage";
import RoleHome from "./home";

describe("Role Deck route", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
  });

  it("lets the player choose a table size and explains local privacy", () => {
    render(<RoleHome />);

    expect(document.title).toBe("Bộ Vai Trò BANG!");
    const playerCount = screen.getByRole("combobox", { name: "Số người chơi" });
    expect(playerCount).toHaveValue("4");
    expect(screen.getByText(/không đồng bộ với thiết bị khác/i)).toBeInTheDocument();

    fireEvent.change(playerCount, { target: { value: "7" } });
    expect(playerCount).toHaveValue("7");
    expect(screen.getByLabelText("Còn lại: 7")).toBeInTheDocument();
  });

  it("keeps a drawn role private until explicit reveal and can hide it again", () => {
    render(<RoleHome />);
    fireEvent.click(screen.getByRole("button", { name: "Rút vai trò" }));

    expect(screen.getByText("Vai trò đang úp")).toBeInTheDocument();
    expect(screen.queryByText("Cảnh Sát Trưởng")).not.toBeInTheDocument();
    expect(screen.queryByText(/Loại bỏ tất cả Kẻ Ngoài Vòng Pháp Luật/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Xem vai trò" }));
    expect(screen.getByRole("heading", { name: "Cảnh Sát Trưởng" })).toBeInTheDocument();
    expect(screen.getByText("Loại bỏ tất cả Kẻ Ngoài Vòng Pháp Luật và Kẻ Phản Bội.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ẩn vai trò" }));
    expect(screen.getByText("Vai trò đang úp")).toBeInTheDocument();
    expect(screen.queryByText("Cảnh Sát Trưởng")).not.toBeInTheDocument();
  });

  it("requires confirmation before redrawing and hides the replacement", () => {
    render(<RoleHome />);
    fireEvent.click(screen.getByRole("button", { name: "Rút vai trò" }));
    fireEvent.click(screen.getByRole("button", { name: "Xem vai trò" }));

    fireEvent.click(screen.getByRole("button", { name: "Rút lại" }));
    expect(screen.getByRole("dialog", { name: "Rút lại vai trò?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(screen.getByRole("heading", { name: "Cảnh Sát Trưởng" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Rút lại" }));
    fireEvent.click(screen.getByRole("button", { name: "Rút vai trò khác" }));
    expect(screen.getByText("Vai trò đang úp")).toBeInTheDocument();
    expect(screen.getByLabelText("Còn lại: 2")).toBeInTheDocument();
  });

  it("restores a saved role in its hidden state", async () => {
    saveRoleState(localStorage, drawRole(createRoleState(5)));

    render(<RoleHome />);

    expect(await screen.findByText("Vai trò đang úp")).toBeInTheDocument();
    expect(screen.queryByText("Cảnh Sát Trưởng")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xem vai trò" })).toBeInTheDocument();
  });
});
