## PayPal Common Components

[![build status][build-badge]][build]
[![code coverage][coverage-badge]][coverage]
[![npm version][version-badge]][package]
[![apache license][license-badge]][license]

[build-badge]: https://img.shields.io/github/workflow/status/paypal/paypal-common-components/build?logo=github&style=flat-square
[build]: https://github.com/paypal/paypal-common-components/actions?query=workflow%3Abuild
[coverage-badge]: https://img.shields.io/codecov/c/github/paypal/paypal-common-components.svg?style=flat-square
[coverage]: https://codecov.io/github/paypal/paypal-common-components/
[version-badge]: https://img.shields.io/npm/v/@paypal/common-components.svg?style=flat-square
[package]: https://www.npmjs.com/package/@paypal/common-components
[license-badge]: https://img.shields.io/npm/l/@paypal/common-components.svg?style=flat-square
[license]: https://github.com/paypal/paypal-common-components/blob/master/LICENSE

Common components for the PayPal JavaScript SDK

## Development

Please feel free to follow the [Contribution Guidelines](./CONTRIBUTING.md) to contribute to this repository. PRs are welcome, but for major changes please raise an issue first.

### Quick Setup

Set up your env:

```bash
npm install
```

Run tests:

```bash
npm test
```

Run in dev mode:

```bash
npm run dev
```

## Test Tasks

```
npm test
```

| Flags         | Description                                  |
| ------------- | -------------------------------------------- |
| --clear-cache | Clear Babel Loader and PhantomJS cache       |
| --debug       | Debug mode. PhantomJS, Karma, and CheckoutJS |
| --quick       | Fastest testing. Minimal output, no coverage |
| --browser     | Choose Browser                               |
