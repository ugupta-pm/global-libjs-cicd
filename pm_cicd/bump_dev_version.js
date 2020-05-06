function bump_verison() {
  let version = require('../app/gui/package.json');
  const gitlog = require('gitlog').default;

  const options = {
    repo: __dirname,
    number: 100,
    fields: ['subject'],
    execOptions: { maxBuffer: 1000 * 1024 },
  };

  let commits = gitlog(options);

  if (commits[0].subject.split(' ')[0] === 'Merge') {
    let parse_version = version.version.split('-');

    if (parse_version.length === 1) {
      // Need to append -dev-1 to it
      version.version += '-dev-1';
    } else {
      // Increment the dev version number
      parse_version[2] = (parseInt(parse_version[2], 10) + 1).toString();
      version.version = '';
      version.version += `${parse_version[0]}-${parse_version[1]}-${parse_version[2]}`;
    }


    // Writing the updated version back to the
    // package.json file

    let fs = require('file-system');

    let data = fs.readFileSync('./app/gui/package.json').toString();

    // Converting string to json object
    let obj = JSON.parse(data);

    // Updating the version
    obj.version = version.version;

    // Writing back the updated json object to package.json
    fs.writeFileSync('./app/gui/package.json', JSON.stringify(obj, null, 2), { encoding: 'utf8', flag: 'w' });
  }
}

bump_verison();
