#!/usr/bin/env node
const { spawnSync } = require("node:child_process")
const path = require("node:path")
const result = spawnSync("python3", [path.join(__dirname, "build_practice_bank.py")], { stdio: "inherit" })
process.exit(result.status ?? 1)
