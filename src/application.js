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
    response: {
      title: null,
      description: null,
      items: [],
      hasError: false,
      errors: [],
    },
    feeds: [],
    loader: {
      loaded: true,
    },
  };

  const input = document.querySelector('#search-field');
  const submitButton = document.querySelector('button[type=submit]');
  const rssContainer = document.querySelector('.rss-feed');
  const parser = new DOMParser();
  const proxy = 'https://cors.io/?';
  const errorContainer = document.querySelector('.error');
  const loader = document.querySelector('.loader');

  submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    state.feeds.push(input.value);
    state.validate.valid = true;
    state.validate.submitDisabled = true;
    state.validate.hasFeed = false;
    state.loader.loaded = false;

    axios.get(`${proxy}${state.feeds[state.feeds.length - 1]}`)
      .then((res) => {
        const doc = parser.parseFromString(res.data, 'application/xml');
        state.response = {
          title: doc.querySelector('title').textContent,
          description: doc.querySelector('description').textContent,
          items: [...doc.getElementsByTagName('item')],
          hasError: false,
          errors: state.response.errors,
        };
        state.loader.loaded = true;
      })
      .catch((error) => {
        let description = '';
        if (error.response) {
          description = `${error.response.status} ${error.response.statusText}`;
        } else if (error.request) {
          description = 'The request was made but no response was received';
        } else {
          description = 'Something happened in setting up the request that triggered an Error';
        }
        state.response = {
          title: 'Couldn\'t load RSS feed!',
          description,
          items: state.response.items,
          hasError: true,
          errors: state.response.errors.concat(error),
        };
        state.loader.loaded = true;
      });
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

  watch(state, 'response', () => {
    if (state.response.hasError) {
      errorContainer.innerHTML = `
        <p>${state.response.title}</p>
        <p>${state.response.description}</p>
      `;
      return;
    }
    errorContainer.innerHTML = '';
    input.value = '';
    const html = `
      <h2 class="text-center">${state.response.title}</h2>
      <p class="text-center">${state.response.description}</p>
      <ul>
        ${state.response.items.map(el => `
          <li>
            <a href="${el.querySelector('link').textContent}">
              ${el.querySelector('title').textContent}
            </a>
          </li>`).join('')}
      </ul>
    `;
    rssContainer.innerHTML = `${html}${rssContainer.innerHTML}`;
  });

  watch(state, 'loader', () => {
    if (state.loader.loaded) {
      loader.classList.add('loaded');
    } else {
      loader.classList.remove('loaded');
    }
  });
};
