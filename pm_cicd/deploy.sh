if [ "$TRAVIS_BRANCH" == "feature/ST-1234-Testing" ]; then

    run_test(){
    # Run the jest unit tests
        cd app/gui 
    # Installing the node dependency 
        npm install
    # Run the test command
        npm run test 
        }

    run_test
fi

if [ "$TRAVIS_BRANCH" == "develop" ]; then

    # Bumps the version
    node pm_cicd/bump_dev_version.js

    # Generates the changelog 
    node pm_cicd/generate_changelog.js
  
    commit_file() {
      git add *
      git commit --message "Updating the CHANGELOG.md and the _version file"
    }

    upload_files() {
      git remote add develop  https://${TOKEN}@github.com/policyme/${REPO_NAME}.js.git > /dev/null 2>&1
      git push develop HEAD:develop
    }

    commit_file
    upload_files

fi