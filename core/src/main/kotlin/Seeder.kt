package com.hcmus.sequoia

import com.google.cloud.firestore.SetOptions
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Exposes a dedicated endpoint for injecting dummy data into the Firestore emulator during development.
 * 
 * Comprehensive seed covering all schema requirements:
 * users, textbooks, chapters, topics, articles, models, cosmos_maps, cosmos_progress.
 */
fun Route.configureSeeder() {
    get("/seed-database") {
        withContext(Dispatchers.IO) {
            val db = FirebaseConfig.firestore
            
            // Clear existing data to ensure a clean slate
            val collectionsToClear = listOf(
                "users",
                "textbooks",
                "chapters",
                "articles",
                "topics",
                "models",
                "cosmos_maps",
                "cosmos_progress"
            )
            
            collectionsToClear.forEach { collectionName ->
                val docs = db.collection(collectionName).get().get().documents
                docs.forEach { it.reference.delete().get() }
            }
            
            val now = System.currentTimeMillis()

            // Seed Users
            val userId = "mock-user-123"
            db.collection("users").document(userId).set(
                mapOf(
                    "uid" to userId,
                    "email" to "test@sequoia.ai",
                    "displayName" to "Test User",
                    "photoUrl" to "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
                    "createdAt" to now,
                    "updatedAt" to now
                )
            ).get()

            // Seed Models (For Playground)
            val modelId = "yolo-v8-nano"
            db.collection("models").document(modelId).set(
                mapOf(
                    "id" to modelId,
                    "name" to "YOLOv8 Nano",
                    "description" to "Real-time object detection model optimized for edge devices.",
                    "taskType" to "object_detection",
                    "fileUrl" to "https://cdn.sequoia.ai/models/yolov8n.tflite",
                    "fileSizeBytes" to 3145728, // 3MB
                    "version" to "1.0",
                    "format" to "litert",
                    "defaultConfig" to mapOf(
                        "threshold" to 0.5,
                        "inputSize" to 320
                    ),
                    "createdAt" to now,
                    "updatedAt" to now
                )
            ).get()

            // Seed Textbook: Mathematics for Machine Learning
            val textbookId = "textbook_mml"
            val textbook = mapOf(
                "id" to textbookId, 
                "title" to "Mathematics for Machine Learning", 
                "description" to "The fundamental mathematical tools needed to understand machine learning.", 
                "authors" to listOf("Marc Peter Deisenroth", "A. Aldo Faisal", "Cheng Soon Ong"), 
                "coverImageUrl" to "https://cdn.sequoia.ai/covers/mml-book.jpg",
                "totalChapters" to 3, // Simplifying for seeder
                "sortOrder" to 1,
                "createdAt" to now,
                "updatedAt" to now
            )
            db.collection("textbooks").document(textbookId).set(textbook).get()

            // Seed Chapters
            val ch1Id = "chapter_mml_1"
            val ch2Id = "chapter_mml_2"
            val ch3Id = "chapter_mml_3"
            
            db.collection("chapters").document(ch1Id).set(
                mapOf(
                    "id" to ch1Id,
                    "textbookId" to textbookId,
                    "title" to "Linear Algebra",
                    "description" to "Concepts of vector spaces, matrices, and systems of linear equations.",
                    "sortOrder" to 1,
                    "articleCount" to 3,
                    "createdAt" to now
                )
            ).get()
            
            db.collection("chapters").document(ch2Id).set(
                mapOf(
                    "id" to ch2Id,
                    "textbookId" to textbookId,
                    "title" to "Analytic Geometry",
                    "description" to "Norms, inner products, lengths and distances, and orthogonal projections.",
                    "sortOrder" to 2,
                    "articleCount" to 2,
                    "createdAt" to now
                )
            ).get()
            
            db.collection("chapters").document(ch3Id).set(
                mapOf(
                    "id" to ch3Id,
                    "textbookId" to textbookId,
                    "title" to "Vector Calculus",
                    "description" to "Differentiation of univariate and multivariate functions, and gradients.",
                    "sortOrder" to 3,
                    "articleCount" to 1,
                    "createdAt" to now
                )
            ).get()

            // Seed Articles
            val articles = listOf(
                // Chapter 1: Linear Algebra
                mapOf(
                    "id" to "article_mml_1_1",
                    "title" to "Systems of Linear Equations",
                    "slug" to "systems-of-linear-equations",
                    "chapterId" to ch1Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Systems of Linear Equations\n\nA central part of linear algebra is the study of systems of linear equations.",
                    "summary" to "Introduction to linear equations and matrix representation.",
                    "tags" to listOf("math", "linear-algebra"),
                    "playgroundBlocks" to emptyList<Any>(),
                    "createdAt" to now,
                    "updatedAt" to now,
                    "publishedAt" to now
                ),
                mapOf(
                    "id" to "article_mml_1_2",
                    "title" to "Matrices",
                    "slug" to "matrices",
                    "chapterId" to ch1Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Matrices\n\nMatrices are fundamental to machine learning because they allow us to represent data efficiently.",
                    "summary" to "Matrix operations and their properties.",
                    "tags" to listOf("math", "linear-algebra", "matrices"),
                    "playgroundBlocks" to emptyList<Any>(),
                    "createdAt" to now,
                    "updatedAt" to now,
                    "publishedAt" to now
                ),
                mapOf(
                    "id" to "article_mml_1_3",
                    "title" to "Solving Systems of Linear Equations",
                    "slug" to "solving-systems-of-linear-equations",
                    "chapterId" to ch1Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Solving Systems\n\nGaussian elimination is an algorithm for solving systems of linear equations.",
                    "summary" to "Algorithms for finding solutions to linear systems.",
                    "tags" to listOf("math", "linear-algebra", "algorithms"),
                    "playgroundBlocks" to emptyList<Any>(),
                    "createdAt" to now,
                    "updatedAt" to now,
                    "publishedAt" to now
                ),
                // Chapter 2: Analytic Geometry
                mapOf(
                    "id" to "article_mml_2_1",
                    "title" to "Norms",
                    "slug" to "norms",
                    "chapterId" to ch2Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Norms\n\nA norm is a function that assigns a strictly positive length or size to each vector in a vector space.",
                    "summary" to "Measuring the length of vectors.",
                    "tags" to listOf("math", "geometry", "norms"),
                    "playgroundBlocks" to emptyList<Any>(),
                    "createdAt" to now,
                    "updatedAt" to now,
                    "publishedAt" to now
                ),
                mapOf(
                    "id" to "article_mml_2_2",
                    "title" to "Inner Products",
                    "slug" to "inner-products",
                    "chapterId" to ch2Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Inner Products\n\nInner products allow the introduction of intuitive geometrical concepts, such as the length of a vector and the angle between two vectors.",
                    "summary" to "Geometrical concepts in vector spaces.",
                    "tags" to listOf("math", "geometry"),
                    "playgroundBlocks" to emptyList<Any>(),
                    "createdAt" to now,
                    "updatedAt" to now,
                    "publishedAt" to now
                ),
                // Chapter 3: Vector Calculus
                mapOf(
                    "id" to "article_mml_3_1",
                    "title" to "Gradients",
                    "slug" to "gradients",
                    "chapterId" to ch3Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Gradients\n\nThe gradient represents the slope of the tangent of the graph of the function. It points in the direction of the greatest rate of increase of the function.",
                    "summary" to "Multivariate differentiation and gradients.",
                    "tags" to listOf("math", "calculus", "optimization"),
                    "playgroundBlocks" to emptyList<Any>(),
                    "createdAt" to now,
                    "updatedAt" to now,
                    "publishedAt" to now
                )
            )
            
            articles.forEach { article ->
                val slug = article["slug"] as String
                db.collection("articles").document(slug).set(article).get()
            }

            // Seed a Topic (Free Nebula) for the Nebulas tab
            val cvTopicId = "topic_cv"
            val cvTopic = mapOf(
                "id" to cvTopicId,
                "name" to "Computer Vision",
                "description" to "Exploring visual data understanding algorithms and architectures.",
                "iconUrl" to "https://cdn.sequoia.ai/icons/cv.png",
                "articleCount" to 1,
                "sortOrder" to 1,
                "createdAt" to now
            )
            db.collection("topics").document(cvTopicId).set(cvTopic).get()

            // Seed Topic Articles (Free Nebulas)
            val cvArticles = listOf(
                mapOf(
                    "id" to "article_cv_1",
                    "title" to "Image Classification Basics",
                    "slug" to "image-classification",
                    "topicId" to cvTopicId,
                    "isPublished" to true,
                    "content" to "## Image Classification\n\nImage classification is the task of assigning a label to an entire image.",
                    "summary" to "An introduction to classifying images.",
                    "tags" to listOf("cv", "classification"),
                    "playgroundBlocks" to emptyList<Any>(),
                    "createdAt" to now,
                    "updatedAt" to now,
                    "publishedAt" to now
                )
            )
            cvArticles.forEach { article ->
                val slug = article["slug"] as String
                db.collection("articles").document(slug).set(article).get()
            }

            // Seed Rogue Anomalies
            val rogueId = "papers"
            val rogueArticlesData = listOf(
                mapOf(
                    "id" to "article_rogue_attention",
                    "title" to "Attention Is All You Need",
                    "slug" to "attention-paper",
                    "topicId" to rogueId,
                    "isPublished" to true,
                    "content" to "## Attention Is All You Need\n\nThis 2017 paper introduced the Transformer architecture.",
                    "summary" to "A breakdown of the Transformer architecture and self-attention mechanisms.",
                    "tags" to listOf("paper", "nlp", "transformers"),
                    "playgroundBlocks" to emptyList<Any>(),
                    "createdAt" to now,
                    "updatedAt" to now,
                    "publishedAt" to now
                ),
                mapOf(
                    "id" to "article_rogue_resnet",
                    "title" to "Deep Residual Learning",
                    "slug" to "resnet-paper",
                    "topicId" to rogueId,
                    "isPublished" to true,
                    "content" to "## Deep Residual Learning\n\nResNet solves the vanishing gradient problem in ultra-deep networks.",
                    "summary" to "Understanding skip connections and how ResNet enables training of extremely deep networks.",
                    "tags" to listOf("paper", "cv", "resnet"),
                    "playgroundBlocks" to emptyList<Any>(),
                    "createdAt" to now,
                    "updatedAt" to now,
                    "publishedAt" to now
                )
            )
            rogueArticlesData.forEach { article ->
                val slug = article["slug"] as String
                db.collection("articles").document(slug).set(article).get()
            }

            // Seed Cosmos Maps
            val mapNodes = listOf(
                // Chapter 1: Linear Algebra
                mapOf(
                    "articleId" to "systems-of-linear-equations",
                    "title" to "Systems of Linear Equations",
                    "celestialType" to "star",
                    "x" to 4500.0,
                    "y" to 4800.0,
                    "connections" to listOf("matrices")
                ),
                mapOf(
                    "articleId" to "matrices",
                    "title" to "Matrices",
                    "celestialType" to "binary_star",
                    "x" to 5000.0,
                    "y" to 4500.0,
                    "connections" to listOf("solving-systems-of-linear-equations")
                ),
                mapOf(
                    "articleId" to "solving-systems-of-linear-equations",
                    "title" to "Solving Systems",
                    "celestialType" to "star",
                    "x" to 5200.0,
                    "y" to 5000.0,
                    "connections" to emptyList<String>()
                ),
                // Chapter 2: Analytic Geometry
                mapOf(
                    "articleId" to "norms",
                    "title" to "Norms",
                    "celestialType" to "star",
                    "x" to 7200.0,
                    "y" to 2800.0,
                    "connections" to listOf("inner-products")
                ),
                mapOf(
                    "articleId" to "inner-products",
                    "title" to "Inner Products",
                    "celestialType" to "star",
                    "x" to 7000.0,
                    "y" to 2000.0,
                    "connections" to emptyList<String>()
                ),
                // Chapter 3: Vector Calculus
                mapOf(
                    "articleId" to "gradients",
                    "title" to "Gradients",
                    "celestialType" to "star",
                    "x" to 3000.0,
                    "y" to 7500.0,
                    "connections" to emptyList<String>()
                )
            )
            val cvTopicNodes = listOf(
                mapOf(
                    "articleId" to "image-classification",
                    "title" to "Image Classification Basics",
                    "celestialType" to "nebula",
                    "x" to 7500.0,
                    "y" to 2500.0,
                    "connections" to emptyList<String>()
                )
            )

            val rogueNodes = listOf(
                mapOf(
                    "articleId" to "attention-paper",
                    "title" to "Attention Is All You Need",
                    "celestialType" to "anomaly",
                    "x" to 8000.0,
                    "y" to 3000.0,
                    "connections" to listOf("resnet-paper")
                ),
                mapOf(
                    "articleId" to "resnet-paper",
                    "title" to "Deep Residual Learning",
                    "celestialType" to "anomaly",
                    "x" to 8500.0,
                    "y" to 4000.0,
                    "connections" to emptyList<String>()
                )
            )
            
            val cosmosMap = mapOf(
                "id" to textbookId,
                "mapType" to "textbook",
                "theme" to "cosmos",
                "nodes" to mapNodes
            )
            db.collection("cosmos_maps").document(textbookId).set(cosmosMap).get()

            val cvMap = mapOf(
                "id" to cvTopicId,
                "mapType" to "topic",
                "theme" to "nebula",
                "nodes" to cvTopicNodes
            )
            db.collection("cosmos_maps").document(cvTopicId).set(cvMap).get()

            val rogueMap = mapOf(
                "id" to rogueId,
                "mapType" to "rogue_anomalies",
                "theme" to "nebula",
                "nodes" to rogueNodes
            )
            db.collection("cosmos_maps").document(rogueId).set(rogueMap).get()

            // Seed Cosmos Progress
            val progressMap = mapOf(
                "systems-of-linear-equations" to "decoded",
                "matrices" to "decoded",
                "solving-systems-of-linear-equations" to "decoded",
                "norms" to "decoding",
                "inner-products" to "locked",
                "gradients" to "locked"
            )
            
            val cosmosProgress = mapOf(
                "id" to "${userId}_$textbookId",
                "userId" to userId,
                "mapId" to textbookId,
                "progressMap" to progressMap
            )
            db.collection("cosmos_progress").document("${userId}_$textbookId").set(cosmosProgress).get()

            val topicProgress = mapOf(
                "id" to "${userId}_$rogueId",
                "userId" to userId,
                "mapId" to rogueId,
                "progressMap" to mapOf(
                    "attention-paper" to "decoded",
                    "resnet-paper" to "decoding"
                )
            )
            db.collection("cosmos_progress").document("${userId}_$rogueId").set(topicProgress).get()
        }
        
        call.respondText("Database wiped and seeded with comprehensive English real-world data!")
    }
}
