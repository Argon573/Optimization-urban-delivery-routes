const GEO_CONSENT_KEY = 'geo_consent';

export function getGeoConsent() {
    return localStorage.getItem(GEO_CONSENT_KEY);
}

export function setGeoConsent(value) {
    localStorage.setItem(GEO_CONSENT_KEY, value);
}

export function shouldShowGeoPrompt() {
    return !getGeoConsent();
}
