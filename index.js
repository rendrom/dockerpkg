const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { spawn } = require('child_process');

function docpkg(argv) {
  const currentPath = process.cwd();
  const findPath = argv.p ? argv.p : '';
  const findDockerfile = argv.d;
  const pkgPath = getFilePath(path.join(currentPath, findPath), 'package.json');
  const dockerfilePath = getFilePath(
    path.join(currentPath, findDockerfile),
    'Dockerfile'
  );

  let pkg = {};
  if (pkgPath) {
    pkg = JSON.parse(fs.readFileSync(pkgPath));
  }

  const argPkg = {
    name: argv.n,
    registry: argv.r,
    version: argv.V,
    name: argv.n,
    latest: argv.l,
  };
  for (const [key, val] of Object.entries(argPkg)) {
    if (val !== undefined) {
      pkg[key] = val;
    }
  }
  if (pkg.docpkg) {
    Object.assign(pkg, pkg.docpkg);
    delete pkg.docpkg;
  }
  const { name, registry, version, latest } = pkg;
  const containerName = `${name}:${version}`;
  const containerNameRegistry = `${registry}/${name}`;

  execDocker();

  function execDocker() {
    let err;
    if (!dockerfilePath) {
      err = "Can't find the Dockerfile";
    }
    if (!name) {
      err = 'The `name` is not set';
    }
    if (!version) {
      err = 'The `version` is not set';
    }
    if (err) {
      console.log(chalk.red(err));
      return;
    }
    isDockerRun(() => {
      execBuild(() => {
        if (registry) {
          makeTag(version, () => {
            if (latest) {
              makeTag('latest', execPush);
            } else {
              execPush();
            }
          });
        }
      });
    });
    return;
  }

  function execBuild(onResolve) {
    console.log(chalk.green(`Start building: ${containerName}`));

    const build = spawn('docker', [
      'build',
      '-t',
      containerName,
      '-f',
      dockerfilePath,
      '.',
    ]);

    build.stdout.on('data', (data) => {
      console.log('' + data);
    });
    build.stderr.on('data', (data) => {
      console.log('' + data);
    });
    build.on('close', (code) => {
      if (code) {
        console.log(chalk.red(`Build error`));
      } else {
        console.log(chalk.green(`Building complete`));
        if (onResolve) {
          onResolve();
        }
      }
    });
  }

  function execPush(onResolve) {
    console.log(chalk.green(`Pushing: ${containerNameRegistry}`));

    const push = spawn('docker', ['push', containerNameRegistry, '-a']);

    push.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
    push.stderr.on('data', (data) => {
      console.log(chalk.bgRed(`stderr: `) + chalk.red(data));
    });
    push.on('close', (code) => {
      if (code) {
        console.log(chalk.bgRed(`Pushing error`));
      } else if (onResolve) {
        onResolve();
      }
    });
  }

  function makeTag(tag, onResolve) {
    console.log(chalk.green(`Make tag: ${containerNameRegistry}:${tag}`));

    const push = spawn('docker', [
      'tag',
      containerName,
      `${containerNameRegistry}:${tag}`,
    ]);

    push.stdout.on('data', (data) => {
      console.log(`${data}`);
    });

    push.stderr.on('data', (data) => {
      console.log(chalk.bgRed(`stderr: `) + chalk.red(data));
    });

    push.on('close', (code) => {
      if (code) {
        console.log(chalk.bgRed(`Pushing error`));
      } else {
        onResolve();
      }
    });
  }

  function isDockerRun(onIfRun) {
    const idRun = spawn('docker', ['ps']);
    idRun.on('close', (code) => {
      if (code) {
        console.log(chalk.red(`Docker daemon is not running`));
        const eye = chalk.redBright('0');
        const realDaemon = `
          |\\     ____
          | \\.-./ .-'
          \\ _  _(
          | ${eye})(${eye}/  , , ,
          |   \\(   | | |
          |     \\  \\_|_/
          |   /vvv   |
          |  |__     |
          /      \`-. |
      `;
        console.log(chalk.yellow(realDaemon));
      } else {
        if (onIfRun) {
          onIfRun();
        }
      }
    });
  }

  function getFilePath(fileOrDir, filename) {
    if (fs.existsSync(fileOrDir)) {
      const stats = fs.lstatSync(fileOrDir);
      if (stats.isFile()) {
        return fileOrDir;
      } else if (stats.isDirectory()) {
        return getFilePath(path.join(fileOrDir, filename));
      }
    }
  }
}

module.exports = docpkg;
