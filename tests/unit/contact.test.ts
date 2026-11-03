import { describe, expect, it } from 'vitest';
import { contact } from '../../src/config/contact';

describe('configuración pública de contactos', () => {
  it('usa el número peruano completo en WhatsApp, sin separadores ni texto de cliente', () => {
    const { whatsapp } = contact;
    const url = new URL(whatsapp.href);

    expect(whatsapp.nationalNumber).toBe('955565209');
    expect(whatsapp.internationalNumber).toBe('51955565209');
    expect(whatsapp.internationalNumber).toBe(
      `${whatsapp.countryCallingCode}${whatsapp.nationalNumber}`,
    );
    expect(whatsapp.internationalNumber).toMatch(/^51[0-9]{9}$/);
    expect(whatsapp.displayNumber).toBe('+51 955565209');
    expect(url.hostname).toBe('wa.me');
    expect(url.pathname).toBe(`/${whatsapp.internationalNumber}`);
    expect(url.search).toBe('');
    expect(url.hash).toBe('');
  });

  it('deriva Instagram del identificador recibido, conservando su punto', () => {
    const url = new URL(contact.instagram.href);

    expect(contact.instagram.handle).toBe('@aromafia.pe');
    expect(url.hostname).toBe('www.instagram.com');
    expect(url.pathname).toBe(`/${contact.instagram.handle.slice(1)}/`);
    expect(url.search).toBe('');
  });

  it('conserva la dirección compartida de Facebook y la URL completa de TikTok', () => {
    expect(contact.facebook.href).toBe('https://www.facebook.com/share/1BPHwsBwgb/');
    expect(contact.tiktok.href).toBe(
      'https://www.tiktok.com/@aromafia.pe?is_from_webapp=1&sender_device=pc',
    );
    const tiktok = new URL(contact.tiktok.href);
    expect(tiktok.pathname).toBe('/@aromafia.pe');
    expect(Array.from(tiktok.searchParams.entries())).toEqual([
      ['is_from_webapp', '1'],
      ['sender_device', 'pc'],
    ]);
  });

  it('expone enlaces HTTPS con nombres de canal y sin credenciales', () => {
    const channels = [contact.whatsapp, contact.instagram, contact.facebook, contact.tiktok];
    const allowedHosts = new Set([
      'wa.me',
      'www.instagram.com',
      'www.facebook.com',
      'www.tiktok.com',
    ]);

    expect(new Set(channels.map((channel) => channel.label)).size).toBe(channels.length);
    for (const channel of channels) {
      const url = new URL(channel.href);
      expect(channel.label.trim()).not.toBe('');
      expect(url.protocol).toBe('https:');
      expect(allowedHosts.has(url.hostname)).toBe(true);
      expect(url.username).toBe('');
      expect(url.password).toBe('');
    }
  });
});
