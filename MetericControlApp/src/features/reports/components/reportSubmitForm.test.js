import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import { createElement, useState } from 'react';
import { act, create } from 'react-test-renderer';
import { state } from './fixtures/reportFormValidation.js';

const fixtures = new URL('./fixtures/reportFormValidation.js', import.meta.url)
    .href;
const stub = (source) => ({
    url: `data:text/javascript,${encodeURIComponent(source)}`,
    shortCircuit: true,
});
const reactUrl = import.meta.resolve('react');
const loader = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === 'react-native')
            return stub(
                `export const View='View',Text='Text',TextInput='TextInput',Pressable='Pressable',Switch='Switch',ScrollView='ScrollView'; export const Keyboard={dismiss(){}};export const Alert={alert(){}};export const StyleSheet={create:v=>v};`
            );
        if (specifier === '@expo/vector-icons')
            return stub(`export const FontAwesome=()=>null,Ionicons=()=>null;`);
        if (specifier === '@tanstack/react-query')
            return stub(`export const useMutationState=()=>[];`);
        if (specifier === 'expo-router')
            return stub(`export const useRouter=()=>({push(){}});`);
        if (specifier === 'expo-sharing')
            return stub(`export const isAvailableAsync=async()=>false;`);
        if (specifier.endsWith('/useNetwork'))
            return stub(`export default ()=>({isOnline:true});`);
        for (const name of Object.keys(state).filter((name) =>
            name.startsWith('use')
        ))
            if (specifier.endsWith('/' + name))
                return stub(
                    `import {store} from '${fixtures}';export default store('${name}');`
                );
        if (specifier.endsWith('/useSubmitReport'))
            return stub(
                `export {useSubmitReport as default} from '${fixtures}';`
            );
        if (specifier.endsWith('/useLoadBrigadeReport'))
            return stub(
                `export default ()=>({loadReport(){},isLoading:false});`
            );
        if (specifier.endsWith('/validateReportUploadFiles'))
            return stub(
                `export const REPORT_IMAGE_MAX_BYTES=20*1024*1024;export {validateReportPhoto} from '${fixtures}';`
            );
        if (specifier.endsWith('/validateReportAct'))
            return stub(`export const validateReportAct=async()=>{};`);
        if (specifier.endsWith('/ensureActFileExists'))
            return stub(`export const ensureActFileExists=()=>{};`);
        if (specifier.endsWith('/generateActPdf'))
            return stub(`export const generateActPdf=async()=>({});`);
        if (
            specifier.endsWith('/card') ||
            specifier.endsWith('/highlightWrapper')
        )
            return stub(
                `export const HighlightWrap=({children})=>children;export default HighlightWrap;`
            );
        if (specifier.endsWith('/formButton'))
            return stub(
                `import {createElement} from '${reactUrl}';export default props=>createElement('FormButton',props);`
            );
        if (specifier.endsWith('/mediaBlock'))
            return stub(
                `import {createElement} from '${reactUrl}';export default props=>createElement('MediaBlock',props);`
            );
        if (specifier.endsWith('/actDocumentPanel'))
            return stub(`export default ()=>null;`);
        if (specifier === './reportFormLayout')
            return {
                url: new URL('./reportFormLayout.jsx', import.meta.url).href,
                shortCircuit: true,
            };
        if (specifier === './reportDateField')
            return stub(`export default ()=>null;`);
        if (specifier.startsWith('@/')) {
            const path = fileURLToPath(
                new URL(`../../../${specifier.slice(2)}`, import.meta.url)
            );
            const file = [path + '.js', path + '.jsx'].find(existsSync);
            if (file)
                return { url: pathToFileURL(file).href, shortCircuit: true };
        }
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
const { default: Form } = await import('./reportSubmitForm.jsx');
loader.deregister();

