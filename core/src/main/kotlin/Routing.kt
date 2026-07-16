package com.hcmus

import com.hcmus.models.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

fun Application.configureRouting() {
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
                val textbooks = withContext(Dispatchers.IO) {
                    val snapshot = FirebaseConfig.firestore.collection("textbooks")
                        .orderBy("sortOrder")
                        .get()
                        .get()

                    snapshot.documents.map { doc ->
                        val textbook = doc.toObject(Textbook::class.java)
                        textbook.id = doc.id
                        textbook
                    }
                }
                call.respond(mapOf("data" to textbooks))
            }
            
            get("/textbooks/{id}/chapters") {
                val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest, "Missing id")
                val chapters = withContext(Dispatchers.IO) {
                    val snapshot = FirebaseConfig.firestore.collection("chapters")
                        .whereEqualTo("textbookId", id)
                        .orderBy("sortOrder")
                        .get()
                        .get()

                    snapshot.documents.map { doc ->
                        val chapter = doc.toObject(Chapter::class.java)
                        chapter.id = doc.id
                        chapter
                    }
                }
                call.respond(mapOf("data" to chapters))
            }
            
            get("/chapters/{id}/articles") {
                val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest, "Missing id")
                val articles = withContext(Dispatchers.IO) {
                    val snapshot = FirebaseConfig.firestore.collection("articles")
                        .whereEqualTo("chapterId", id)
                        .whereEqualTo("isPublished", true)
                        .get()
                        .get()

                    snapshot.documents.map { doc ->
                        val article = doc.toObject(Article::class.java)
                        article.id = doc.id
                        article
                    }
                }
                call.respond(mapOf("data" to articles))
            }

            // --- Topics ---
            get("/topics") {
                val topics = withContext(Dispatchers.IO) {
                    val snapshot = FirebaseConfig.firestore.collection("topics")
                        .orderBy("sortOrder")
                        .get()
                        .get()

                    snapshot.documents.map { doc ->
                        val topic = doc.toObject(Topic::class.java)
                        topic.id = doc.id
                        topic
                    }
                }
                call.respond(mapOf("data" to topics))
            }
            
            get("/topics/{id}/articles") {
                val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest, "Missing id")
                val articles = withContext(Dispatchers.IO) {
                    val snapshot = FirebaseConfig.firestore.collection("articles")
                        .whereEqualTo("topicId", id)
                        .whereEqualTo("isPublished", true)
                        .get()
                        .get()

                    snapshot.documents.map { doc ->
                        val article = doc.toObject(Article::class.java)
                        article.id = doc.id
                        article
                    }
                }
                call.respond(mapOf("data" to articles))
            }

            // --- Articles & Models ---
            get("/articles/{slug}") {
                val slug = call.parameters["slug"] ?: return@get call.respond(HttpStatusCode.BadRequest, "Missing slug")
                val article = withContext(Dispatchers.IO) {
                    val snapshot = FirebaseConfig.firestore.collection("articles")
                        .whereEqualTo("slug", slug)
                        .whereEqualTo("isPublished", true)
                        .limit(1)
                        .get()
                        .get()

                    snapshot.documents.firstOrNull()?.let { doc ->
                        val a = doc.toObject(Article::class.java)
                        a.id = doc.id
                        a
                    }
                }
                if (article != null) {
                    call.respond(mapOf("data" to article))
                } else {
                    call.respond(HttpStatusCode.NotFound, mapOf("error" to "Article not found"))
                }
            }
            
            get("/articles/search") {
                val query = call.request.queryParameters["q"] ?: ""
                val articles = withContext(Dispatchers.IO) {
                    // Simple local search for MVP. Production should use Algolia or Typesense.
                    val snapshot = FirebaseConfig.firestore.collection("articles")
                        .whereEqualTo("isPublished", true)
                        .get()
                        .get()

                    snapshot.documents.mapNotNull { doc ->
                        val article = doc.toObject(Article::class.java)
                        article.id = doc.id
                        if (article.title.contains(query, ignoreCase = true) || article.summary.contains(query, ignoreCase = true)) {
                            article
                        } else null
                    }
                }
                call.respond(mapOf("data" to articles))
            }
            
            get("/models/{id}") {
                val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest, "Missing id")
                val aiModel = withContext(Dispatchers.IO) {
                    val docRef = FirebaseConfig.firestore.collection("models").document(id)
                    val doc = docRef.get().get()
                    if (doc.exists()) {
                        val m = doc.toObject(AiModel::class.java)
                        m?.id = doc.id
                        m
                    } else null
                }
                if (aiModel != null) {
                    call.respond(mapOf("data" to aiModel))
                } else {
                    call.respond(HttpStatusCode.NotFound, mapOf("error" to "Model not found"))
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