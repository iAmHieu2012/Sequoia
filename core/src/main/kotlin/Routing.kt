package com.hcmus

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    routing {
        get("/") {
            call.respondText("Sequoia Backend API is running!")
        }
        
        route("/api/v1") {
            get("/health") {
                call.respond(mapOf("status" to "ok", "service" to "sequoia-core"))
            }

            // --- Textbooks ---
            get("/textbooks") {
                call.respond(mapOf("message" to "List of textbooks (TODO)"))
            }
            get("/textbooks/{id}/chapters") {
                val id = call.parameters["id"]
                call.respond(mapOf("message" to "Chapters for textbook $id (TODO)"))
            }
            get("/chapters/{id}/articles") {
                val id = call.parameters["id"]
                call.respond(mapOf("message" to "Articles for chapter $id (TODO)"))
            }

            // --- Topics ---
            get("/topics") {
                call.respond(mapOf("message" to "List of topics (TODO)"))
            }
            get("/topics/{id}/articles") {
                val id = call.parameters["id"]
                call.respond(mapOf("message" to "Articles for topic $id (TODO)"))
            }

            // --- Articles & Models ---
            get("/articles/{slug}") {
                val slug = call.parameters["slug"]
                call.respond(mapOf("message" to "Article details for $slug (TODO)"))
            }
            get("/articles/search") {
                val query = call.request.queryParameters["q"]
                call.respond(mapOf("message" to "Search results for $query (TODO)"))
            }
            get("/models/{id}") {
                val id = call.parameters["id"]
                call.respond(mapOf("message" to "Model details for $id (TODO)"))
            }

            // --- Protected Endpoints (Mocking Auth for now) ---
            post("/uploads/presigned-url") {
                call.respond(mapOf("message" to "Generate presigned URL (TODO - Requires Auth)"))
            }
            get("/users/me") {
                call.respond(mapOf("message" to "Current user info (TODO - Requires Auth)"))
            }
        }
    }
}