---
layout: docs.njk
title: Academy
--- 

 You can view the <span id="academy-articles-text">articles</span> from the Kadira Academy at
    <a id="academy-articles-link" href="https://web.archive.org/web/20170518115618/https:/old.kadira.io/academy/meteor-performance-101">archive.org</a>.

Please note that when you click on a link, you will need to reload the page to view the new page.

<script>
  var academyArticlesText = document.getElementById('academy-articles-text');
  var academyArticlesLink = document.getElementById('academy-articles-link');

  var queryString = window.location.search;
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }

  if ('article' in query) {
    academyArticlesText.innerText = 'article';
    academyArticlesLink.href = 'https://web.archive.org/web/20170518115618/https:/old.kadira.io/academy/meteor-performance-101/content/' + query.article;
  }
</script>
