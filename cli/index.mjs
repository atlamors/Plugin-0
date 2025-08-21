#!/usr/bin/env node
import { Command } from "commander"
import { newCmd } from "./new.mjs"
import { linkCmd } from "./link.mjs"
import { doctorCmd } from "./doctor.mjs"

const program = new Command()
program.name("plugin0").description("Medusa Plugin-0 Toolkit")

program
    .command("new")
    .argument("<name>", "plugin name")
    .option("--no-install", "skip pnpm install")
    .action(newCmd)

program.command("link").action(linkCmd)
program.command("doctor").action(doctorCmd)

program.parseAsync()



