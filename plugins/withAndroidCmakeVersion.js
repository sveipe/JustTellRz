const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = '// @generated withAndroidCmakeVersion';

/**
 * Pins the CMake version used for the app's native (C++) build.
 *
 * Why: on Windows, the React Native New Architecture build creates object-file paths longer than
 * 260 characters. The Android Gradle Plugin's default CMake (3.22.1) bundles ninja 1.10, which
 * can't use long paths even with Windows long paths enabled; newer CMake bundles ninja >= 1.12,
 * which can. Also requires LongPathsEnabled=1 in Windows.
 *
 * By default this only applies when prebuilding on Windows, so EAS and macOS/Linux builds keep
 * the Android Gradle Plugin's default CMake.
 *
 * Options: { version: "4.1.2", windowsOnly?: true }
 */
module.exports = function withAndroidCmakeVersion(config, { version, windowsOnly = true } = {}) {
  if (!version) throw new Error('withAndroidCmakeVersion: the "version" option is required');
  if (windowsOnly && process.platform !== 'win32') return config;

  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error('withAndroidCmakeVersion: expected a Groovy app/build.gradle');
    }
    const block = [
      `    ${MARKER}`,
      '    externalNativeBuild {',
      '        cmake {',
      `            version "${version}"`,
      '        }',
      '    }',
    ].join('\n');

    let contents = cfg.modResults.contents;
    // Replace a block from an earlier run so prebuild stays idempotent.
    const existing = new RegExp(`    ${MARKER}\\n    externalNativeBuild \\{\\n[\\s\\S]*?\\n    \\}`);
    if (existing.test(contents)) {
      contents = contents.replace(existing, block);
    } else if (/^android \{$/m.test(contents)) {
      contents = contents.replace(/^android \{$/m, `android {\n${block}\n`);
    } else {
      throw new Error('withAndroidCmakeVersion: could not find the android { } block in app/build.gradle');
    }
    cfg.modResults.contents = contents;
    return cfg;
  });
};
