export const REPORT_PHOTO_CONFIGS = [
    {
        kind: 'OLD_METER',
        name: 'oldMeter',
        fileName: 'old_meter',
        title: 'Фото старого счетчика',
    },
    { kind: 'SEAL', name: 'seal', fileName: 'seal', title: 'Фото пломбы' },
    {
        kind: 'FRONT_PANEL',
        name: 'frontPanel',
        fileName: 'front_panel',
        title: 'Фото лицевой панели счетчика',
    },
    {
        kind: 'GENERAL_VIEW',
        name: 'generalView',
        fileName: 'general_view',
        title: 'Общий вид',
    },
    {
        kind: 'ACT_PAPER',
        name: 'actPaper',
        fileName: 'act_paper',
        title: 'Фото бумажного акта',
    },
    {
        kind: 'REFUSAL_PROOF',
        name: 'refusalProof',
        fileName: 'refusal_proof',
        title: 'Фото подтверждения отказа',
    },
];

export const REPORT_PHOTO_SLOTS = REPORT_PHOTO_CONFIGS.map(({ name }) => name);

export const REPORT_PHOTO_SLOT_BY_KIND = Object.fromEntries(
    REPORT_PHOTO_CONFIGS.map(({ kind, name }) => [kind, name])
);
