# ParkSmart

ParkSmart is an Android application built with Kotlin and Android Gradle Plugin. The project includes an Android app module under `app/`.

## Project structure

- `app/` - Android application module
- `build.gradle` - root Gradle build file
- `settings.gradle` - Gradle settings including module inclusion
- `gradle.properties` - Gradle properties and JVM options
- `gradle/` and `gradle-8.1.1/`, `gradle-9.0.0/` - Gradle wrapper files

## Build

To build a debug APK using the Gradle wrapper:

```bash
cd "c:\Users\nagar\OneDrive\Desktop\MAD LAB\ParkSmart"
./gradlew.bat assembleDebug
```

## APK output

The generated debug APK is available at:

`app/build/outputs/apk/debug/app-debug.apk`

## Notes

- The project targets `compileSdk 34` and `targetSdk 34`.
- Minimum SDK version is `21`.
- The build uses Kotlin and AndroidX dependencies.
