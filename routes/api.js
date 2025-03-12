'use strict';

const issues = {}; // In-memory storage for issues

module.exports = function (app) {

  app.route('/api/issues/:project')

      .get(function (req, res) {
        const project = req.params.project;
        const filters = req.query;
        const projectIssues = issues[project] || [];
        const filteredIssues = projectIssues.filter(issue => {
          return Object.keys(filters).every(key => issue[key] == filters[key]);
        });
        res.json(filteredIssues);
      })

      .post(function (req, res) {
        const project = req.params.project;
        const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;
        if (!issue_title || !issue_text || !created_by) {
          return res.json({ error: 'required field(s) missing' });
        }
        const newIssue = {
          _id: new Date().getTime().toString(),
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
          created_on: new Date(),
          updated_on: new Date(),
          open: true
        };
        issues[project] = issues[project] || [];
        issues[project].push(newIssue);
        res.json(newIssue);
      })

      .put(function (req, res) {
        const project = req.params.project;
        const { _id, ...updateFields } = req.body;
        if (!_id) {
          return res.json({ error: 'missing _id' });
        }
        if (Object.keys(updateFields).length === 0) {
          return res.json({ error: 'no update field(s) sent', _id });
        }
        const projectIssues = issues[project] || [];
        const issue = projectIssues.find(issue => issue._id === _id);
        if (!issue) {
          return res.json({ error: 'could not update', _id });
        }
        Object.keys(updateFields).forEach(key => {
          if (updateFields[key]) {
            issue[key] = updateFields[key];
          }
        });
        issue.updated_on = new Date();
        res.json({ result: 'successfully updated', _id });
      })

      .delete(function (req, res) {
        const project = req.params.project;
        const { _id } = req.body;
        if (!_id) {
          return res.json({ error: 'missing _id' });
        }
        const projectIssues = issues[project] || [];
        const issueIndex = projectIssues.findIndex(issue => issue._id === _id);
        if (issueIndex === -1) {
          return res.json({ error: 'could not delete', _id });
        }
        projectIssues.splice(issueIndex, 1);
        res.json({ result: 'successfully deleted', _id });
      });
};
