# Typhoon Test

Typhoon Test is a Visual Studio Code extension for Python projects, offering seamless integration, real-time test results, and easy navigation. Boost your productivity and ensure code quality with unit, integration, and end-to-end tests.

## Features

* **Seamless Integration with Visual Studio Code**
The Typhoon Test extension integrates seamlessly with Visual Studio Code, providing a user-friendly interface to manage and run your tests directly from the editor.

* **Comprehensive Testing Framework**
Supports unit tests, integration tests, and end-to-end tests, ensuring that you can cover all aspects of your Python projects.

* **Real-Time Test Results**
View test results in real-time within the editor. The extension highlights passed, failed, and skipped tests, making it easy to identify issues.

* **Easy Navigation**
Quickly navigate to test definitions and related code with just a few clicks. This feature boosts productivity by reducing the time spent searching for test files.

* **Customizable Test Configurations**
Configure your test runs with various options such as custom interpreter paths, real-time logs, and additional options. Refer to the `typhoon-test.testRun` settings for more details.

* **Automated Test Execution**

## Requirements

- Visual Studio Code v1.91.1 or higher
- Python 3.6 or higher (for running Python scripts)

## Extension Settings

## Extension Settings

This extension contributes the following settings:

* `typhoon-test.apiWizardWorkspace`: Configure the workspace for the API Wizard.
* `typhoon-test.testRun`: Configure the test run settings.

These settings can be configured in `Preferences: Open User Settings`. For example:

```json
{
    "typhoon-test.apiWizardWorkspace": "path/to/workspace",
    "typhoon-test.testRun": {
        "interpreterPath": "path/to/python"
    },
}
```

## Known Issues

* The API Wizard currently does not support importing custom classes and modules. This feature is planned for a future release.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Demo release of Typhoon Test
