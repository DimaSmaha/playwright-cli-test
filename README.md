# Playwright CLI Test

All generated with playwright-cli.

## Installation

Install Playwright CLI globally:

```bash
npm install -g @playwright/cli@latest
```

Check available commands:

```bash
playwright-cli --help
```

## Installing skills

Claude Code, GitHub Copilot and others will use the locally installed skills.

```bash
playwright-cli install --skills
```

Install Playwright best practices skill:

```bash
npx skills add https://github.com/currents-dev/playwright-best-practices-skill --skill playwright-best-practices
```

## Skills-less operation

Point your agent at the CLI and let it cook. It will read the skill from `playwright-cli --help` on its own.

Example prompt:

Test the "add todo" flow on https://demo.playwright.dev/todomvc using playwright-cli.
Check playwright-cli --help for available commands.

## My chat history

- Using the playwright cli. Open the website https://www.saucedemo.com/, login inside and define e2e test.
- can you do it headed
- can you please login, and define the e2e scenario for the user flow for this website, and do all of this headed
- can you make a screenshot of the success order verification

## Chat prompt examples

Use these messages as examples when asking your agent for playwright best practices skill:

- implement the POM for the existing test
- now can you please improve extract fixtures. Create a PageFactory that will be passed to the test parameter like {pages} and we access to the page like pages.page
- now can you please again explore the website in the headed mode, and expand the test coverage, add 3 more positive critical scenarios and 1 negative critical scenario, but dont use the login page for any of this, make some flows after login
- can you make it headed pls
- can you remake this test file onto 3 separate test files and use POM for tests
