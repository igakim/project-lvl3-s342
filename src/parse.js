export default (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');
  const items = [...doc.getElementsByTagName('item')];
  const mappedItems = items.map((el) => {
    const newItem = {
      title: el.querySelector('title').textContent,
      link: el.querySelector('link').textContent,
      description: el.querySelector('description').textContent,
    };
    return newItem;
  });
  return {
    title: doc.querySelector('title').textContent,
    chanelDescription: doc.querySelector('description').textContent,
    items: mappedItems,
  };
};
