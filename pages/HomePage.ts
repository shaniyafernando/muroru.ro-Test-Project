import { Page } from "@playwright/test";

export default class HomePage {
  constructor(private page: Page) {}

  trendingAnimeTitle(){
    return this.page.locator(
      '//*[@id="content"]/div/div[1]/div[1]/div[2]/div/a/div[2]/div/span[2]/b'
    );
  }

  trendingAnimeImage() {
    return this.page.locator(
      '//*[@id="content"]/div/div[1]/div[1]/div[2]/div/a/div[3]/div'
    );
  }

  trendingAnimeLink(){
    return this.page.locator(
      '//*[@id="content"]/div/div[1]/div[1]/div[2]/div/a'
    );
  }

  recommendedGenreTabs(){
    return this.page.locator('.nav-tabs li, [role="tab"]');
  }

  recommendedGenreEpisodes(){
    return this.page.locator(".recommendation-grid a, article a")
  }

  latestReleaseEpisodes(){
    return this.page.locator(".excstf article.bs")
  }




}