const setup = async (t) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    state.errors = [];
    state.submissions = [];
    state.addedPhotos = [];
    state.fileValidationError = null;
    state.submissionError = null;
    const task = {
        id: 1,
        consumer: { ['full_name']: 'Иванов Иван' },
        address: { ['account_number']: '123456' },
        meter: { type: 'Меркурий', number: '123' },
    };
    let currentStep;
    const Harness = () => {
        const [stepIndex, setStepIndex] = useState(0);
        currentStep = stepIndex;
        return createElement(Form, {
            task,
            id: '1',
            stepIndex,
            setStepIndex,
            fillPositions() {},
            onActionStart() {},
            onError: (...error) => state.errors.push(error),
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
    return {
        input: (placeholder) =>
            root.root
                .findAllByType('TextInput')
                .find((node) => node.props.placeholder === placeholder),
        button: (message) =>
            root.root
                .findAllByType('FormButton')
                .find((node) => node.props.message === message),
        tab: (index) =>
            root.root
                .findAllByType('Pressable')
                .filter((node) => node.props.accessibilityRole === 'tab')[
                index
            ],
        text: () =>
            root.root
                .findAllByType('Text')
                .map((node) => node.props.children)
                .flat()
                .filter((value) => typeof value === 'string'),
        step: () => currentStep,
        media: () => root.root.findAllByType('MediaBlock'),
        radio: (label) =>
            root.root
                .findAllByType('Pressable')
                .find(
                    (node) =>
                        node.props.accessibilityRole === 'radio' &&
                        node.props.children?.props?.children === label
                ),
    };
};

test('field errors appear on blur and clear while the installer corrects input', async (t) => {
    const form = await setup(t);
    await act(async () =>
        form.input('Введите тип старого ПУ').props.onChangeText('А'.repeat(41))
    );
    assert.ok(!form.text().includes('Тип старого ПУ слишком длинный'));
    await act(async () => form.input('Введите тип старого ПУ').props.onBlur());
    assert.ok(form.text().includes('Тип старого ПУ слишком длинный'));
    await act(async () =>
        form.input('Введите тип старого ПУ').props.onChangeText('Меркурий')
    );
    assert.ok(!form.text().includes('Тип старого ПУ слишком длинный'));
    assert.equal(state.submissions.length, 0);
});

test('next and back remain available with invalid or missing fields and preserve inline errors', async (t) => {
    const form = await setup(t);
    await act(async () => form.button('Далее').props.onPress());
    assert.equal(form.step(), 1);
    await act(async () =>
        form.input('Введите номер нового ПУ').props.onChangeText('A'.repeat(41))
    );
    await act(async () => form.input('Введите номер нового ПУ').props.onBlur());
    assert.ok(form.text().includes('Номер нового ПУ слишком длинный'));
    await act(async () => form.button('Далее').props.onPress());
    assert.equal(form.step(), 2);
    assert.equal(state.errors.length, 0);
    await act(async () => form.button('Назад').props.onPress());
    assert.equal(form.step(), 1);
    assert.equal(
        form.input('Введите номер нового ПУ').props.value,
        'A'.repeat(41)
    );
    assert.equal(form.input('Введите показания при установке').props.value, '');
    assert.ok(form.text().includes('Номер нового ПУ слишком длинный'));
    await act(async () =>
        form.input('Введите номер нового ПУ').props.onChangeText('ABC-123')
    );
    assert.ok(!form.text().includes('Номер нового ПУ слишком длинный'));
    assert.equal(state.submissions.length, 0);
});

test('tabs allow freely jumping over incomplete steps while saving still checks the entire report', async (t) => {
    const form = await setup(t);
    await act(async () => form.tab(1).props.onPress());
    await act(async () => form.tab(6).props.onPress());
    assert.equal(form.step(), 6);
    assert.equal(state.errors.length, 0);
    await act(async () => form.tab(0).props.onPress());
    assert.equal(form.step(), 0);
    await act(async () => form.tab(6).props.onPress());
    await act(async () => form.button('Сохранить отчёт').props.onPress());
    assert.equal(form.step(), 1);
    assert.match(state.errors.at(-1)[1], /тип нового ПУ/);
    assert.equal(state.submissions.length, 0);
    await act(async () => form.tab(6).props.onPress());
    assert.equal(form.step(), 6);
    assert.equal(state.errors.length, 1);
});

test('gallery rejects invalid files without storing them and accepts files within the report limit', async (t) => {
    const form = await setup(t);
    await act(async () => form.tab(2).props.onPress());
    assert.equal(form.media()[0].props.maxSizeBytes, 20 * 1024 * 1024);
    state.fileValidationError = new Error(
        'Фотография должна быть в формате JPEG, PNG или WebP'
    );
    await act(async () =>
        form.media()[0].props.handleUploadPhoto('file:///bad.heic')
    );
    assert.equal(state.addedPhotos.length, 0);
    assert.match(state.errors.at(-1)[1], /JPEG, PNG или WebP/);
    state.fileValidationError = null;
    await act(async () =>
        form.media()[0].props.handleUploadPhoto('file:///good.jpg')
    );
    assert.equal(state.addedPhotos[0].uri, 'file:///good.jpg');
});

test('a pre-upload file error returns the installer to its step with the entered values intact', async (t) => {
    const form = await setup(t);
    await act(async () => form.tab(1).props.onPress());
    await act(async () =>
        form.input('Введите тип нового ПУ').props.onChangeText('Меркурий')
    );
    await act(async () =>
        form.input('Введите номер нового ПУ').props.onChangeText('ABC-123')
    );
    await act(async () =>
        form.input('Введите показания при установке').props.onChangeText('0')
    );
    await act(async () => form.tab(3).props.onPress());
    await act(async () => form.radio('Допущен').props.onPress());
    await act(async () => form.tab(6).props.onPress());
    state.submissionError = Object.assign(new Error('Файл повреждён'), {
        code: 'REPORT_VALIDATION_ERROR',
        issues: [{ path: ['photos', 'oldMeter'], message: 'Файл повреждён' }],
        validationErrors: {
            photos: { oldMeter: { message: 'Файл повреждён' } },
        },
    });
    await act(async () => form.button('Сохранить отчёт').props.onPress());
    assert.equal(form.step(), 2);
    assert.ok(form.text().includes('Файл повреждён'));
    await act(async () => form.tab(1).props.onPress());
    assert.equal(form.input('Введите номер нового ПУ').props.value, 'ABC-123');
});
