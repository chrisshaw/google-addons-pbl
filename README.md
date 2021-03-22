# Project-based learning add-ons for Google Classroom and Google Workspace

This monorepo hosts all projects for add-ons to support project-based learning using only Google Classroom and Google Workspace Add-ons

## What's in here

This repo consists of 3 apps:

### Project Planner

**No New Apps.** Rather than forcing teachers to give us Google Docs and Google Sheets, let's superpower them. The Project Planner allows you to create rigorous project-based learning unit plans, assignments, and rubrics using pedagogical best practices. It then integrates with Google Classroom to allow you to publish these projects as Assignments and assess assignments using the Gradebook if you'd like.

### Storyboard

Okay, Docs and Sheets just can't do _everything_. The Storyboard is a small goal-setting and tracking app with some portfolio features meant to support classrooms using personalized (and often project-based) learning. It uses a pluggable evidence tracker to automatically find evidence of skill or progress and then makes progress visual, supporting

## Usage

These add-ons were installed by schools as private add-ons. To install them yourself, [follow Google's guide for publishing add-ons](https://developers.google.com/workspace/add-ons/how-tos/publish-add-on-overview#publish_your_add-on).

The Storyboard depends on the evidence tracker. The you must BYO tracker plugins and they must be configured in code, so go grab someone technical on your team. Without it, though, you can still manually track skills and progress using built-in Google Sheets integration.

### Google Editor templates

> @todo
 
These projects use on configurable Google Docs and Sheets templates. You can make your own or use the following public defaults.

## Development

This repository uses npm Workspaces to manage packages. Run `npm install` from the root to link to other local (hoisted) packages.

### Build

To build the Storyboard, run the scripts in `storyboard-gas`.
