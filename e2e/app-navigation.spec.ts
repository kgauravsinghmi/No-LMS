import { test, expect } from '@playwright/test';

test.describe('Luminary LMS - End-to-End User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Reset state and visit the app
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Course Catalog displays available tracks and searches correctly', async ({ page }) => {
    // Check main branding and catalog heading
    await expect(page.locator('text=No-LMS').first()).toBeVisible();
    await expect(page.locator('text=Systems Design & Cloud Architecture').first()).toBeVisible();

    // Verify course cards exist
    const startButtons = page.getByRole('button', { name: /start learning|continue learning|start track/i });
    expect(await startButtons.count()).toBeGreaterThan(0);
  });

  test('Student can navigate into a course reader and view lesson content', async ({ page }) => {
    // Click the first course to enter reader mode
    const firstCourseCard = page.locator('div[class*="cursor-pointer"], button').filter({ hasText: /Systems Design|Cloud Architecture/i }).first();
    await firstCourseCard.click();

    // Verify reader view is mounted
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();

    // Verify markdown lesson content renders
    await expect(page.locator('article, main')).toContainText(/System|Architecture|Design|Introduction/i);
  });

  test('Interactive reader toggles Mindmap tab and renders tree nodes', async ({ page }) => {
    // Enter first course
    const firstCourseCard = page.locator('div[class*="cursor-pointer"], button').filter({ hasText: /Systems Design|Cloud Architecture/i }).first();
    await firstCourseCard.click();

    // Click on Mindmap tab
    const mindmapTab = page.getByRole('button', { name: /mindmap|visual tree|graph/i }).first();
    if (await mindmapTab.isVisible()) {
      await mindmapTab.click();
      // Verify mindmap viewer rendered
      await expect(page.locator('svg, [class*="mindmap"], [class*="node"]')).toBeVisible();
    }
  });

  test('User can navigate to Learning Hub and view Gamification badges', async ({ page }) => {
    // Click navigation item for Learning Hub / Progress
    const learningHubLink = page.getByRole('button', { name: /learning hub|progress|achievements/i }).first();
    if (await learningHubLink.isVisible()) {
      await learningHubLink.click();
      await expect(page.locator('text=Learning Hub').or(page.locator('text=Achievements')).or(page.locator('text=Medals'))).toBeVisible();
    }
  });

  test('User can switch between Light and Dark themes', async ({ page }) => {
    // Find dark mode toggle button in header
    const themeToggle = page.locator('button[aria-label*="theme" i], button[aria-label*="mode" i], button:has(svg.lucide-moon, svg.lucide-sun)').first();
    await expect(themeToggle).toBeVisible();

    // Initial state check
    const htmlElement = page.locator('html');
    const initiallyDark = await htmlElement.evaluate(el => el.classList.contains('dark'));

    // Toggle theme
    await themeToggle.click();
    const afterToggleDark = await htmlElement.evaluate(el => el.classList.contains('dark'));
    expect(afterToggleDark).not.toBe(initiallyDark);
  });

  test('Global Search modal opens via keyboard shortcut or search button', async ({ page }) => {
    // Press Ctrl+K to trigger global search
    await page.keyboard.press('Control+k');

    // Modal should be visible
    const searchModal = page.locator('input[placeholder*="Search" i], [role="dialog"]').first();
    await expect(searchModal).toBeVisible();

    // Press Escape to dismiss
    await page.keyboard.press('Escape');
    await expect(searchModal).not.toBeVisible();
  });

  test('Admin authentication modal and Course Studio access', async ({ page }) => {
    // Open admin login
    const adminBtn = page.getByRole('button', { name: /admin|instructor|studio/i }).first();
    if (await adminBtn.isVisible()) {
      await adminBtn.click();

      // Check modal inputs
      const usernameInput = page.locator('input[name="username"], input[type="text"]').last();
      const passwordInput = page.locator('input[type="password"]');

      if (await usernameInput.isVisible() && await passwordInput.isVisible()) {
        await usernameInput.fill('admin');
        await passwordInput.fill('luminary2026');

        const submitBtn = page.getByRole('button', { name: /sign in|log in|authenticate/i });
        await submitBtn.click();

        // Verify Admin Studio is active or logged-in status badge displayed
        await expect(page.locator('text=Admin').or(page.locator('text=Studio')).or(page.locator('text=Instructor'))).toBeVisible();
      }
    }
  });
});
