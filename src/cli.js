'use strict';

import nibbler from './nibbler';
import * as fmt from './config/formatters';
import chalk from 'chalk';
import inquirer from 'inquirer';
import options from './config/options';
import { version } from '../package.json';

let cli = {

  execute: function (args) {
    let currentOptions,
        files,
        extensions;

    // Parse options
    try {
      currentOptions = options.parse(args);
      files = currentOptions._;
      extensions = currentOptions.ext;
    } catch (error) {
      console.error(error.message);
      return 1;
    }

    // Decide what to do based on options
    if (currentOptions.version) {
      // Show version from package.json
      console.log('v' + version);
    } else if (currentOptions.help || (!files.length)) {
      // Show help
      console.log(options.generateHelp());
    } else {
      nibbler.setExtensions(extensions);
      let report = nibbler.nibbleOnFiles(files);
      if (report && (report.errorCount > 0 || report.warningCount > 0)) {
        // Check if there was a fatal error
        let fatalReport = nibbler.getFatalResults(report);
        if (fatalReport) {
          let errors = nibbler.getFormattedResults(fatalReport, 'stylish');
          console.log(errors);
          console.error('Fatal error(s) were detected.  Please correct and try again.');
          return 1;
        }
        // Show stats
        let stats = nibbler.getFormattedResults(report, fmt.stats);
        console.log(stats);

        // Show summary
        let summary = nibbler.getFormattedResults(report, fmt.summary);
        console.log(summary);
      // No report or not any errors or warnings
      } else {
        console.log(chalk.green('Great job, all lint rules passed.'));
        return 0;
      }
    }
    return 0;
  }
};

module.exports = cli;
