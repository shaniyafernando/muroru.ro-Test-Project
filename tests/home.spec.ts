import { test, expect } from "@playwright/test";
import { parseTimeAgo } from "../utils/datetime";
import HomePage from "../pages/HomePage";

test("MAS-50 Display and Visibility of Trending Banner", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Miruro Trending This Week")).toBeVisible();

  const homePage = new HomePage(page);
  const trendingAnimeTitle = await homePage.trendingAnimeTitle();
  console.log("Trending Anime Title: ", await trendingAnimeTitle.textContent());
  await expect(trendingAnimeTitle).toBeVisible();

  const trendingAnimeImage = await homePage.trendingAnimeImage();
  await expect(trendingAnimeImage).toBeVisible();
});

test("MAS-51 Trending Banner Click Navigation", async ({ page, request }) => {
  await page.goto("/");

  const homePage = new HomePage(page);
  const trendingAnimeLink = await homePage.trendingAnimeLink();
  const href = (await trendingAnimeLink.getAttribute("href")) ?? "";
  const response = await request.get(href);
  expect(response.status()).toBe(200);

  console.log("Before click: ", page.url());
  console.log("Clicking on trending anime link: ", href);

  Promise.all([
    trendingAnimeLink.click(),
    await page.waitForLoadState("networkidle"),
  ]);

  await expect(page).toHaveURL(href);
  console.log("After click: ", page.url());
});

test("MAS-38 Tab Selection and Active Highlighting", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Recommendation")).toBeVisible();

  const homePage = new HomePage(page);
  const navTabs = await homePage.recommendedGenreTabs();
  console.log(await navTabs.count());
  expect(await navTabs.count()).toBeGreaterThan(4);
  console.log("All tabs: ", await navTabs.allTextContents());
  console.log("Active tab: ", await navTabs.first().textContent());
});

test("MAS-39 Switching Recommendation Tabs", async ({ page }) => {
  await page.goto("/");

  const homePage = new HomePage(page);
  const navTabs = await homePage.recommendedGenreTabs();
  console.log("All tabs: ", await navTabs.allTextContents());
  expect(await navTabs.first()).toHaveClass(/active/);
  console.log("Active tab: ", await navTabs.first().textContent());

  await navTabs.nth(2).click();
  await expect(navTabs.nth(2)).toHaveClass(/active/);
  console.log("After clicking 3rd tab: ", await navTabs.nth(2).textContent());

  await navTabs.nth(4).click();
  await expect(navTabs.nth(4)).toHaveClass(/active/);
  console.log("After clicking 5th tab: ", await navTabs.nth(4).textContent());
});

test("MAS-40 Recommended Card Navigation", async ({ page, request }) => {
  await page.goto("/");

  const homePage = new HomePage(page);
  const navTabs = await homePage.recommendedGenreTabs();
  const tabCount = await navTabs.count();
  const randomTabIndex = Math.floor(Math.random() * tabCount);
  const selectedTab = navTabs.nth(randomTabIndex);

  await selectedTab.click();
  console.log("Clicked on tab:", (await selectedTab.textContent())?.trim());

  const recommendedCards = homePage.recommendedGenreEpisodes();
  const cardCount = await recommendedCards.count();

  expect(cardCount).toBeGreaterThan(0);

  const randomCardIndex = Math.floor(Math.random() * cardCount);
  const recommendedCard = recommendedCards.nth(randomCardIndex);

  const href = (await recommendedCard.getAttribute("href")) ?? "";
  expect(href).not.toBe("");

  const response = await request.get(href);
  expect(response.status()).toBe(200);

  console.log("Before click URL:", page.url());
  console.log("Clicking on recommended card link:", href);

  await Promise.all([
    recommendedCard.click({ timeout: 5000 }),
    page.waitForLoadState("networkidle"),
  ]);

  await expect(page).toHaveURL(href);
  console.log("After click URL:", page.url());
});

