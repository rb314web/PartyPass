import { test, expect, type Page } from '@playwright/test';

async function acceptCookies(page: Page) {
  const acceptButton = page.getByRole('button', { name: /akceptuję analitykę|accept analytics/i });
  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click();
  }
}

async function scrollToSection(page: Page, id: string) {
  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  await expect(page.locator(`#${id}`)).toBeInViewport();
}

test.describe('Landing page smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await acceptCookies(page);
  });

  test('hero primary CTA navigates to register with starter plan', async ({ page }) => {
    await page.getByRole('button', { name: /rozpocznij za darmo|start for free/i }).first().click();
    await expect(page).toHaveURL(/\/register\?plan=starter/);
  });

  test('pricing yearly toggle updates displayed prices', async ({ page }) => {
    await scrollToSection(page, 'pricing');

    await expect(page.getByText('29 PLN').first()).toBeVisible();

    await page.getByRole('button', { name: /rocznie|yearly/i }).click();
    await expect(page.getByRole('button', { name: /rocznie|yearly/i })).toHaveAttribute('aria-pressed', 'true');

    await expect(page.getByText(/24 PLN|25 PLN/i).first()).toBeVisible();
  });

  test('contact form validates required fields', async ({ page }) => {
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.waitForSelector('#contact form', { timeout: 15_000 });

    const submitButton = page.locator('#contact button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    await expect(page.locator('#contact-name-error')).toHaveText(/imię jest wymagane|name is required/i, {
      timeout: 10_000,
    });
    await expect(page.locator('#contact-email-error')).toHaveText(
      /email jest wymagany|email is required/i
    );
    await expect(page.locator('#contact-message-error')).toHaveText(
      /wiadomość jest wymagana|message is required/i
    );
  });

  test('header anchor navigates to pricing section', async ({ page }) => {
    await page.getByRole('link', { name: /^cennik$|^pricing$/i }).first().click();
    await expect(page.locator('#pricing')).toBeInViewport();
  });

  test('header anchor navigates to faq section', async ({ page }) => {
    await page
      .getByRole('navigation', { name: /primary navigation/i })
      .getByRole('button', { name: /^faq$/i })
      .click();
    await expect(page.locator('#faq')).toBeInViewport();
  });
});

test.describe('Cookie consent', () => {
  test('blocks analytics until accepted', async ({ page, context }) => {
    let gtagRequested = false;
    page.on('request', (request) => {
      if (request.url().includes('googletagmanager.com/gtag')) {
        gtagRequested = true;
      }
    });

    await context.clearCookies();
    await page.addInitScript(() => {
      localStorage.removeItem('partypass-cookie-consent');
    });
    await page.goto('/');

    await expect(page.getByRole('dialog', { name: /pliki cookie|cookies and analytics/i })).toBeVisible();

    await page.waitForTimeout(1500);
    expect(gtagRequested).toBe(false);

    await page.getByRole('button', { name: /akceptuję analitykę|accept analytics/i }).click();
    await expect(page.getByRole('dialog', { name: /pliki cookie|cookies and analytics/i })).toBeHidden();
  });
});
