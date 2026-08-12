/* import Cookies from 'js-cookie';

export const setCookie = (key, value) => {
  if (process.browser) {
    Cookies.set(key, value, { expires: 1 });
  }
};

export const removeCookie = (key) => {
  if (process.browser) {
    Cookies.remove(key);
  }
};

export const getCookie = (key, req) => {
  return process.browser
    ? Cookies.get(key)
    : cookie.parse(req.headers.cookie || '')[key];
};
 */

import Cookies from 'js-cookie';

export const setCookie = (name, value, days) => {
  if (days) {
    Cookies.set(name, value, { expires: days });
  } else {
    Cookies.set(name, value);
  }
};

export const getCookie = (name) => {
  return Cookies.get(name);
};

export const removeCookie = (name) => {
  Cookies.remove(name);
};
