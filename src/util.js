
export const getArticleDescription = (target, state) => {
  const { feedName } = target.dataset;
  const articleLink = target.dataset.itemLink;
  const actualFeed = state.feeds.find(e => e.title === feedName);
  const { description } = actualFeed.items.find(e => e.link === articleLink);
  return description;
};

export const getError = (err) => {
  let errorDescription = '';
  if (err.response) {
    errorDescription = `${err.response.status} ${err.response.statusText}`;
  } else if (err.request) {
    errorDescription = 'The request was made but no response was received';
  } else {
    errorDescription = 'Something happened in setting up the request that triggered an Error';
  }
  return {
    title: 'Couldn\'t load RSS feed!',
    errorDescription,
  };
};
