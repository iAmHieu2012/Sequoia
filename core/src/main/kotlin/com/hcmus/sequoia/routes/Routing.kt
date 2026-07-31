package com.hcmus.sequoia.routes

import com.hcmus.sequoia.models.*
import com.hcmus.sequoia.plugins.FirebaseConfig
import com.hcmus.sequoia.services.configureSeeder

import com.hcmus.sequoia.models.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.auth.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

fun Application.configureRouting() {
    val contentService = com.hcmus.sequoia.services.ContentService()
    val cosmosService = com.hcmus.sequoia.services.CosmosService()

    routing {
        get("/") {
            call.respondText("Sequoia Backend API is running!")
        }
        
        route("/api/v1") {
            get("/health") {
                call.respond(mapOf("status" to "ok", "service" to "sequoia-core"))
            }

            configureSeeder() // Uncomment this line to re-seed the database if needed

            // --- Textbooks ---
            get("/textbooks") {
                val textbooks = contentService.getTextbooks()
                call.respond(mapOf("data" to textbooks))
            }
            
            // --- Topics ---
            get("/topics") {
                val topics = contentService.getTopics()
                call.respond(mapOf("data" to topics))
            }
            
            get("/topics/{id}/articles") {
                val id = call.parameters["id"] ?: throw BadRequestException("Missing id parameter")
                val articles = contentService.getArticlesByTopic(id)
                call.respond(mapOf("data" to articles))
            }

            // --- Articles & Models ---
            get("/articles/standalone") {
                val articles = contentService.getStandaloneArticles()
                call.respond(mapOf("data" to articles))
            }
            
            get("/articles/search") {
                val query = call.request.queryParameters["q"]?.trim()
                if (query.isNullOrEmpty() || query.length < 2) {
                    throw BadRequestException("Search query must be at least 2 characters long")
                }
                
                val articles = contentService.searchArticles(query)
                call.respond(mapOf("data" to articles))
            }

            get("/articles/{slug}") {
                val slug = call.parameters["slug"] ?: throw BadRequestException("Missing slug parameter")
                val articleDetail = contentService.getArticleDetail(slug)
                    ?: throw NotFoundException("Article not found", mapOf("slug" to slug))
                call.respond(mapOf("data" to articleDetail))
            }
            
            get("/models/{id}") {
                val id = call.parameters["id"] ?: throw BadRequestException("Missing id parameter")
                val aiModel = contentService.getModel(id)
                    ?: throw NotFoundException("Model not found", mapOf("modelId" to id))
                call.respond(mapOf("data" to aiModel))
            }

            // --- Cosmos Domain ---
            get("/cosmos/maps/{mapId}") {
                val mapId = call.parameters["mapId"] ?: throw BadRequestException("Missing mapId parameter")
                val cosmosMap = cosmosService.getCosmosMap(mapId)
                    ?: throw NotFoundException("Cosmos Map not found", mapOf("mapId" to mapId))
                call.respond(mapOf("data" to cosmosMap))
            }

            authenticate {
                get("/users/progress") {
                    val user = call.principal<MyAuthenticatedUser>()
                    val userId = user?.id ?: throw UnauthorizedException("Invalid or expired token")
                    
                    val localDate = call.request.queryParameters["localDate"]
                    val progress = cosmosService.getUserProgress(userId, localDate)
                    call.respond(mapOf("data" to progress))
                }

                get("/users/progress/summary") {
                    val user = call.principal<MyAuthenticatedUser>()
                    val userId = user?.id ?: throw UnauthorizedException("Invalid or expired token")
                    
                    val summary = cosmosService.getProgressSummary(userId)
                    call.respond(mapOf("data" to summary))
                }

                post("/cosmos/progress/{mapId}/decode") {
                    val mapId = call.parameters["mapId"] ?: throw BadRequestException("Missing mapId parameter")
                    val user = call.principal<MyAuthenticatedUser>()
                    val userId = user?.id ?: throw UnauthorizedException("Invalid or expired token")

                    // Implementation stub for decode logic
                    call.respond(mapOf("message" to "Decode started for $mapId by user $userId"))
                }
            }

            // --- Protected Endpoints (Mocking Auth for now) ---
            post("/uploads/presigned-url") {
                call.respond(mapOf("message" to "Generate presigned URL (TODO - Requires Auth implementation)"))
            }
            get("/users/me") {
                call.respond(mapOf("message" to "Current user info (TODO - Requires Auth implementation)"))
            }
        }
    }
}