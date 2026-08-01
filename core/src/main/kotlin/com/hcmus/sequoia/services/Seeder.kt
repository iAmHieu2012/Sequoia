package com.hcmus.sequoia.services

import com.hcmus.sequoia.models.*
import com.hcmus.sequoia.plugins.FirebaseConfig

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
 * users, textbooks, topics, articles, models, cosmos_maps, user_progress.
 */
fun Route.configureSeeder() {
    get("/seed-database") {
        withContext(Dispatchers.IO) {
            val db = FirebaseConfig.firestore
            
            // Clear existing data to ensure a clean slate
            val collectionsToClear = listOf(
                "users",
                "textbooks",
                "articles",
                "article_contents",
                "topics",
                "models",
                "cosmos_maps",
                "user_progress"
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
            val modelsToSeed: List<Map<String, Any>> = listOf(
                mapOf(
                    "id" to "yolov8n-detect",
                    "name" to "YOLOv8 Nano (Detect)",
                    "description" to "Real-time object detection model optimized for edge devices.",
                    "taskType" to "object_detection",
                    "fileUrl" to "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-detect/model.tflite",
                    "metadataUrl" to "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-detect/metadata.json",
                    "fileSizeBytes" to 12841243L,
                    "version" to "1.0",
                    "format" to "litert"
                ),
                mapOf(
                    "id" to "yolov8n-cls",
                    "name" to "YOLOv8 Nano (Classify)",
                    "description" to "Image classification model for edge devices.",
                    "taskType" to "image_classification",
                    "fileUrl" to "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-cls/model.tflite",
                    "metadataUrl" to "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-cls/metadata.json",
                    "fileSizeBytes" to 10917171L,
                    "version" to "1.0",
                    "format" to "litert"
                ),
                mapOf(
                    "id" to "yolov8n-pose",
                    "name" to "YOLOv8 Nano (Pose)",
                    "description" to "Real-time human pose estimation model.",
                    "taskType" to "pose_estimation",
                    "fileUrl" to "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-pose/model.tflite",
                    "metadataUrl" to "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-pose/metadata.json",
                    "fileSizeBytes" to 13510234L,
                    "version" to "1.0",
                    "format" to "litert"
                ),
                mapOf(
                    "id" to "yolov8n-seg",
                    "name" to "YOLOv8 Nano (Seg)",
                    "description" to "Real-time instance segmentation model.",
                    "taskType" to "instance_segmentation",
                    "fileUrl" to "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-seg/model.tflite",
                    "metadataUrl" to "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-seg/metadata.json",
                    "fileSizeBytes" to 13876205L,
                    "version" to "1.0",
                    "format" to "litert"
                )
            )

            modelsToSeed.forEach { m ->
                val mWithTimestamps = m.toMutableMap()
                mWithTimestamps["createdAt"] = now
                mWithTimestamps["updatedAt"] = now
                db.collection("models").document(m["id"] as String).set(mWithTimestamps).get()
            }

            // Seed Textbook: Mathematics for Machine Learning
            val textbookId = "textbook_mml"
            val textbook = mapOf(
                "id" to textbookId, 
                "title" to "Mathematics for Machine Learning", 
                "description" to "The fundamental mathematical tools needed to understand machine learning.", 
                "authors" to listOf("Marc Peter Deisenroth", "A. Aldo Faisal", "Cheng Soon Ong"), 
                "coverImageUrl" to "https://cdn.sequoia.ai/covers/mml-book.jpg",
                "pdfUrl" to "https://example.com/dummy.pdf",
                "sortOrder" to 1,
                "createdAt" to now,
                "updatedAt" to now
            )
            db.collection("textbooks").document(textbookId).set(textbook).get()


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
                    
                    "createdAt" to now,
                    "updatedAt" to now,
                    "publishedAt" to now
                )
            )
            cvArticles.forEach { article ->
                val slug = article["slug"] as String
                val metadata = article.filterKeys { it != "content" }
                val contents = mapOf(
                    "id" to slug,
                    "content" to article["content"],
                    
                )
                db.collection("articles").document(slug).set(metadata).get()
                db.collection("article_contents").document(slug).set(contents).get()
            }

            // Seed Rogue Anomalies
            val rogueId = "standalone_articles"
            val rogueArticlesData = listOf(
                mapOf(
                    "id" to "article_rogue_attention",
                    "title" to "Attention Is All You Need",
                    "slug" to "attention-paper",
                    "isPublished" to true,
                    "content" to "## Attention Is All You Need\n\nThis 2017 paper introduced the Transformer architecture.",
                    "summary" to "A breakdown of the Transformer architecture and self-attention mechanisms.",
                    "tags" to listOf("paper", "nlp", "transformers"),
                    
                    "createdAt" to now,
                    "updatedAt" to now,
                    "publishedAt" to now
                ),
                mapOf(
                    "id" to "article_rogue_resnet",
                    "title" to "Deep Residual Learning",
                    "slug" to "resnet-paper",
                    "isPublished" to true,
                    "content" to "## Deep Residual Learning\n\nResNet solves the vanishing gradient problem in ultra-deep networks.",
                    "summary" to "Understanding skip connections and how ResNet enables training of extremely deep networks.",
                    "tags" to listOf("paper", "cv", "resnet"),
                    
                    "createdAt" to now,
                    "updatedAt" to now,
                    "publishedAt" to now
                )
            )
            rogueArticlesData.forEach { article ->
                val slug = article["slug"] as String
                val metadata = article.filterKeys { it != "content" }
                val contents = mapOf(
                    "id" to slug,
                    "content" to article["content"],
                    
                )
                db.collection("articles").document(slug).set(metadata).get()
            }

            // Seed Cosmos Maps
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

            // Seed User Progress
            val userProgress = mapOf(
                "id" to userId,
                "userId" to userId,
                "completedArticleIds" to listOf(
                    "image-classification",
                    "attention-paper"
                ),
                "currentStreak" to 5,
                "longestStreak" to 12,
                "activeDates" to listOf("2026-07-27", "2026-07-28", "2026-07-29", "2026-07-30", "2026-07-31"),
                "lastActive" to System.currentTimeMillis()
            )
            db.collection("user_progress").document(userId).set(userProgress).get()
        }
        
        call.respondText("Database wiped and seeded with comprehensive English real-world data!")
    }
}
