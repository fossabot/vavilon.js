import {Locale} from "./locale";
import {Vavilon} from "./vavilon";

declare global {
    interface Window {
        // IE navigator language settings (non-standard)
        userLanguage: string;
        browserLanguage: string;

        /**
         * Changes the page language
         *
         * The execution of this method will change the {@link Vavilon.pageLocale}
         * of the vavilon instance, save the selected locale to cookie and replace
         * the text of all the vavilon-enabled elements on the page.
         *
         * @param localeString - the locale to switch to
         */
        setLang(localeString: Locale): void;
    }
}


/**
 * Core vavilon object instance
 *
 * This object stores the data about the page, where vavilon is executed
 */
const vavilon: Vavilon = new Vavilon();

/**
 * Indicates whether the whole page has been loaded
 */
let pageLoaded = false;

vavilon.addDicts();
vavilon.loadDicts((): void => {
    if (pageLoaded) {
        vavilon.replace();
    }
});

window.onload = function (): void {
    vavilon.find();
    pageLoaded = true;

    if (vavilon.pageDictLoaded) {
        vavilon.replace();
    }
};

/**
 * Changes the page language
 *
 * The execution of this method will change the {@link Vavilon.pageLocale}
 * of the vavilon instance, save the selected locale to cookie and replace
 * the text of all the vavilon-enabled elements on the page.
 *
 * @param localeString - the locale to switch to
 */
window.setLang = function (localeString: Locale): void {
    localeString = localeString.toLowerCase();

    const changeSuccessful: boolean = vavilon.setLocale(localeString);

    if (changeSuccessful) {
        vavilon.replace();
    }
};
