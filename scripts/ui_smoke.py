"""Smoke-test learn-cmd in a real browser: boot, run commands, check DOM."""

from playwright.sync_api import sync_playwright

import os

BASE = os.environ.get("LEARN_CMD_URL", "http://localhost:4173/?NODEMO")


def main() -> int:
    errors: list[str] = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.on("pageerror", lambda exc: errors.append(f"pageerror: {exc}"))
        page.on(
            "console",
            lambda msg: errors.append(f"console.{msg.type}: {msg.text}")
            if msg.type == "error"
            else None,
        )
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_timeout(400)

        # Tree should show the default profile
        tree = page.locator("#fs-tree").inner_text()
        assert "student" in tree or "notes.txt" in tree, f"tree missing home: {tree[:400]}"

        # Run a command that creates a file
        inp = page.locator("#term-input")
        inp.fill("echo hello>readme.txt")
        inp.press("Enter")
        page.wait_for_timeout(200)
        tree = page.locator("#fs-tree").inner_text()
        assert "readme.txt" in tree, f"file not in tree after echo redirect: {tree[:500]}"

        # cd into Documents
        inp.fill("cd Documents")
        inp.press("Enter")
        page.wait_for_timeout(150)
        prompt = page.locator("#term-prompt").inner_text()
        assert "Documents" in prompt, f"cwd not updated: {prompt}"

        # md and dir
        inp.fill("md projects")
        inp.press("Enter")
        page.wait_for_timeout(150)
        tree = page.locator("#fs-tree").inner_text()
        # projects is under Documents now
        assert "projects" in tree, f"projects missing: {tree[:500]}"

        # Open levels dialog via meta command
        inp.fill("levels")
        inp.press("Enter")
        page.wait_for_timeout(250)
        assert page.locator("#modal").evaluate("el => el.classList.contains('open')")
        body = page.locator("#modal-body").inner_text()
        assert (
            "Introduction Sequence" in body
            or "سری مقدماتی" in body
            or "intro-echo" in body
            or "echo" in body.lower()
        ), f"levels dialog content: {body[:400]}"

        # Click first level
        page.locator("[data-level='intro-echo']").click()
        page.wait_for_timeout(300)
        # Lesson dialog should be open
        assert page.locator("#modal").evaluate("el => el.classList.contains('open')")
        lesson = page.locator("#modal-body").inner_text()
        assert "learn-cmd" in lesson or "Welcome" in lesson or "echo" in lesson.lower()

        # Start / close dialog
        page.locator("[data-action='close-modal']").first.click()
        page.wait_for_timeout(150)

        # Solve intro-echo
        inp.fill("echo hello")
        inp.press("Enter")
        page.wait_for_timeout(300)
        win = page.locator("#modal-body").inner_text()
        assert "LEVEL SOLVED" in win or "Goal state" in page.locator("#goal-panel").inner_text(), win[:400]

        page.screenshot(path="output/playwright/learn-cmd-solved.png", full_page=True)
        browser.close()

    if errors:
        print("BROWSER ERRORS:")
        for e in errors:
            print(" -", e)
        return 1
    print("UI smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
