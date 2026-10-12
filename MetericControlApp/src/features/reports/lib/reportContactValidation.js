import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { z } from 'zod';

const parseInternationalPhone = (value) => {
    if (!value.startsWith('+')) return null;
    const phone = parsePhoneNumberFromString(value, { extract: false });
    return phone?.isValid() ? phone : null;
};

export const isValidReportPhone = (value) =>
    !value || Boolean(parseInternationalPhone(value));

export const normalizeReportPhone = (value) => {
    const trimmed = value?.trim() ?? '';
    return parseInternationalPhone(trimmed)?.number ?? trimmed;
};

const emailUserPattern =
    /^[-!#$%&'*+/=?^_`{}|~0-9A-Z]+(?:\.[-!#$%&'*+/=?^_`{}|~0-9A-Z]+)*$/i;
const isValidEmailUser = (user) => {
    if (emailUserPattern.test(user)) return true;
    if (!user.startsWith('"') || !user.endsWith('"')) return false;
    const content = user.slice(1, -1);
    for (let index = 0; index < content.length; index++) {
        const escaped = content[index] === '\\';
        if (escaped) index++;
        const code = content.charCodeAt(index);
        if (!(code >= 1 && code <= 127) || code === 10 || code === 13)
            return false;
        if (!escaped && [9, 32, 34, 92].includes(code)) return false;
    }
    return true;
};
const emailDomainPattern =
    /^[a-z\u00a1-\uffff0-9](?:[a-z\u00a1-\uffff0-9-]{0,61}[a-z\u00a1-\uffff0-9])?(?:\.(?!-)[a-z\u00a1-\uffff0-9-]{1,63}(?<!-))*\.(?!-)(?:[a-z\u00a1-\uffff-]{2,63}|xn--[a-z0-9]{1,59})(?<!-)$/i;

export const isValidReportEmail = (value) => {
    if (!value) return true;
    if (/[\r\n]/.test(value)) return false;
    const separator = value.lastIndexOf('@');
    if (separator < 1) return false;
    const user = value.slice(0, separator);
    const domain = value.slice(separator + 1);
    if (!isValidEmailUser(user)) return false;
    if (domain === 'localhost' || emailDomainPattern.test(domain)) return true;
    if (!domain.startsWith('[') || !domain.endsWith(']')) return false;
    const address = domain.slice(1, -1);
    return (
        z.ipv4().safeParse(address).success ||
        z.ipv6().safeParse(address).success
    );
};
