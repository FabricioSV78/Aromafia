export interface ContactLink {
  readonly label: string;
  readonly href: string;
}

interface ContactConfiguration {
  readonly whatsapp: ContactLink & {
    readonly countryCallingCode: string;
    readonly nationalNumber: string;
    readonly internationalNumber: string;
    readonly displayNumber: string;
  };
  readonly instagram: ContactLink & { readonly handle: string };
  readonly facebook: ContactLink;
  readonly tiktok: ContactLink;
}

// Number supplied by the user. Peru's +51 prefix follows the confirmed brand context.
const nationalNumber = '955565209';
const countryCallingCode = '51';
const internationalNumber = `${countryCallingCode}${nationalNumber}`;
const instagramHandle = '@aromafia.pe';

/** Public configuration only. Ownership and WhatsApp reception have not been checked. */
export const contact = {
  whatsapp: {
    label: 'WhatsApp',
    countryCallingCode,
    nationalNumber,
    internationalNumber,
    displayNumber: `+${countryCallingCode} ${nationalNumber}`,
    href: `https://wa.me/${internationalNumber}`,
  },
  instagram: {
    label: 'Instagram',
    handle: instagramHandle,
    // Profile URL derived from the handle supplied by the user.
    href: `https://www.instagram.com/${instagramHandle.slice(1)}/`,
  },
  facebook: {
    label: 'Facebook',
    // Exact user-supplied shared URL; do not infer a different page username.
    href: 'https://www.facebook.com/share/1BPHwsBwgb/',
  },
  tiktok: {
    label: 'TikTok',
    // Preserve the complete supplied URL, including its query parameters.
    href: 'https://www.tiktok.com/@aromafia.pe?is_from_webapp=1&sender_device=pc',
  },
} as const satisfies ContactConfiguration;
