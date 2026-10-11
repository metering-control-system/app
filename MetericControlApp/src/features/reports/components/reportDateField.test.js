import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import test from 'node:test';
import { createElement, useState } from 'react';
import { act, create } from 'react-test-renderer';
import ts from 'typescript';
import { buildReportActFieldsPayload } from '../lib/reportActFieldValues.js';

const sourceUrl = (source) =>
    `data:text/javascript,${encodeURIComponent(source)}`;
const nativeUrl = sourceUrl(`
    export const Platform = { OS: 'android' };
    export const alerts = [];
    export const Alert = { alert: (...args) => alerts.push(args) };
    export const Keyboard = { dismiss() {} };
    export const StyleSheet = { create: value => value };
    export const Modal = 'Modal', Pressable = 'Pressable', Text = 'Text',
        TextInput = 'TextInput', View = 'View';
`);
const pickerUrl = sourceUrl(`
    export const opened = [], dismissed = [];
    export const DateTimePickerAndroid = {
        open: params => opened.push(params),
        dismiss: mode => { dismissed.push(mode); return Promise.resolve(true); },
    };
    export default 'DateTimePicker';
`);
const loader = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === 'react-native')
            return { url: nativeUrl, shortCircuit: true };
        if (specifier === '@react-native-community/datetimepicker')
            return { url: pickerUrl, shortCircuit: true };
        if (specifier.startsWith('../') && !specifier.endsWith('.js'))
            return nextResolve(`${specifier}.js`, context);
        return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
        if (url.endsWith('.jsx'))
            return {
                format: 'module',
                shortCircuit: true,
                source: ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
                    compilerOptions: {
                        jsx: ts.JsxEmit.ReactJSX,
                        module: ts.ModuleKind.ESNext,
                        target: ts.ScriptTarget.ESNext,
                    },
                }).outputText,
            };
        return nextLoad(url, context);
    },
});
const { default: ReportDateField } = await import('./reportDateField.jsx');
const native = await import(nativeUrl);
const picker = await import(pickerUrl);
loader.deregister();

const setup = async (
    t,
    { value = '', dateTime = false, platform = 'android' } = {}
) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    native.Platform.OS = platform;
    native.alerts.length = picker.opened.length = picker.dismissed.length = 0;
    const changes = [];
    const Harness = ({ disabled = false }) => {
        const [current, setCurrent] = useState(value);
        return createElement(ReportDateField, {
            label: 'Дата отчёта',
            value: current,
            dateTime,
            disabled,
            onChange: (next) => {
                changes.push(next);
                setCurrent(next);
            },
        });
    };
    let root;
    await act(async () => {
        root = create(createElement(Harness));
    });
    t.after(async () => {
        await act(async () => root.unmount());
        delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    });
    const press = async (label) => {
        const button = root.root
            .findAllByType('Pressable')
            .find((node) =>
                label === 'open'
                    ? node.props.accessibilityLabel?.startsWith('Дата отчёта:')
                    : node.props.accessibilityLabel === label ||
                      node
                          .findAllByType('Text')
                          .some((text) => text.children.includes(label))
            );
        assert.ok(button, label);
        assert.equal(button.props.disabled === true, false, label);
        await act(async () => button.props.onPress());
    };
    const select = async (date, type = 'set') => {
        await act(async () => picker.opened.at(-1).onChange({ type }, date));
    };
    return { root, changes, press, select, Harness };
};

test('date selection keeps the local calendar day through report API serialization', async (t) => {
    const { changes, press, select } = await setup(t, { value: '31.10.2026' });
    await press('open');
    assert.equal(picker.opened[0].value.getDate(), 31);
    await select(new Date(2027, 0, 4));
    assert.deepEqual(changes, ['04.01.2027']);
    const payload = buildReportActFieldsPayload({
        actDetails: { powerOfAttorneyDate: changes[0] },
    });
    assert.equal(payload.act_details.power_of_attorney_date, '2027-01-04');
});

test('Android commits date and time together, retaining the chosen day', async (t) => {
    const { changes, press, select } = await setup(t, {
        value: '12.10.2026 11:40',
        dateTime: true,
    });
    await press('open');
    await select(new Date(2026, 9, 15));
    assert.deepEqual(changes, []);
    assert.equal(picker.opened.at(-1).mode, 'time');
    assert.equal(picker.opened.at(-1).is24Hour, true);
    await select(new Date(2000, 0, 1, 14, 5));
    assert.deepEqual(changes, ['15.10.2026 14:05']);
    const payload = buildReportActFieldsPayload({
        actDetails: { compiledAt: changes[0] },
    });
    assert.equal(
        payload.act_details.compiled_at,
        new Date(2026, 9, 15, 14, 5).toISOString()
    );
});

test('cancelling either Android dialog preserves the original value and allows reopening', async (t) => {
    const { changes, press, select } = await setup(t, {
        value: '12.10.2026 11:40',
        dateTime: true,
    });
    await press('open');
    await select(undefined, 'dismissed');
    await press('open');
    await select(new Date(2026, 9, 15));
    await select(undefined, 'dismissed');
    assert.deepEqual(changes, []);
    await press('open');
    assert.equal(picker.opened.at(-1).mode, 'date');
});

test('clearing an optional date sends null rather than the current date', async (t) => {
    const { changes, press } = await setup(t, { value: '12.10.2026' });
    await press('Очистить: Дата отчёта');
    assert.deepEqual(changes, ['']);
    const payload = buildReportActFieldsPayload({
        actDetails: { powerOfAttorneyDate: changes[0] },
    });
    assert.equal(payload.act_details.power_of_attorney_date, null);
    assert.equal(picker.opened.length, 0);
});

test('blocking the form dismisses the Android dialog and ignores a late selection', async (t) => {
    const { root, changes, press, Harness } = await setup(t);
    await press('open');
    const request = picker.opened.at(-1);
    await act(async () =>
        root.update(createElement(Harness, { disabled: true }))
    );
    assert.deepEqual(picker.dismissed, ['date']);
    await act(async () =>
        request.onChange({ type: 'set' }, new Date(2026, 9, 15))
    );
    assert.deepEqual(changes, []);
});

test('iOS selection stays pending until confirmation and can be cancelled', async (t) => {
    const { root, changes, press } = await setup(t, {
        value: '12.10.2026 11:40',
        dateTime: true,
        platform: 'ios',
    });
    const changeIos = async (date) => {
        await act(async () =>
            root.root
                .findByType('DateTimePicker')
                .props.onChange({ type: 'set' }, date)
        );
    };
    await press('open');
    await changeIos(new Date(2026, 9, 15, 11, 40));
    await press('Далее');
    await changeIos(new Date(2026, 9, 15, 14, 5));
    assert.deepEqual(changes, []);
    await press('Отмена');
    assert.deepEqual(changes, []);
    await press('open');
    await changeIos(new Date(2026, 9, 16, 11, 40));
    await press('Далее');
    await changeIos(new Date(2026, 9, 16, 14, 5));
    await press('Готово');
    assert.deepEqual(changes, ['16.10.2026 14:05']);
});
