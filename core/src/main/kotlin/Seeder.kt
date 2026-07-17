package com.hcmus.sequoia

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

fun Route.configureSeeder() {
    get("/seed-database") {
        withContext(Dispatchers.IO) {
            val db = FirebaseConfig.firestore
            
            // Seed Textbooks
            val textbook1 = mapOf(
                "title" to "The Hundred-Page Machine Learning Book",
                "description" to "Đây là cuốn sách kinh điển, cô đọng kiến thức cốt lõi về Học máy (Machine Learning).",
                "authors" to listOf("Andriy Burkov"),
                "sortOrder" to 1
            )
            db.collection("textbooks").document("the-hundred-page-machine-learning-book").set(textbook1).get()

            // Seed Chapters
            val chapter1 = mapOf(
                "textbookId" to "the-hundred-page-machine-learning-book",
                "title" to "Chương 1: Giới thiệu chung",
                "description" to "Tổng quan về Machine Learning và ứng dụng thực tế.",
                "sortOrder" to 1,
                "articleCount" to 1
            )
            db.collection("chapters").document("chapter-1").set(chapter1).get()

            // Seed Articles
            val article1 = mapOf(
                "title" to "Machine Learning là gì?",
                "slug" to "machine-learning-la-gi",
                "content" to "## Machine Learning là gì?\n\nMachine learning (Học máy) là một lĩnh vực của trí tuệ nhân tạo...\n\nThử nghiệm model YOLO trực tiếp trên trình duyệt của bạn nhé:\n\n{{playground model=\"yolo-v8-nano\" mode=\"camera\" threshold=0.5}}",
                "summary" to "Khái niệm cơ bản về học máy và thị giác máy tính.",
                "chapterId" to "chapter-1",
                "topicId" to "topic-cv",
                "textbookId" to "the-hundred-page-machine-learning-book",
                "playgroundBlocks" to listOf(
                    mapOf("modelId" to "yolo-v8-nano", "position" to 1, "defaultConfig" to mapOf("threshold" to "0.5"))
                ),
                "tags" to listOf("AI", "ML", "Intro"),
                "isPublished" to true
            )
            db.collection("articles").document("article-1").set(article1).get()

            // Seed Topics
            val topic1 = mapOf(
                "name" to "Computer Vision",
                "description" to "Thị giác máy tính, phân tích và nhận diện hình ảnh.",
                "iconUrl" to "https://cdn-icons-png.flaticon.com/512/2083/2083236.png",
                "sortOrder" to 1,
                "articleCount" to 1
            )
            db.collection("topics").document("topic-cv").set(topic1).get()

            // Seed Models
            val model1 = mapOf(
                "name" to "YOLOv8 Nano",
                "description" to "Mô hình nhận diện vật thể nhẹ và nhanh (Object Detection).",
                "taskType" to "object_detection",
                "fileUrl" to "https://r2-storage.example.com/yolov8n.tflite",
                "format" to "litert"
            )
            db.collection("models").document("yolo-v8-nano").set(model1).get()
        }
        call.respondText("Database seeded successfully with dummy data!")
    }
}
