# Contributing to the Ludiverbia project
If you like this project and want to make it better, please help out. It could
be as simple as sending [@donkirkby] a nice note on Twitter, you could report a
bug, or pitch in with some development work. Check if there are some issues
labeled as [good first issues] or [help wanted].

[@donkirkby]: https://twitter.com/donkirkby
[good first issues]: https://github.com/donkirkby/halfabet/labels/good%20first%20issue
[help wanted]: https://github.com/donkirkby/halfabet/labels/help%20wanted

## Bug Reports and Enhancement Requests
Please create issue descriptions [on GitHub][issues]. Be as specific as possible.
Which version are you using? What did you do? What did you expect to happen? Are
you planning to submit your own fix in a pull request?

[issues]: https://github.com/donkirkby/halfabet/issues?state=open

## Development environment
The source code is in the `src` folder. You can run the tests with `npm test`,
and run it in developer mode with `npm start`. To build a new release, run
`npm run build`, and that will copy all the production files into
`docs`. GitHub pages serve from `docs`, so pushing the new files
publishes the new release.

Try testing Jekyll [locally]. After everything is installed, launch the server
with this command:

    ./serve.sh

To debug the tests, open a Chrome tab, and type `chrome://inspect` in the
address bar. Then click on the link to open dedicated devtools for Node. Add a
`debugger;` call to your code where you want to debug. Finally, run the tests
with this command:

    npm run test:debug

Once the browser has stopped in a file, you can remove the `debugger;` call and
use regular breakpoints.

[locally]: https://help.github.com/en/github/working-with-github-pages/testing-your-github-pages-site-locally-with-jekyll

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
