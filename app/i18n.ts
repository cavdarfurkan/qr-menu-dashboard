import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enMenu from "./locales/en/menu.json";
import enContent from "./locales/en/content.json";
import enError from "./locales/en/error.json";
import enHome from "./locales/en/home.json";
import enSidebar from "./locales/en/sidebar.json";
import enValidation from "./locales/en/validation.json";
import enTheme from "./locales/en/theme.json";
import enSettings from "./locales/en/settings.json";

import trCommon from "./locales/tr/common.json";
import trAuth from "./locales/tr/auth.json";
import trMenu from "./locales/tr/menu.json";
import trContent from "./locales/tr/content.json";
import trError from "./locales/tr/error.json";
import trHome from "./locales/tr/home.json";
import trSidebar from "./locales/tr/sidebar.json";
import trValidation from "./locales/tr/validation.json";
import trTheme from "./locales/tr/theme.json";
import trSettings from "./locales/tr/settings.json";

import plCommon from "./locales/pl/common.json";
import plAuth from "./locales/pl/auth.json";
import plMenu from "./locales/pl/menu.json";
import plContent from "./locales/pl/content.json";
import plError from "./locales/pl/error.json";
import plHome from "./locales/pl/home.json";
import plSidebar from "./locales/pl/sidebar.json";
import plValidation from "./locales/pl/validation.json";
import plTheme from "./locales/pl/theme.json";
import plSettings from "./locales/pl/settings.json";

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		// lng: "tr",
		fallbackLng: "en",
		debug: true,
		interpolation: {
			escapeValue: false,
		},
		resources: {
			en: {
				common: enCommon,
				auth: enAuth,
				menu: enMenu,
				content: enContent,
				error: enError,
				home: enHome,
				sidebar: enSidebar,
				validation: enValidation,
				theme: enTheme,
				settings: enSettings,
			},
			tr: {
				common: trCommon,
				auth: trAuth,
				menu: trMenu,
				content: trContent,
				error: trError,
				home: trHome,
				sidebar: trSidebar,
				validation: trValidation,
				theme: trTheme,
				settings: trSettings,
			},
			pl: {
				common: plCommon,
				auth: plAuth,
				menu: plMenu,
				content: plContent,
				error: plError,
				home: plHome,
				sidebar: plSidebar,
				validation: plValidation,
				theme: plTheme,
				settings: plSettings,
			},
		},
	});

export default i18n;
