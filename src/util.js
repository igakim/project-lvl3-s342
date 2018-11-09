
const getArticleDescription = (target, state) => {
  const { feedName } = target.dataset;
  const articleLink = target.dataset.itemLink;
  const actualFeed = state.responses.find(e => e.title === feedName);
  const { description } = actualFeed.items.find(e => e.link === articleLink);
  return description;
};

export default getArticleDescription;
