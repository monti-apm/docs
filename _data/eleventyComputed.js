module.exports = {
  progression(data) {
    if (!data.page.url) {
      return;
    }

    let url = data.page.url.slice(0, -1);
    let menu = data.menu;

    // Pages without headers
    let pages = menu.pages.filter((page) => !!page[1]);

    let currentIndex = pages.findIndex((p) => {
      return p[1] === url;
    });

    return {
      prev: pages[currentIndex - 1],
      next: pages[currentIndex + 1],
    };
  },
};
