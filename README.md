# Dockerpkg

The Node tool for building and publishing a docker container based on package information

Install with `npm install dockerpkg`

## Usage

`dockerpkg [options]`

### Options

| param             | description                                                       | type      | default        |
| ----------------- | ----------------------------------------------------------------- | --------- | -------------- |
| -p, --package     | The path to the package.json or the directory where it is located | [string]  | ./package.json |
| -n, --name        | Container name                                                    | [string]  |                |
| -r, --registry    | Registry name to push container                                   | [string]  |                |
| -V, --version-tag | Container version to build and publish                            | [string]  |                |
| -l, --latest      | Push also latest tag                                              | [boolean] | false          |
| -d, --dockerfile  | Path to Dockerfile                                                | [string]  | ./Dockerfile   |
| -h, --help        | Show help                                                         | [boolean] |                |

### Configuration

Can be configured via package.json

```json
{
  "name": "my-app",
  "version": "1.1.1",
  "dockerpkg": {
    "registry": "registry.my.com",
    "latest": true,
    "name": "app",
    "version": "3.2.1"
  }
}
```

If the container `name` or `version` should be different place it in `dockerpkg`
