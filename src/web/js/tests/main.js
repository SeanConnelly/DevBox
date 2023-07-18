/*

TODO: Build a self test solution for the application

How?

The app has been design and built around events, so we can use the same events to test the app.

When launching the app, the URL will be checked for a query string parameter called "test" and if it exists, the app will run in test mode.

Test mode will run through a series of tests and log the results in the local store.

Some tests will require an F5 to test the app state, so the "test" parameter will be used to indicate the test stage to run.

The test runner can dump the log and results directly in its own console

The sequence would be something like

1. Build the app
2. Launch the app in docker where it will launch a browser in test mode
3. The test runner will run through the tests and log the results
4. For now a human will need to check the results and verify the build is good to push
5. In the future, we can automate these steps and alert the developer if the build is broken

Consider building a tiny test framework that is specific to this app, no need to shoe horn in a generic framework

Test coverage should include all events and all states, it should also cover all server side rest calls and responses

This should get to an 80% coverage of the app

A future 100% enhancement would be to screen shot the app at each stage and store the screen shots in the log and compare these to the last human verified screen shots,
but for now, we will just log the results and let a human verify the results and observe / check the app UI state before pushing the build

 */