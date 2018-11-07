export default (data, err) => {
  if (data) {
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
  }
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
}