test(
  "MAS-41 Responsive layout test for Recommendation section",
  {
    tag: "@manual",
  },
  async ({ page }) => {
    const viewports = [
      { name: "Desktop", width: 1280, height: 720 },
      { name: "Tablet", width: 768, height: 1024 },
      { name: "Mobile", width: 375, height: 667 },
    ];

    await page.goto("/");

    const recommendationSection = page.locator(
      '#recommendation, .recommendation, section:has-text("Recommendation")',
    );
    const homePage = new HomePage(page);
  const navTabs = await homePage.recommendedGenreTabs();

    for (const vp of viewports) {
      await test.step(`Verify layout on ${vp.name} (${vp.width}x${vp.height})`, async () => {
        // 1. Resize browser viewport
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.waitForTimeout(500);

        await expect(page.getByText("Recommendation")).toBeVisible();
        await expect(navTabs.first()).toBeVisible();

        const tabsBoundingBox = await navTabs.first().evaluate((el) => {
          const parent = el.closest("ul, div");
          return parent ? parent.getBoundingClientRect().right : 0;
        });
        expect(tabsBoundingBox).toBeLessThanOrEqual(vp.width);

        const firstCard = navTabs
          .first()
          .locator(".recommendation-grid a, article a");
        if (await firstCard.isVisible()) {
          const badge = firstCard.locator(".badge, .status");
          const title = firstCard.locator("h5, .title");

          await expect(badge).toBeVisible();
          await expect(title).toBeVisible();

          const img = firstCard.locator("img");
          const imgBox = await img.boundingBox();
          expect(imgBox?.height).toBeGreaterThan(0);
          expect(imgBox?.width).toBeGreaterThan(0);
        }

        await recommendationSection.screenshot({
          path: `recommendation-${vp.name.toLowerCase()}.png`,
        });
      });
    }
  },
);

test("MAS-46 Display and Sorting of Latest Episodes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Latest Release")).toBeVisible();

  const homePage = new HomePage(page);
  const numberOfEpisodes = await homePage.latestReleaseEpisodes().count();
  console.log(`Number of latest episodes: ${numberOfEpisodes}`);

  for (let i = 0; i < numberOfEpisodes; i++) {
    const episode = homePage.latestReleaseEpisodes().nth(i);
    expect.soft(await episode.isVisible()).toBe(true);

    const episodeNumber = await episode.locator(".bsx .bt .epx");
    expect.soft(await episodeNumber.isVisible()).toBe(true);
    console.log(`Episode: `, await episodeNumber.textContent());

    const episodeTitle = await episode.locator(".tt");
    expect.soft(await episodeTitle.isVisible()).toBe(true);
    console.log(`Episode Title: `, await episodeTitle.textContent());

    const episodeReleaseTime = await episode.locator(".timeago");
    expect.soft(await episodeReleaseTime.isVisible()).toBe(true);
    console.log(
      `Episode Release Time: `,
      await episodeReleaseTime.textContent(),
    );

    if (i < numberOfEpisodes - 1) {
      console.log(
        `Previous Episode Release Time: `,
        await homePage.latestReleaseEpisodes()
          .nth(i + 1)
          .locator(".timeago")
          .textContent(),
      );
      const prevEpisodeReleaseTime = parseTimeAgo(
        (await homePage.latestReleaseEpisodes()
          .nth(i + 1)
          .locator(".timeago")
          .textContent()) ?? "",
      );
      const currentEpisodeReleaseTime = parseTimeAgo(
        (await episodeReleaseTime.textContent()) ?? "",
      );
      console.log(`Previous Episode Release Time: `, prevEpisodeReleaseTime);
      console.log(`Current Episode Release Time: `, currentEpisodeReleaseTime);
      await expect
        .soft(
          prevEpisodeReleaseTime?.isBefore(
            currentEpisodeReleaseTime ?? new Date(),
          ),
        )
        .toBe(true);
    }
  }
});

test("MAS-47 Card Click and Episode Navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Latest Release")).toBeVisible();

  const homePage = new HomePage(page);
  const numberOfEpisodes = await homePage.latestReleaseEpisodes().count();
  console.log(`Number of latest episodes: ${numberOfEpisodes}`);

  const randomCardIndex = Math.floor(Math.random() * numberOfEpisodes);
  console.log(`Randomly selected card index: ${randomCardIndex}`);

  const episode = homePage.latestReleaseEpisodes().nth(randomCardIndex);

  const episodeLink = await episode.locator(`.bsx a`).getAttribute("href");
  console.log(`Episode link: ${episodeLink}`);

  await Promise.all([episode.click(), page.waitForLoadState("networkidle")]);

  await expect(page).toHaveURL(episodeLink ?? "");
  console.log(`Navigated to episode page: ${page.url()}`);
});

