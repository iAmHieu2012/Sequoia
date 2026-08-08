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
import io.ktor.server.request.*
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

            // configureSeeder() // Uncomment this line to re-seed the database if needed

            // --- Textbooks ---
            get("/textbooks") {
                val textbooks = contentService.getTextbooks()
                call.respond(mapOf("data" to textbooks))
            }

            get("/textbooks/{id}") {
                val id = call.parameters["id"] ?: throw BadRequestException("Missing id parameter")
                val textbook = contentService.getTextbook(id)
                    ?: throw NotFoundException("Textbook not found", mapOf("id" to id))
                call.respond(mapOf("data" to textbook))
            }
            
            // --- Topics ---
            get("/topics") {
                val topics = contentService.getTopics()
                call.respond(mapOf("data" to topics))
            }
            
            get("/topics/{id}/articles") {
                val id = call.parameters["id"] ?: throw BadRequestException("Missing id parameter")
                val articles = contentService.getArticlesByTopic(id, false)
                call.respond(mapOf("data" to articles))
            }

            // --- Articles & Models ---
            get("/articles/standalone") {
                val articles = contentService.getStandaloneArticles(false)
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

            get("/articles/{id}") {
                val id = call.parameters["id"] ?: throw BadRequestException("Missing id parameter")
                val articleDetail = contentService.getArticleDetail(id, false)
                    ?: throw NotFoundException("Article not found", mapOf("id" to id))
                call.respond(mapOf("data" to articleDetail))
            }
            
            // --- Admin endpoints ---
            authenticate {
                route("/admin") {
                    intercept(io.ktor.server.application.ApplicationCallPipeline.Call) {
                        val user = call.principal<MyAuthenticatedUser>()
                        if (user?.isAdmin != true) {
                            call.respond(io.ktor.http.HttpStatusCode.Forbidden, mapOf("error" to "Admin privileges required"))
                            finish()
                        }
                    }

                    post("/articles") {
                        val requestParams = call.receive<CreateArticleRequest>()
                        
                        val article = contentService.createArticle(requestParams.id, requestParams.title, requestParams.topicId ?: "", requestParams.summary, requestParams.content, requestParams.tags, requestParams.x, requestParams.y, requestParams.connections, requestParams.celestialType, requestParams.isPublished)
                        call.respond(mapOf("data" to article))
                    }
                    
                    post("/topics") {
                        val requestParams = call.receive<CreateTopicRequest>()
                        
                        val topic = contentService.createTopic(requestParams.id, requestParams.name, requestParams.description, requestParams.sortOrder)
                        call.respond(mapOf("data" to topic))
                    }
                    
                    post("/models") {
                        val requestParams = call.receive<CreateModelRequest>()
                        
                        val model = contentService.createModel(requestParams.id, requestParams.name, requestParams.description, requestParams.taskType, requestParams.fileUrl, requestParams.metadataUrl, requestParams.version, requestParams.format, requestParams.fileSizeBytes)
                        call.respond(mapOf("data" to model))
                    }
                    
                    post("/textbooks") {
                        val requestParams = call.receive<CreateTextbookRequest>()
                        
                        val textbook = contentService.createTextbook(requestParams.id, requestParams.title, requestParams.description, requestParams.authors, requestParams.coverImageUrl, requestParams.pdfUrl, requestParams.sortOrder)
                        call.respond(mapOf("data" to textbook))
                    }
                    
                    get("/articles/standalone") {
                        val articles = contentService.getStandaloneArticles(true)
                        call.respond(mapOf("data" to articles))
                    }
                    
                    get("/topics/{id}/articles") {
                        val id = call.parameters["id"] ?: throw BadRequestException("Missing id parameter")
                        val articles = contentService.getArticlesByTopic(id, true)
                        call.respond(mapOf("data" to articles))
                    }
                    
                    get("/articles/{id}") {
                        val id = call.parameters["id"] ?: throw BadRequestException("Missing id parameter")
                        val articleDetail = contentService.getArticleDetail(id, true)
                            ?: throw NotFoundException("Article not found", mapOf("id" to id))
                        call.respond(mapOf("data" to articleDetail))
                    }
                    
                    delete("/articles/{id}") {
                        val id = call.parameters["id"] ?: throw BadRequestException("Missing id")
                        contentService.deleteArticle(id)
                        call.respond(mapOf("success" to true))
                    }
                    delete("/topics/{id}") {
                        val id = call.parameters["id"] ?: throw BadRequestException("Missing id")
                        contentService.deleteTopic(id)
                        call.respond(mapOf("success" to true))
                    }
                    delete("/models/{id}") {
                        val id = call.parameters["id"] ?: throw BadRequestException("Missing id")
                        contentService.deleteModel(id)
                        call.respond(mapOf("success" to true))
                    }
                    delete("/textbooks/{id}") {
                        val id = call.parameters["id"] ?: throw BadRequestException("Missing id")
                        contentService.deleteTextbook(id)
                        call.respond(mapOf("success" to true))
                    }
                    
                    put("/cosmos/maps/{mapId}") {
                        val mapId = call.parameters["mapId"] ?: throw BadRequestException("Missing mapId")
                        val requestParams = call.receive<UpdateMapNodesRequest>()
                        
                        val success = contentService.updateMapNodes(mapId, requestParams.nodes)
                        if (success) {
                            call.respond(mapOf("success" to true))
                        } else {
                            throw NotFoundException("Map not found", mapOf("mapId" to mapId))
                        }
                    }
                }
            }
            
            get("/models") {
                val models = contentService.getModels()
                call.respond(mapOf("data" to models))
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

                post("/articles/{articleId}/progress") {
                    val articleId = call.parameters["articleId"] ?: throw BadRequestException("Missing articleId parameter")
                    val user = call.principal<MyAuthenticatedUser>()
                    val userId = user?.id ?: throw UnauthorizedException("Invalid or expired token")
                    
                    val requestParams = call.receive<Map<String, Boolean>>()
                    val completed = requestParams["completed"] ?: true

                    val newStatus = cosmosService.toggleArticleCompletion(userId, articleId, completed)
                    call.respond(mapOf("data" to ProgressResponse(articleId, newStatus)))
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