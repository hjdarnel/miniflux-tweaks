// ==UserScript==
// @name         Miniflux Tweaks
// @namespace    https://github.com/hjdarnel/miniflux-tweaks
// @version      1.0.3
// @description  Utilities for Miniflux feed reader, including toggleable sort direction on list views.
// @match        *://*/unread*
// @match        *://*/settings
// @match        *://*/starred*
// @match        *://*/history*
// @match        *://*/feed/*/entries*
// @match        *://*/category/*/entries*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @icon         https://raw.githubusercontent.com/miniflux/logo/master/original/icon-128.png
// @downloadURL  https://raw.githubusercontent.com/hjdarnel/miniflux-tweaks/main/miniflux-tweaks.user.js
// @updateURL    https://raw.githubusercontent.com/hjdarnel/miniflux-tweaks/main/miniflux-tweaks.user.js
// ==/UserScript==

(function () {
  'use strict';

  // --- Constants ---
  const STORAGE_KEYS = {
    domain: 'domain',
    token: 'apiToken'
  };

  // --- Storage Helpers (GM_ APIs for cross-origin persistence) ---
  function getStoredValue(key, defaultValue = '') {
    return GM_getValue(STORAGE_KEYS[key] ?? key, defaultValue);
  }

  function setStoredValue(key, value) {
    GM_setValue(STORAGE_KEYS[key] ?? key, value);
  }

  function deleteStoredValue(key) {
    GM_deleteValue(STORAGE_KEYS[key] ?? key);
  }

  // --- Domain Check ---
  function checkDomain() {
    const savedDomain = getStoredValue('domain');

    if (!savedDomain) {
      if (
        confirm(
          'Configure Miniflux Tweaks?\n\nClick OK if this is your Miniflux instance.'
        )
      ) {
        setStoredValue('domain', location.origin);
        location.reload();
      }
      return false;
    }

    if (location.origin !== savedDomain) {
      return false;
    }

    return true;
  }

  // --- API Helpers ---
  function getHeaders() {
    const token = getStoredValue('token');
    return {
      'X-Auth-Token': token,
      'Content-Type': 'application/json'
    };
  }

  async function getMe() {
    const token = getStoredValue('token');
    if (!token) return null;

    try {
      const response = await fetch('/v1/me', { headers: getHeaders() });
      if (!response.ok) {
        console.error('[Miniflux Tweaks] GET /v1/me failed:', response.status);
        return null;
      }
      return await response.json();
    } catch (err) {
      console.error('[Miniflux Tweaks] GET /v1/me error:', err);
      return null;
    }
  }

  async function updateUser(id, data) {
    try {
      const response = await fetch(`/v1/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        console.error(
          '[Miniflux Tweaks] PUT /v1/users failed:',
          response.status
        );
        return null;
      }
      return await response.json();
    } catch (err) {
      console.error('[Miniflux Tweaks] PUT /v1/users error:', err);
      return null;
    }
  }

  // --- DOM Helpers ---
  function el(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        element[key] = value;
      }
    }
    for (const child of children) {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child) {
        element.appendChild(child);
      }
    }
    return element;
  }

  // --- Settings Page ---
  function injectSettingsUI() {
    const form = document.querySelector('main form');
    if (!form) return;

    const savedToken = getStoredValue('token');
    const savedDomain = getStoredValue('domain');

    const statusSpan = el('span', {
      id: 'mft-save-status',
      style: { marginLeft: '1em' }
    });

    const tokenInput = el('input', {
      type: 'password',
      id: 'mft-api-token',
      value: savedToken,
      placeholder: 'Paste your API token',
      style: { width: '100%', maxWidth: '400px' }
    });

    const saveButton = el(
      'button',
      {
        type: 'button',
        id: 'mft-save-token',
        className: 'button button-primary',
        onClick: () => {
          setStoredValue('token', tokenInput.value);
          statusSpan.textContent = 'Saved!';
          statusSpan.style.color = 'green';
          setTimeout(() => {
            statusSpan.textContent = '';
          }, 2000);
        }
      },
      ['Update']
    );

    const resetButton = el(
      'button',
      {
        type: 'button',
        id: 'mft-reset-domain',
        className: 'button button-primary',
        onClick: () => {
          if (
            confirm(
              'Reset domain configuration?\n\nYou will be prompted to reconfigure on next page load.'
            )
          ) {
            deleteStoredValue('domain');
            location.reload();
          }
        }
      },
      ['Reset Domain']
    );

    const fieldset = el('fieldset', { id: 'miniflux-tweaks-config' }, [
      el('legend', {}, ['Miniflux Tweaks']),
      el('div', { className: 'form-label-row' }, [
        el('label', { htmlFor: 'mft-api-token' }, ['API Token'])
      ]),
      tokenInput,
      el('p', { className: 'form-help' }, [
        'Generate at Settings → API Keys ',
        (() => {
          const link = el('a', {
            href: '/keys',
            target: '_blank'
          });
          const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
          );
          svg.setAttribute('class', 'icon');
          svg.setAttribute('aria-hidden', 'true');
          const use = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use'
          );
          use.setAttribute('href', '/icon/sprite.svg#icon-external-link');
          svg.appendChild(use);
          link.appendChild(svg);
          return link;
        })()
      ]),
      el('div', { style: { marginTop: '0.5em' } }, [saveButton, statusSpan]),
      el('hr', {
        style: {
          margin: '1em 0',
          border: 'none',
          borderTop: '1px solid var(--hr-border-color, #ddd)'
        }
      }),
      el('div', {}, [
        resetButton,
        el('small', { style: { marginLeft: '1em' } }, [
          'Currently: ' + savedDomain
        ])
      ])
    ]);

    form.appendChild(fieldset);
  }

  // --- Sort Dropdown ---
  async function injectSortDropdown() {
    const paginationNext = document.querySelector('.pagination-next');
    if (!paginationNext) return;

    const token = getStoredValue('token');

    const select = el(
      'select',
      {
        id: 'mft-sort-direction'
      },
      [
        el('option', { value: 'desc' }, ['↓ Newest']),
        el('option', { value: 'asc' }, ['↑ Oldest'])
      ]
    );
    select.style.cssText =
      'margin: 0 15px 0 0 !important; padding: 1px 4px; font-size: 0.85em; color: #777; border: 1px solid #ccc; border-radius: 3px; background: transparent;';

    // Insert at start of pagination-next
    paginationNext.insertBefore(select, paginationNext.firstChild);

    // Check for token
    if (!token) {
      select.disabled = true;
      select.title = 'Set API token in Settings → Miniflux Tweaks';
      return;
    }

    // Fetch current setting
    const user = await getMe();
    if (!user) {
      select.disabled = true;
      select.title = 'Failed to fetch user settings - check API token';
      return;
    }

    // Settings configured correctly - make dropdown black
    select.style.color = '#000';
    select.style.removeProperty('border');

    // Set current value
    select.value = user.entry_sorting_direction || 'desc';
    const originalValue = select.value;

    // Handle change
    select.addEventListener('change', async () => {
      const newValue = select.value;
      select.disabled = true;

      const result = await updateUser(user.id, {
        entry_sorting_direction: newValue
      });

      if (result) {
        location.reload();
      } else {
        // Revert on failure
        select.value = originalValue;
        select.disabled = false;
        alert('Failed to update sort order. Check console for details.');
      }
    });
  }

  // --- Init ---
  function init() {
    if (!checkDomain()) return;

    if (location.pathname === '/settings') {
      injectSettingsUI();
    }

    if (document.querySelector('.pagination-next')) {
      injectSortDropdown();
    }
  }

  init();
})();
