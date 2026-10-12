import { SIGNATURE_ROLES } from '@/features/reports/constants/signatureRoles';
import { createSignatureSvg } from '@/features/reports/lib/createSignatureSvg';

export const fillActTemplate = (html, data, requiredFields = []) => {
    const allowedFields = new Set(
        requiredFields.map((field) => field.toLowerCase())
    );
    const signatures = Object.fromEntries(
        Object.entries(SIGNATURE_ROLES).flatMap(([role, { placeholders }]) => {
            const svg = createSignatureSvg(data.actPdf?.signatures?.[role]);
            return placeholders.map((placeholder) => [placeholder, svg]);
        })
    );
    const resolveValue = (expression) => {
        const comparison = expression
            .trim()
            .match(
                /^([\w.]+)\s*(===|!==|==|!=)\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))$/
            );
        const field = comparison?.[1] ?? expression.trim();
        if (
            allowedFields.size &&
            !allowedFields.has(field.toLowerCase()) &&
            !allowedFields.has(expression.trim().toLowerCase())
        )
            return undefined;

        let value = field.split('.').reduce((current, part) => {
            if (!current || typeof current !== 'object') return undefined;
            const key = Object.keys(current).find(
                (name) => name.toLowerCase() === part.toLowerCase()
            );
            return key === undefined ? undefined : current[key];
        }, data);

        if (value === undefined && field === 'admission.accepted') {
            value = data.admission?.status === 'ADMITTED';
        }
        if (value === undefined && field === 'admission.rejected') {
            value = data.admission?.status === 'NOT_ADMITTED';
        }
        if (!comparison) return value;
        if (value === undefined || value === null) return false;

        const literal = comparison[5];
        const expected =
            comparison[3] ??
            comparison[4] ??
            (literal === 'true'
                ? true
                : literal === 'false'
                  ? false
                  : literal === 'null'
                    ? null
                    : /^-?\d+(\.\d+)?$/.test(literal)
                      ? Number(literal)
                      : literal);
        return comparison[2].startsWith('!')
            ? value !== expected
            : value === expected;
    };

    const signerRoles = {
        supplierSignerName: 'master',
        utilitySignerName: 'utilityRepresentative',
        consumerSignerName: 'client',
    };
    const withSignatures = html.replace(
        /<tr\b[^>]*>[\s\S]*?<\/tr>/gi,
        (row) => {
            const signer = Object.keys(signerRoles).find((field) =>
                row.includes(`{{act.${field}}}`)
            );
            if (!signer) return row;
            const svg = createSignatureSvg(
                data.actPdf?.signatures?.[signerRoles[signer]]
            );
            if (!svg) return row;
            return row.replace(
                /(<span\b[^>]*\bstyle=["'][^"']*height:\s*24px[^"']*["'][^>]*>)(\s*)(<\/span>)/i,
                (_, opening, space, closing) =>
                    `${opening}${svg.replace('height="26"', 'height="24"')}${closing}`
            );
        }
    );
    const withCheckboxes = withSignatures.replace(
        /<input\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi,
        (input) => {
            if (
                !/\btype\s*=\s*(?:"checkbox"|'checkbox'|checkbox\b)/i.test(
                    input
                )
            )
                return input;
            return input.replace(
                /\{\{([^}]+)}}(?:\s*=\s*(?:""|''))?/g,
                (_, expression) => {
                    const value = resolveValue(expression);
                    return value === true || value === 'checked'
                        ? 'checked'
                        : '';
                }
            );
        }
    );

    return withCheckboxes.replace(/\{\{([^}]+)}}/g, (_, expression) => {
        const field = expression.trim();
        if (Object.hasOwn(signatures, field)) return signatures[field];
        const value = resolveValue(field);
        if (value === undefined || value === null || typeof value === 'object')
            return '';
        return String(value).replace(
            /[&<>"']/g,
            (character) =>
                ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;',
                })[character]
        );
    });
};
