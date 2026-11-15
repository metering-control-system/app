import assert from 'node:assert/strict';
import test from 'node:test';
import { getAdditionalReportDetails } from '@/features/reports/lib/reportFieldDetails';

test('optional report details omit absent values without hiding zero or false', () => {
    const sections = getAdditionalReportDetails({
        metering: {
            ['old_t1']: '0.000',
            ['new_digits_after']: 0,
            ['new_sim_number']: '',
            ['replacement_reason']: 'METER_MISSING',
        },
        admission: {
            ['is_compliant']: false,
            ['is_smart_system_connected']: null,
        },
    });

    assert.deepEqual(
        sections.oldMeter.map((row) => row.value),
        ['0.000']
    );
    assert.deepEqual(
        sections.newMeter.map((row) => row.value),
        ['0']
    );
    assert.deepEqual(
        sections.replacement.map((row) => row.value),
        ['Прибор отсутствует']
    );
    assert.deepEqual(
        sections.admission.map((row) => row.value),
        ['Нет']
    );
    assert.deepEqual(sections.actDetails, []);
});

test('report details translate locations and format stored dates', () => {
    const sections = getAdditionalReportDetails({
        metering: {
            ['old_installation_location']: 'STAIRCASE',
            ['old_verification_date']: '2026-10-12',
            ['new_installation_location']: 'APARTMENT',
        },
        ['act_details']: {
            ['power_of_attorney_date']: '2026-10-01',
            ['representative_name']: 'Иванов Иван',
            ['member_signature']: 'data:image/png;base64,aGVsbG8=',
        },
    });

    assert.deepEqual(
        sections.oldMeter.map((row) => row.value),
        ['На лестничной площадке', '12.10.2026']
    );
    assert.deepEqual(
        sections.newMeter.map((row) => row.value),
        ['В квартире']
    );
    assert.deepEqual(
        sections.actDetails.map((row) => row.value),
        ['Иванов Иван', '01.10.2026']
    );
});