test('MAS-48 VIEW ALL Navigation', async ({ page }) => {
  await page.goto('/');
  const viewAllButton = await page.getByRole('link', { name: 'VIEW ALL' })
  const href = await viewAllButton.getAttribute('href')
  console.log('VIEW ALL button href:', href)
  
  await Promise.all([
    viewAllButton.click(),
    await page.waitForLoadState('networkidle'),
  ])
  await expect(page).toHaveURL(href ?? '')
  console.log('Navigated to VIEW ALL page:', page.url())

  await expect(page.getByText('Series Lists')).toBeVisible()
  
await expect(page.locator('button:has-text("Search")')).toBeVisible();

})

test(
  "MAS-49 Responsive Grid Layout for Latest Release section",
  {
    tag: "@manual",
  },
  async ({ page }) => {
    const viewports = [
      { name: "Desktop", width: 1280, height: 720 },
      { name: "Tablet", width: 768, height: 1024 },
      { name: "Mobile", width: 375, height: 667 },
    ];

    await page.goto("/");

    const latestReleaseSection = page.getByText("Latest Release");
    const cardGrid = await page.locator(".excstf article.bs");
    const nextPaginationBtn = page.getByRole("link", { name: "Next " });

    for (const vp of viewports) {
      await test.step(`Verify Latest Release grid on ${vp.name} (${vp.width}x${vp.height})`, async () => {
        // 2. Resize browser viewport dynamically
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.waitForTimeout(500); // Allow layout reflow to settle

        // 3. Verify section and pagination controls are visible
        await expect(latestReleaseSection).toBeVisible();
        await expect(nextPaginationBtn).toBeVisible();

        // 4. Assert cards wrap and maintain visibility
        const cardCount = await cardGrid.count();
        expect(cardCount).toBeGreaterThan(0);

        const firstCard = cardGrid.first();

        // Verify metadata badges (e.g., "TV Show", "Ep 11") and title labels remain visible
        if (await firstCard.isVisible()) {
          const badge = firstCard.locator(".badge, .status");
          const title = firstCard.locator("h5, .title");

          await expect(badge).toBeVisible();
          await expect(title).toBeVisible();

          const img = firstCard.locator("img");
          const imgBox = await img.boundingBox();
          expect(imgBox?.height).toBeGreaterThan(0);
          expect(imgBox?.width).toBeGreaterThan(0);
        }

        // Verify thumbnail imagery maintains positive aspect ratio without collapsing
        const thumbnailImg = firstCard.locator("img");
        await expect(thumbnailImg).toBeVisible();
        const imgBox = await thumbnailImg.boundingBox();
        expect(imgBox?.width).toBeGreaterThan(0);
        expect(imgBox?.height).toBeGreaterThan(0);

        // 5. Visual Regression Baseline Check (Optional)
        await latestReleaseSection.screenshot({
          path: `latest-release-${vp.name.toLowerCase()}.png`,
        });
      });
    }
  },
);

test(
  "MAS-52 Responsive Layout for Trending section",
  {
    tag: "@manual",
  },
  async ({ page }) => {
    const viewports = [
      { name: "Tablet", width: 768, height: 1024 },
      { name: "Mobile", width: 375, height: 667 },
    ];

    await page.goto("/");
    for (const vp of viewports) {
      await test.step(`Verify Latest Release grid on ${vp.name} (${vp.width}x${vp.height})`, async () => {

        // 2. Resize browser viewport dynamically
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.waitForTimeout(500);

        await expect(page.getByText("Miruro Trending This Week")).toBeDisabled();

        const homePage = new HomePage(page);
        const trendingAnimeTitle = await homePage.trendingAnimeTitle();
        console.log(
          "Trending Anime Title: ",
          await trendingAnimeTitle.textContent(),
        );
        await expect(trendingAnimeTitle).toBeDisabled();

        const trendingAnimeImage = await homePage.trendingAnimeImage();
        await expect(trendingAnimeImage).toBeDisabled();
      });
    }
  },
);
