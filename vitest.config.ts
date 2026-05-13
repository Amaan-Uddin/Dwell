import { defineConfig, defineProject } from "vitest/config"
import path from "path"

const sharedConfig = {
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    }
}

export default defineConfig({
    test: {
        projects: [
            defineProject({
                test: {
                    name: "unit",
                    include: ["test/unit/**/*.test.ts"]
                },
                ...sharedConfig
            }),
            defineProject({
                test: {
                    name: "integration",
                    include: ["test/integration/*.test.ts"],
                    globalSetup: "test/globalSetup.ts",
                    pool: "forks"
                },
                ...sharedConfig
            }),
            defineProject({
                test: {
                    name: "service",
                    include: ["test/integration/service/*.test.ts"]
                },
                ...sharedConfig
            })
        ]
    },
})