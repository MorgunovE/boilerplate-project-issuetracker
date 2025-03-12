const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { suite, test, before } = require('mocha');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let testId;

    before(function(done) {
        // Ensure server is ready
        chai.request(server)
            .get('/')
            .end(function(err, res) {
                done();
            });
    });

    before(function(done) {
        // Create a test project and issue
        chai.request(server)
            .post('/api/issues/test')
            .send({
                issue_title: 'Test Issue',
                issue_text: 'Test Text',
                created_by: 'Test Creator'
            })
            .end(function(err, res) {
                done();
            });
    });

    test('Create an issue with every field', function(done) {
        chai.request(server)
            .post('/api/issues/test')
            .send({
                issue_title: 'Title',
                issue_text: 'Text',
                created_by: 'Creator',
                assigned_to: 'Assignee',
                status_text: 'Status'
            })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, 'Title');
                assert.equal(res.body.issue_text, 'Text');
                assert.equal(res.body.created_by, 'Creator');
                assert.equal(res.body.assigned_to, 'Assignee');
                assert.equal(res.body.status_text, 'Status');
                testId = res.body._id;
                done();
            });
    });

    test('Create an issue with only required fields', function(done) {
        chai.request(server)
            .post('/api/issues/test')
            .send({
                issue_title: 'Title',
                issue_text: 'Text',
                created_by: 'Creator'
            })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, 'Title');
                assert.equal(res.body.issue_text, 'Text');
                assert.equal(res.body.created_by, 'Creator');
                assert.equal(res.body.assigned_to, '');
                assert.equal(res.body.status_text, '');
                done();
            });
    });

    test('Create an issue with missing required fields', function(done) {
        chai.request(server)
            .post('/api/issues/test')
            .send({
                issue_title: 'Title'
            })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'required field(s) missing');
                done();
            });
    });

    test('View issues on a project', function(done) {
        chai.request(server)
            .get('/api/issues/test')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
    });

    test('View issues on a project with one filter', function(done) {
        chai.request(server)
            .get('/api/issues/test')
            .query({ open: true })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
    });

    test('View issues on a project with multiple filters', function(done) {
        chai.request(server)
            .get('/api/issues/test')
            .query({ open: true, created_by: 'Creator' })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
    });

    test('Update one field on an issue', function(done) {
        chai.request(server)
            .put('/api/issues/test')
            .send({ _id: testId, issue_title: 'New Title' })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully updated');
                assert.equal(res.body._id, testId);
                done();
            });
    });

    test('Update multiple fields on an issue', function(done) {
        chai.request(server)
            .put('/api/issues/test')
            .send({ _id: testId, issue_title: 'New Title', issue_text: 'New Text' })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully updated');
                assert.equal(res.body._id, testId);
                done();
            });
    });

    test('Update an issue with missing _id', function(done) {
        chai.request(server)
            .put('/api/issues/test')
            .send({ issue_title: 'New Title' })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'missing _id');
                done();
            });
    });

    test('Update an issue with no fields to update', function(done) {
        chai.request(server)
            .put('/api/issues/test')
            .send({ _id: testId })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'no update field(s) sent');
                assert.equal(res.body._id, testId);
                done();
            });
    });

    test('Update an issue with an invalid _id', function(done) {
        chai.request(server)
            .put('/api/issues/test')
            .send({ _id: 'invalid_id', issue_title: 'New Title' })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'could not update');
                assert.equal(res.body._id, 'invalid_id');
                done();
            });
    });

    test('Delete an issue', function(done) {
        chai.request(server)
            .delete('/api/issues/test')
            .send({ _id: testId })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully deleted');
                assert.equal(res.body._id, testId);
                done();
            });
    });

    test('Delete an issue with an invalid _id', function(done) {
        chai.request(server)
            .delete('/api/issues/test')
            .send({ _id: 'invalid_id' })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'could not delete');
                assert.equal(res.body._id, 'invalid_id');
                done();
            });
    });

    test('Delete an issue with missing _id', function(done) {
        chai.request(server)
            .delete('/api/issues/test')
            .send({})
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'missing _id');
                done();
            });
    });
});
