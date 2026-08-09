# Camera Usage

This module splits camera work into shared UI and feature-specific storage
bindings.

## Main Pieces

- `mediaBlock.jsx` renders a reusable media panel with camera, gallery upload,
  image preview, and delete controls.
- `camera/cameraCapture.jsx` renders the full-screen Expo camera and handles
  permissions, flash, torch, capture, and compression.
- `src/app/(authorized)/camera.jsx` is the shared route that decides which
  feature camera wrapper to render.
- `src/shared/store/useStorePictures.js` stores local image URIs by feature,
  item id, and slot.
- Feature wrappers, such as `taskCameraCapture.jsx`, connect `CameraCapture` to
  a concrete store path.

## Store Shape

Images are stored as:

```js
photos[entity][entityId][slot] = uri;
```

Use these keys consistently:

- `entity`: feature namespace, for example `task` or `report`.
- `entityId`: id of one concrete task/report.
- `slot`: image location inside the item, for example `new_meteric_control`.
- `uri`: local image URI returned by the camera or gallery picker.

## Adding Camera Support To A Feature

1. In the feature details form, read the current URI from `useStorePictures`.
2. Create callbacks that bind the feature's `entity`, `entityId`, and `slot`.
3. Render `MediaBlock` with those callbacks.
4. Create a feature-specific camera wrapper that renders `CameraCapture`.
5. Add a branch for the feature in `src/app/(authorized)/camera.jsx`.

## Feature Form Example

```jsx
const entity = 'task';
const slot = 'new_meteric_control';

const uri = useStorePictures(
    (state) => state.photos[entity]?.[id]?.[slot] ?? null
);
const setPhoto = useStorePictures((state) => state.setPhoto);
const clearPhoto = useStorePictures((state) => state.clearPhoto);

const handleOpenCamera = () => {
    router.push({
        pathname: '/(authorized)/camera',
        params: { action: 'tasks', id },
    });
};

const handleUploadPhoto = (uri) => {
    setPhoto({ entity, entityId: id, slot, uri });
};

const handleDeletePhoto = () => {
    clearPhoto({ entity, entityId: id, slot });
};

<MediaBlock
    uri={uri}
    handleOpenCamera={handleOpenCamera}
    handleDeletePhoto={handleDeletePhoto}
    handleUploadPhoto={handleUploadPhoto}
    handleUpdatePhoto={handleUploadPhoto}
    disabled={false}
/>;
```

## Feature Camera Wrapper Example

```jsx
const ReportCameraCapture = ({ id }) => {
    const cameraRef = useRef();
    const router = useRouter();
    const setPhoto = useStorePictures((state) => state.setPhoto);

    return (
        <CameraCapture
            cameraRef={cameraRef}
            setUri={(uri) => {
                setPhoto({
                    entity: 'report',
                    entityId: id,
                    slot: 'report_photo',
                    uri,
                });
            }}
            onHandlePhoto={() => router.back()}
            onClose={() => router.back()}
        />
    );
};
```

## Shared Camera Route Example

```jsx
const { action, id } = useLocalSearchParams();

if (action === 'tasks') {
    return <TaskCameraCapture id={id} />;
}

if (action === 'reports') {
    return <ReportCameraCapture id={id} />;
}

return null;
```

## Notes

- Keep entity and slot names in feature code, not in shared media components.
- `MediaBlock` should receive bound callbacks, not raw store functions.
- `CameraCapture` should only save through `setUri`; it should not import the
  store directly.
- Request camera permission inside `CameraCapture`; request gallery permission
  lazily when the user taps the gallery button.
