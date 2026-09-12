# Telegram Bot — JavaScript Prototype

A compact JavaScript Telegram-bot experiment contained primarily in `Tel.js`.

## Purpose

The repository was used to explore event-driven bot development in JavaScript and basic Telegram API integration.

## Security and Configuration

`Tel.js` currently contains a token-shaped value directly in the source. Revoke that credential and refactor the script to read configuration from the environment before running or extending the prototype. Changing the current file alone does not remove the credential from Git history.

## Scope

This is a small learning/application prototype and is not one of the primary research repositories on this profile.


## Goal

The single-file prototype tests a webhook-style Telegram bot that forwards messages to a Gemini endpoint from a serverless `fetch` handler.

## Installation and Use

There is no package manifest because the script relies on Web Platform APIs supplied by its serverless runtime. Before deployment, revoke both credential-shaped values embedded in `Tel.js`, replace them with environment bindings such as `env.TELEGRAM_BOT_TOKEN` and `env.GEMINI_API_KEY`, and configure the handler in a compatible worker runtime.

Use a local emulator or staging worker to test the webhook before registering a production Telegram webhook. The current source must not be deployed with its committed credentials, and changing the latest commit does not remove those values from history.
