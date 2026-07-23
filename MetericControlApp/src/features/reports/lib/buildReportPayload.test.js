import assert from 'node:assert/strict';
import test from 'node:test';

import { buildReportPayload } from './buildReportPayload.js';

const createFormValues = () => ({
    clientReportId: '9d9e7f4a-0e8c-4f9c-b8ec-123456789abc',
    taskId: 12,
    meterBefore: {
        actualNumber: '',
        actualType: '',
        number: 'OLD-1',
        type: 'OldType',
    },
    metering: {
        dismantlingCompleted: true,
        newMeterNumber: 'NEW-1',
        newMeterType: 'NewType',
        oldReading: '10',
        installationReading: '0',
        sealLocation: 'TERMINAL_COVER',
        sealNumber: 'SEAL-1',
    },
    admission: {
        status: 'ADMITTED',
        rejectionReason: '',
        rejectionComment: '',
    },
    consumerContact: {
        fullName: 'Иванов Иван Иванович',
        phoneNumber: '+78005553535',
        phoneNumber2: '',
        email: 'ivan@example.com',
        isRefusedContact: false,
    },
});

test('omits empty optional fields when creating a report', () => {
    const payload = buildReportPayload(createFormValues());

    assert.equal('phone_number_2' in payload['consumer_contact'], false);
    assert.equal('rejection_reason' in payload.admission, false);
    assert.equal('rejection_comment' in payload.admission, false);
});

test('keeps empty optional fields when updating a report', () => {
    const payload = buildReportPayload(createFormValues(), {
        includeEmptyOptionalFields: true,
    });

    assert.equal(payload['consumer_contact']['phone_number_2'], null);
    assert.equal(payload.admission['rejection_reason'], '');
    assert.equal(payload.admission['rejection_comment'], '');
});
