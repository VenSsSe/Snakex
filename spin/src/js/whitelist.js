export const ALLOWED_DOMAINS = [
    'wishsimulator.app',
    'hsr.wishsimulator.app',
];

export const DOMAIN_ICONS = ALLOWED_DOMAINS.reduce((acc, domain) => {
    acc[domain] = `https://${domain}/favicon.ico`;
    return acc;
}, {});
