// Language auto-translation logic for Google Translate
const sourceLang = "en"; // Page default language
const browserLang = navigator.language ? navigator.language.slice(0, 2) : "en";

const targetLang = browserLang !== sourceLang ? browserLang : null;

if (targetLang) {
  document.cookie = `googtrans=/${sourceLang}/${targetLang}; path=/;`;
}

function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: sourceLang,
      includedLanguages:
        "en,es,fr,de,ja,pt,it,zh-CN,zh-TW,ar,ru,ko,hi,id,pl,nl,sv,th,iw,vi,cs,uk,ro,el,tr",
      autoDisplay: false,
    },
    "google_translate_element"
  );
}