#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const simpleGit = require('simple-git');
const moment = require('moment');

program
  .option('-p, --path <path>', 'Path to Git repository', '.')
  .option('-s, --since <date>', 'Generate notes since this date (YYYY-MM-DD)')
  .parse(process.argv);

const options = program.opts();

const git = simpleGit(options.path);

async function generateReleaseNotes() {
  try {
    let commits;
    if (options.since) {
      const sinceDate = moment(options.since).format('YYYY-MM-DD');
      commits = await git.log({ from: sinceDate });
    } else {
      commits = await git.log({ maxCount: 50 });
    }

    const features = [];
    const bugfixes = [];
    const others = [];

    commits.all.forEach(commit => {
      const message = commit.message.split('\n')[0].trim();
      if (message.startsWith('feat:')) {
        features.push(message.slice(5).trim());
      } else if (message.startsWith('fix:')) {
        bugfixes.push(message.slice(4).trim());
      } else {
        others.push(message);
      }
    });

    console.log('Release Notes\n');
    console.log('New Features:');
    features.forEach(feature => console.log(`- ${feature}`));

    console.log('\nBug Fixes:');
    bugfixes.forEach(bugfix => console.log(`- ${bugfix}`));

    console.log('\nOther Changes:');
    others.forEach(other => console.log(`- ${other}`));
  } catch (error) {
    console.error('Error generating release notes:', error);
  }
}

generateReleaseNotes();