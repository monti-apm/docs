---
layout: docs.njk
title: Knowledge Base
--- 

 You can view the <span id="knowledge-articles-text">articles</span> from the Kadira knowledge base at
    <a id="knowledge-articles-link" href="https://web.archive.org/web/20141010211051/http://support.kadira.io/knowledgebase">archive.org</a>

<script>
  var knowledgeArticlesText = document.getElementById('knowledge-articles-text');
  var knowledgeArticlesLink = document.getElementById('knowledge-articles-link');

  var queryString = window.location.search;
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }

  if ('article' in query) {
    knowledgeArticlesText.innerText = 'article';
    knowledgeArticlesLink.href = 'https://web.archive.org/web/20161228110403/http://support.kadira.io/knowledgebase/articles/' + query.article;
  }
</script>
