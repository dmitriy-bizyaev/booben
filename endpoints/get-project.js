const path = require('path');
const config = require('../config');
const helpers = require('./helpers');
const constants = require('../common/constants');
const sharedConstants = require('../shared/constants');

const projectsDir = config.get('projectsDir');
const env = config.get('env');

module.exports = {
  url: `${sharedConstants.URL_API_PREFIX}/projects/:name`,
  method: 'get',
  handlers: [
    (req, res) => {
      const name = req.params.name;

      if (!constants.PROJECT_NAME_REGEX.test(name)) {
        helpers.sendError(res, 400, 'Invalid project name');
        return;
      }

      const options = {
        root: path.join(projectsDir, name),
      };

      res.sendFile(constants.PROJECT_FILE, options, err => {
        if (err) {
          let message;
          if (err.code === 'ENOENT') message = 'Project not found';
          else if (env === 'production') message = 'Server error';
          else message = err.message;

          if (err) helpers.sendError(res, err.status, message);
        }
      });
    },
  ],
};
