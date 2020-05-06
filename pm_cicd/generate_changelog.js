// Returns true if the commit message is of the form
// "merge pull request *""
function is_pull_request(commit) {
  let parse_array = commit.split(' ');
  if (parse_array[0] === 'Merge' && parse_array[1] === 'pull' && parse_array[2] === 'request') {
    return true;
  }
  return false;
}

// Generates the required changelog
function gen_changelog() {
  const gitlog = require('gitlog').default;

  // Gets the last 100 commit messages from git log
  const options = {
    repo: __dirname,
    number: 100,
    fields: ['subject'],
    execOptions: { maxBuffer: 1000 * 1024 },
  };

  let commits = gitlog(options);

  // A set that stores all the parsed ticket numbers
  let ticket_set = new Set();

  if (commits[0].subject.split(' ')[0] === 'Merge') {
    // Gets the version from package.json
    let version = require('../app/gui/package.json');

    let fs = require('file-system');

    const data = fs.readFileSync('CHANGELOG.md');

    // Wtites to the file CHANGELOG.MD
    const fd = fs.openSync('CHANGELOG.md', 'w+');

    // Gets today's date
    let todayDate = new Date().toISOString().slice(0, 10).toString();

    // Writing the current version and the current date
    let content = '';

    content += `# ${version.version} (${todayDate})` + `\n\n`;

    let ticketNumber = '';

    // Gets the ticket number from the commit message
    for (let i = 0; i < commits.length; i++) {
      if (commits[i].subject !== 'Updating the CHANGELOG.md and the _version file') {
        if (is_pull_request(commits[i].subject)) {
          ticketNumber = commits[i].subject.split(' ')[5].split('/')[2].split('-');
          ticketNumber = ticketNumber.slice(0, 2).join('-');
          ticket_set.add(ticketNumber);
        }
      } else {
        break;
      }
    }

    // Makes the link to JIRA and appends the ticket number to it
    for (let it = ticket_set.values(), val = null; val = it.next().value;) {
      let jira_link = `https://policyme.atlassian.net/browse/${val}`;
      content += `* ${jira_link}\n`;
      jira_link = '';
    }

    content += '\n\n';

    // Prepending tjhe new content to the file
    const insert = Buffer.alloc(content);
    fs.writeSync(fd, insert, 0, insert.length, 0);
    fs.writeSync(fd, data, 0, data.length, insert.length);
    fs.close(fd, (err) => {
      if (err) throw err;
    });
  }
}

gen_changelog();
