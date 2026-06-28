# Platform Architecture

- Android-only app
- Expo React Native
- TypeScript
- Android Emulator as the primary preview tool
- Android Emulator as the primary debugging tool
- Expo Go can be used during early development
- Development build only if later required by native dependencies
- Local APK installation only
- No Play Store assumptions
- No iOS work unless explicitly requested

## Private Android Deployment

Thai Stricker is deployed privately as an Android APK.

Deployment target:
- Personal Android device only

Build type:
- APK

Not used:
- Google Play Store
- Android App Bundle for store release
- iOS build
- Public distribution

Developer commands:

```powershell
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview-apk
```

After the APK is built:

```powershell
adb install path/to/thai-stricker.apk
```

Or manually copy the APK to the Android phone and install it after allowing installation from unknown sources.
