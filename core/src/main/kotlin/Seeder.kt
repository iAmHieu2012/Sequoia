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
 * This ensures that developers can instantly provision a mathematically structured graph of constellations 
 * (nodes, coordinates, connections) necessary to test the infinite canvas and LOD features of the Cosmos UI 
 * without manually constructing complex JSON objects.
 */
fun Route.configureSeeder() {
    get("/seed-database") {
        withContext(Dispatchers.IO) {
            val db = FirebaseConfig.firestore
            
            // Clear existing data to ensure a clean slate
            val collectionsToClear = listOf(
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
            
            // Seed Textbook
            val textbookId = "the-hundred-page-machine-learning-book"
            val textbook = mapOf(
                "id" to textbookId, 
                "title" to "The Hundred-Page Machine Learning Book", 
                "description" to "Kiến thức cốt lõi về Học máy.", 
                "authors" to listOf("Andriy Burkov"), 
                "sortOrder" to 1
            )
            
            db.collection("textbooks").document(textbookId).set(textbook).get()

            // Seed Chapters (3 Constellations)
            val ch1Id = "chapter-1"
            val ch2Id = "chapter-2"
            val ch3Id = "chapter-3"
            
            db.collection("chapters").document(ch1Id).set(
                mapOf(
                    "id" to ch1Id,
                    "textbookId" to textbookId,
                    "title" to "Foundation Sector",
                    "description" to "Basic paradigms of learning.",
                    "sortOrder" to 1,
                    "articleCount" to 5
                )
            ).get()
            
            db.collection("chapters").document(ch2Id).set(
                mapOf(
                    "id" to ch2Id,
                    "textbookId" to textbookId,
                    "title" to "Deep Neural Expanse",
                    "description" to "Advanced multi-layered architectures.",
                    "sortOrder" to 2,
                    "articleCount" to 4
                )
            ).get()
            
            db.collection("chapters").document(ch3Id).set(
                mapOf(
                    "id" to ch3Id,
                    "textbookId" to textbookId,
                    "title" to "Visual Cortex",
                    "description" to "Image processing and CNNs.",
                    "sortOrder" to 3,
                    "articleCount" to 3
                )
            ).get()

            // Seed Articles
            val articles = listOf(
                // Chapter 1
                mapOf(
                    "id" to "article-1-1",
                    "title" to "Machine Learning Basics",
                    "slug" to "ml-basics",
                    "chapterId" to ch1Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Nội dung",
                    "summary" to "Khái niệm cốt lõi."
                ),
                mapOf(
                    "id" to "article-1-2",
                    "title" to "Supervised Learning",
                    "slug" to "supervised-learning",
                    "chapterId" to ch1Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Nội dung",
                    "summary" to "Học có giám sát."
                ),
                mapOf(
                    "id" to "article-1-3",
                    "title" to "Unsupervised Learning",
                    "slug" to "unsupervised-learning",
                    "chapterId" to ch1Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Nội dung",
                    "summary" to "Học không giám sát."
                ),
                mapOf(
                    "id" to "article-1-4",
                    "title" to "Neural Networks",
                    "slug" to "neural-networks",
                    "chapterId" to ch1Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Nội dung",
                    "summary" to "Mạng nơ ron cơ bản."
                ),
                mapOf(
                    "id" to "article-1-5",
                    "title" to "Backpropagation",
                    "slug" to "backpropagation",
                    "chapterId" to ch1Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Nội dung",
                    "summary" to "Lan truyền ngược."
                ),
                // Chapter 2
                mapOf(
                    "id" to "article-2-1",
                    "title" to "Deep Neural Networks",
                    "slug" to "dnn",
                    "chapterId" to ch2Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Nội dung",
                    "summary" to "Mạng nơ ron sâu."
                ),
                mapOf(
                    "id" to "article-2-2",
                    "title" to "Activation Functions",
                    "slug" to "activation-functions",
                    "chapterId" to ch2Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Nội dung",
                    "summary" to "Hàm kích hoạt."
                ),
                mapOf(
                    "id" to "article-2-3",
                    "title" to "Vanishing Gradient",
                    "slug" to "vanishing-gradient",
                    "chapterId" to ch2Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Nội dung",
                    "summary" to "Vấn đề tiêu biến đạo hàm."
                ),
                mapOf(
                    "id" to "article-2-4",
                    "title" to "Transformers",
                    "slug" to "transformers",
                    "chapterId" to ch2Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Nội dung",
                    "summary" to "Kiến trúc Transformer."
                ),
                // Chapter 3
                mapOf(
                    "id" to "article-3-1",
                    "title" to "Computer Vision",
                    "slug" to "cv",
                    "chapterId" to ch3Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Nội dung",
                    "summary" to "Thị giác máy tính."
                ),
                mapOf(
                    "id" to "article-3-2",
                    "title" to "Convolutional Layers",
                    "slug" to "cnn-layers",
                    "chapterId" to ch3Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Nội dung",
                    "summary" to "Lớp tích chập."
                ),
                mapOf(
                    "id" to "article-3-3",
                    "title" to "YOLO Architecture",
                    "slug" to "yolo",
                    "chapterId" to ch3Id,
                    "textbookId" to textbookId,
                    "isPublished" to true,
                    "content" to "## Nội dung",
                    "summary" to "Kiến trúc YOLO."
                )
            )
            
            articles.forEach { article ->
                val slug = article["slug"] as String
                db.collection("articles").document(slug).set(article).get()
            }

            // Seed a Topic (Free Nebula)
            val topicId = "deep-learning-papers"
            val topic = mapOf(
                "id" to topicId,
                "name" to "Deep Learning Papers",
                "description" to "Phân tích các paper kinh điển.",
                "sortOrder" to 1
            )
            db.collection("topics").document(topicId).set(topic).get()

            // Seed Topic Articles (Rogue Anomalies / Free Nebulas)
            val topicArticles = listOf(
                mapOf(
                    "id" to "paper-attention",
                    "title" to "Attention Is All You Need",
                    "slug" to "attention-paper",
                    "topicId" to topicId,
                    "isPublished" to true,
                    "content" to "## Nội dung",
                    "summary" to "Phân tích paper Transformer."
                ),
                mapOf(
                    "id" to "paper-resnet",
                    "title" to "Deep Residual Learning",
                    "slug" to "resnet-paper",
                    "topicId" to topicId,
                    "isPublished" to true,
                    "content" to "## Nội dung",
                    "summary" to "Phân tích paper ResNet."
                )
            )
            topicArticles.forEach { article ->
                val slug = article["slug"] as String
                db.collection("articles").document(slug).set(article).get()
            }

            // Seed Cosmos Maps
            val mapNodes = listOf(
                // Cluster 1
                mapOf(
                    "articleId" to "ml-basics",
                    "title" to "Machine Learning Basics",
                    "celestialType" to "star",
                    "x" to 4500.0,
                    "y" to 4800.0,
                    "connections" to listOf("supervised-learning")
                ),
                mapOf(
                    "articleId" to "supervised-learning",
                    "title" to "Supervised Learning",
                    "celestialType" to "binary_star",
                    "x" to 5000.0,
                    "y" to 4500.0,
                    "connections" to listOf("unsupervised-learning", "neural-networks")
                ),
                mapOf(
                    "articleId" to "unsupervised-learning",
                    "title" to "Unsupervised Learning",
                    "celestialType" to "star",
                    "x" to 5200.0,
                    "y" to 5000.0,
                    "connections" to listOf("neural-networks")
                ),
                mapOf(
                    "articleId" to "neural-networks",
                    "title" to "Neural Networks",
                    "celestialType" to "star",
                    "x" to 5800.0,
                    "y" to 4600.0,
                    "connections" to listOf("backpropagation", "dnn")
                ),
                mapOf(
                    "articleId" to "backpropagation",
                    "title" to "Backpropagation",
                    "celestialType" to "anomaly",
                    "x" to 6200.0,
                    "y" to 4900.0,
                    "connections" to emptyList<String>()
                ),
                // Cluster 2
                mapOf(
                    "articleId" to "dnn",
                    "title" to "Deep Neural Networks",
                    "celestialType" to "star",
                    "x" to 7200.0,
                    "y" to 2800.0,
                    "connections" to listOf("activation-functions", "vanishing-gradient", "cv")
                ),
                mapOf(
                    "articleId" to "activation-functions",
                    "title" to "Activation Functions",
                    "celestialType" to "star",
                    "x" to 7000.0,
                    "y" to 2000.0,
                    "connections" to emptyList<String>()
                ),
                mapOf(
                    "articleId" to "vanishing-gradient",
                    "title" to "Vanishing Gradient",
                    "celestialType" to "anomaly",
                    "x" to 7800.0,
                    "y" to 2200.0,
                    "connections" to listOf("transformers")
                ),
                mapOf(
                    "articleId" to "transformers",
                    "title" to "Transformers",
                    "celestialType" to "nebula",
                    "x" to 8200.0,
                    "y" to 2800.0,
                    "connections" to emptyList<String>()
                ),
                // Cluster 3
                mapOf(
                    "articleId" to "cv",
                    "title" to "Computer Vision",
                    "celestialType" to "star",
                    "x" to 3000.0,
                    "y" to 7500.0,
                    "connections" to listOf("cnn-layers")
                ),
                mapOf(
                    "articleId" to "cnn-layers",
                    "title" to "Convolutional Layers",
                    "celestialType" to "star",
                    "x" to 2500.0,
                    "y" to 8200.0,
                    "connections" to listOf("yolo")
                ),
                mapOf(
                    "articleId" to "yolo",
                    "title" to "YOLO Architecture",
                    "celestialType" to "nebula",
                    "x" to 3200.0,
                    "y" to 8800.0,
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

            // Seed Topic Map (Free Nebula)
            val topicNodes = listOf(
                mapOf(
                    "articleId" to "attention-paper",
                    "title" to "Attention Is All You Need",
                    "celestialType" to "anomaly",
                    "x" to 9000.0,
                    "y" to 9000.0,
                    "connections" to listOf("resnet-paper")
                ),
                mapOf(
                    "articleId" to "resnet-paper",
                    "title" to "Deep Residual Learning",
                    "celestialType" to "anomaly",
                    "x" to 9500.0,
                    "y" to 9500.0,
                    "connections" to emptyList<String>()
                )
            )
            val topicMap = mapOf(
                "id" to topicId,
                "mapType" to "topic",
                "theme" to "nebula",
                "nodes" to topicNodes
            )
            db.collection("cosmos_maps").document(topicId).set(topicMap).get()

            // Seed Cosmos Progress
            val progressMap = mapOf(
                "ml-basics" to "decoded",
                "supervised-learning" to "decoded",
                "unsupervised-learning" to "decoded",
                "neural-networks" to "decoding",
                "backpropagation" to "locked",
                "dnn" to "locked",
                "activation-functions" to "locked",
                "vanishing-gradient" to "locked",
                "transformers" to "locked",
                "cv" to "locked",
                "cnn-layers" to "locked",
                "yolo" to "locked"
            )
            
            val cosmosProgress = mapOf(
                "id" to "mock-user-123_$textbookId",
                "userId" to "mock-user-123",
                "mapId" to textbookId,
                "progressMap" to progressMap
            )
            db.collection("cosmos_progress").document("mock-user-123_$textbookId").set(cosmosProgress).get()

            val topicProgress = mapOf(
                "id" to "mock-user-123_$topicId",
                "userId" to "mock-user-123",
                "mapId" to topicId,
                "progressMap" to mapOf(
                    "attention-paper" to "decoded",
                    "resnet-paper" to "decoding"
                )
            )
            db.collection("cosmos_progress").document("mock-user-123_$topicId").set(topicProgress).get()
        }
        
        call.respondText("Database wiped and seeded with MULTIPLE constellations!")
    }
}
