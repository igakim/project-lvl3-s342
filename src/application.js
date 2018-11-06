import axios from 'axios';
import WatchJS from 'melanke-watchjs';
import validator from 'validator';

const { watch } = WatchJS;

export default () => {
  const state = {
    validate: {
      valid: true,
      submitDisabled: true,
      hasFeed: false,
    },
    feeds: [],
  };

  const input = document.querySelector('#search-field');
  const submitButton = document.querySelector('button[type=submit]');
  const rssContainer = document.querySelector('.rss-feed');

  submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    state.feeds.push(input.value);
    input.value = '';
    state.validate.valid = true;
    state.validate.submitDisabled = true;
    state.validate.hasFeed = false;
  });

  input.addEventListener('input', () => {
    if (input.value === '') {
      state.validate.valid = true;
      state.validate.submitDisabled = true;
      state.validate.hasFeed = false;
    } else if (validator.isURL(input.value)) {
      state.validate.valid = true;
      state.validate.submitDisabled = false;
      state.validate.hasFeed = state.feeds.includes(input.value);
    } else {
      state.validate.valid = false;
      state.validate.submitDisabled = true;
      state.validate.hasFeed = false;
    }
  });

  watch(state, 'validate', () => {
    if (state.validate.valid && state.validate.submitDisabled) { // Empty input
      input.classList.remove('is-valid');
      input.classList.remove('is-invalid');
      submitButton.setAttribute('disabled', 'disabled');
    } else if (state.validate.hasFeed || !state.validate.valid) { // invalid input
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      submitButton.classList.add('disabled');
      submitButton.setAttribute('disabled', 'disabled');
    } else { // valid form
      input.classList.add('is-valid');
      input.classList.remove('is-invalid');
      submitButton.classList.remove('disabled');
      submitButton.removeAttribute('disabled');
    }
  });

  const parser = new DOMParser();
  const proxy = 'https://cors.io/?';
  const errorContainer = document.querySelector('.error');
  const loader = document.querySelector('.loader');

  watch(state, 'feeds', () => {
    errorContainer.innerHTML = '';

    loader.classList.remove('loaded');

    axios.get(`${proxy}${state.feeds[state.feeds.length - 1]}`)
      .then((res) => {
        loader.classList.add('loaded');
        const doc = parser.parseFromString(res.data, 'application/xml');
        const title = doc.querySelector('title').textContent;
        const description = doc.querySelector('description').textContent;
        const items = [...doc.getElementsByTagName('item')];
        const html = `
          <h2 class="text-center">${title}</h2>
          <p class="text-center">${description}</p>
          <ul>
            ${items.map(el => `
              <li>
                <a href="${el.querySelector('link').textContent}">
                  ${el.querySelector('title').textContent}
                </a>
              </li>`).join('')}
          </ul>
        `;
        rssContainer.innerHTML = `${html}${rssContainer.innerHTML}`;
      })
      .catch((error) => {
        loader.classList.add('loaded');
        if (error.response) {
          errorContainer.innerHTML = `
            <p>Couldn't load RSS feed!</p>
            <p>${error.response.status} ${error.response.statusText}</p>
          `;
        } else if (error.request) {
          errorContainer.innerHTML = `
            <p>Couldn't load RSS feed!</p>
            <p>The request was made but no response was received</p>
          `;
        } else {
          errorContainer.innerHTML = `
            <p>Couldn't load RSS feed!</p>
            <p>Something happened in setting up the request that triggered an Error</p>
          `;
        }
      });
  });
};
