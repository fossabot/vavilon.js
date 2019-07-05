import { getLocaleCookie, setLocaleCookie } from './cookie';
import { getJson } from './http';

/* ================================= LOCALE ================================= */

/**
 * Returns the user preferred {@link Locale}
 *
 * The locale is based on the value of `vavilon-locale` cookie. If the cookie
 * is not present, the browser language is used instead.
 *
 * @returns {Locale} the user-preferred locale
 */
function getUserLocale () {
    vavilon.userLocale = (getLocaleCookie() || navigator.language || navigator.userLanguage || navigator.browserLanguage).toLowerCase();
    console.debug('Locale set to', vavilon.userLocale);
}

/**
 * Returns the {@link Locale} of the page
 *
 * @returns {Locale} the locale of the page
 */
function getPageLocale () {
    return document.documentElement.lang.toLowerCase();
}

/**
 * Changes the locale on the page
 *
 * This results in complete translation of all vavilon-enabled elements
 *
 * @param localeString {Locale}
 *        the locale to change to
 */
function changeLocale (localeString) {
    localeString = localeString.toLowerCase();

    if (vavilon.dictionaries[localeString]) {
        vavilon.useDict = localeString;
    } else {
        const lang = localeString.slice(0, 2);

        if (vavilon.dictionaries[lang]) {
            vavilon.useDict = lang;
        } else {
            console.error('No dictionary for', localeString);
            return;
        }
    }

    replaceAllElements();
    setLocaleCookie(vavilon.useDict);
}

/* ============================== DICTIONARIES ============================== */

/**
 * Returns the dictionaries with urls but with no data loaded
 *
 * @returns {Object<string, Dictionary>}
 *          object, where the keys are dictionary locales and the values are
 *          {@link Dictionary}s with no strings
 */
async function getDictionaries () {
    const dictionaries = {};
    const vavilonDictScripts = Array.from(document.scripts).filter((e) => e.dataset.vavilonDict);

    for (const s of vavilonDictScripts) {
        const dictLocale = s.dataset.vavilonDict.toLowerCase();

        /**
         * @type {Dictionary}
         */
        const dictionary = {
            url: s.src,
            strings: {}
        };

        if (dictLocale === vavilon.userLocale || (dictLocale.slice(0, 2) === vavilon.userLocale.slice(0, 2) && !vavilon.useDict)) {
            vavilon.useDict = dictLocale;
            dictionary.strings = await getJson(s.src);
        } else {
            dictionary.strings = getJson(s.src);
        }

        dictionaries[dictLocale] = dictionary;
    }

    return dictionaries;
}

/* ============================= ELEMENTS =================================== */

/**
 * Finds all vavilon-enabled elements on the page and stores them inside
 * {@link Vavilon} object
 */
function findAllElements () {
    vavilon.elements = document.getElementsByClassName('vavilon');
}

/**
 * Replaces all elements' texts with strings provided in the dictionary
 */
function replaceAllElements () {
    if (vavilon.elements && vavilon.useDict) {
        if (!vavilon.dictionaries[vavilon.pageLocale]) {
            vavilon.dictionaries[vavilon.pageLocale] = {
                url: null,
                strings: {}
            };
        }
        for (const el of vavilon.elements) {
            if (vavilon.dictionaries[vavilon.useDict][el.dataset.vavilon]) {
                if (!vavilon.dictionaries[vavilon.pageLocale].strings[el.dataset.vavilon]) {
                    vavilon.dictionaries[vavilon.pageLocale].strings[el.dataset.vavilon] = el.innerText;
                }
                el.innerText = vavilon.dictionaries[vavilon.useDict][el.dataset.vavilon];
            } else {
                console.warn(`${el.dataset.vavilon} not in dictionary`);
            }
        }
    }
}

/* =============================== CORE ===================================== */

/**
 * Core vavilon object instance
 *
 * This object stores the data about the page, where vavilon is executed.
 *
 * @type {Vavilon}
 */
const vavilon = {
    userLocale: getUserLocale(),
    pageLocale: getPageLocale(),
    dictionaries: {}
};

getDictionaries();

window.onload = function () {
    console.debug('Vavilon: ', vavilon);

    findAllElements();

    if (vavilon.useDict) {
        replaceAllElements();
    }

    window.changeLocale = changeLocale;
};
