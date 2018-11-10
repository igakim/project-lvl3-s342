import axios from 'axios';
import WatchJS from 'melanke-watchjs';
import validator from 'validator';
import $ from 'jquery';
import _ from 'lodash';
import parse from './parse';
import { getArticleDescription, getError } from './util';

const { watch } = WatchJS;

export default () => {
  const state = {
    validate: {
      valid: true,
      submitDisabled: true,
      hasFeed: false,
    },
    responses: [],
    error: {
      title: null,
      errorDescription: null,
    },
    feeds: [],
    wrongFeeds: [],
    refreshFeed: false,
    modal: {
      description: null,
      link: null,
    },
    loader: {
      loaded: true,
    },
  };

  const input = document.querySelector('#search-field');
  const submitButton = document.querySelector('button[type=submit]');
  const rssContainer = document.querySelector('.rss-feeds-container');
  const proxy = 'https://cors.io/?';
  const errorContainer = document.querySelector('.error');
  const loader = document.querySelector('.loader');
  const modalBody = document.querySelector('.modal-body');
  const modalFooter = document.querySelector('.modal-footer');

  const timer = () => {
    const promises = state.feeds.map((address) => {
      return axios.get(`${proxy}${address}`);
    });
    Promise.all(promises).then((responses) => {
      responses.forEach((res) => {
        const { title, items } = parse(res.data);
        const actualFeedIndex = state.responses.findIndex(el => el.title === title);
        const oldItems = state.responses[actualFeedIndex].items;
        const newItems = _.unionWith(oldItems, items, _.isEqual);
        if (!_.isEqualWith(newItems, oldItems, (e1, e2) => _.isEqual(e1, e2))) {
          state.responses[actualFeedIndex].items = newItems;
        }
      });
      setTimeout(timer, 5000);
    });
  };

  submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    state.validate.valid = true;
    state.validate.submitDisabled = true;
    state.validate.hasFeed = false;
    state.loader.loaded = false;

    axios.get(`${proxy}${input.value}`)
      .then((response) => {
        state.feeds.push(input.value);
        state.refreshFeed = true;
        state.responses.push(parse(response.data));
        state.loader.loaded = true;
      })
      .catch((err) => {
        state.wrongFeeds.push(input.value);
        state.error = getError(err);
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
      state.validate.hasFeed = state.feeds.includes(input.value)
                                 || state.wrongFeeds.includes(input.value);
    } else {
      state.validate.valid = false;
      state.validate.submitDisabled = true;
      state.validate.hasFeed = false;
    }
  });

  $('.rss-feeds-container').on('click', 'button.btn-primary', (e) => {
    state.modal.description = getArticleDescription(e.target, state);
    state.modal.link = e.target.dataset.itemLink;
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

  watch(state, 'responses', (prop) => {
    // Эта проверка очень хрупкая? Или ОК?
    // Пока ничего лучше не придумал.
    if (prop !== 'items') {
      input.value = '';
      errorContainer.innerHTML = '';
    }
    rssContainer.innerHTML = '';
    state.responses.forEach((rss) => {
      const div = document.createElement('div');
      div.classList.add('rss-feed');
      const html = `
        <h2 class="text-center">${rss.title}</h2>
        <p class="text-center">${rss.chanelDescription}</p>
        <ul class="list-group list-group-flush">
          ${rss.items.map(el => `
            <li class="list-group-item">
              <a href="${el.link}" target="_blank">
                ${el.title}
              </a>
              <button class="btn btn-primary float-right" data-toggle="modal" data-target="#exampleModal" data-feed-name="${rss.title}" data-item-link="${el.link}">
                Description
              </button>
            </li>
          `).join('')}
        <ul>
      `;
      div.innerHTML = html;
      rssContainer.prepend(div);
    });
  });

  watch(state, 'refreshFeed', () => {
    timer();
  });

  watch(state, 'error', () => {
    errorContainer.innerHTML = `
      <p>${state.error.title}</p>
      <p>${state.error.errorDescription}</p>
    `;
  });

  watch(state, 'modal', () => {
    modalBody.innerHTML = state.modal.description;
    const linkElement = `<a href="${state.modal.link}" class="btn btn-primary" target="_blank">Читать на сайте</a>`;
    modalFooter.innerHTML = linkElement;
  });

  watch(state, 'loader', () => {
    if (state.loader.loaded) {
      loader.classList.add('loaded');
    } else {
      loader.classList.remove('loaded');
    }
  });
};
