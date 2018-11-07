import _ from 'lodash';

const getArticleDescription = (target, state) => {
  const { feedName } = target.dataset;
  const articleLink = target.dataset.itemLink;
  const actualFeed = _.find(state.responses, { title: feedName });
  const { description } = _.find(actualFeed.items, { link: articleLink });
  return description;
};

export default getArticleDescription;
