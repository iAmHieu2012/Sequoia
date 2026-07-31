package com.hcmus.sequoia.services

import com.hcmus.sequoia.models.*
import com.hcmus.sequoia.plugins.FirebaseConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Service class responsible for retrieving educational content such as Textbooks, Chapters, Topics, and Articles.
 * Connects to Firestore to fetch and aggregate data.
 */
class ContentService {
    suspend fun getTextbooks(): List<Textbook> = withContext(Dispatchers.IO) {
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

    suspend fun getModels(): List<AiModel> = withContext(Dispatchers.IO) {
        val snapshot = FirebaseConfig.firestore.collection("models")
            .get()
            .get()

        snapshot.documents.map { doc ->
            mapDocumentToAiModel(doc)
        }
    }

    suspend fun getStandaloneArticles(): List<Article> = withContext(Dispatchers.IO) {
        val snapshot = FirebaseConfig.firestore.collection("articles")
            .whereEqualTo("isPublished", true)
            .get()
            .get()

        snapshot.documents.mapNotNull { doc ->
            val article = doc.toObject(Article::class.java)
            article.id = doc.id
            if (article.topicId.isNullOrEmpty()) {
                article
            } else {
                null
            }
        }
    }

    suspend fun getTopics(): List<Topic> = withContext(Dispatchers.IO) {
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

    suspend fun getArticlesByTopic(topicId: String): List<Article> = withContext(Dispatchers.IO) {
        val snapshot = FirebaseConfig.firestore.collection("articles")
            .whereEqualTo("topicId", topicId)
            .whereEqualTo("isPublished", true)
            .get()
            .get()

        snapshot.documents.map { doc ->
            val article = doc.toObject(Article::class.java)
            article.id = doc.id
            article
        }
    }

    suspend fun searchArticles(query: String): List<Article> = withContext(Dispatchers.IO) {
        val articlesRef = FirebaseConfig.firestore.collection("articles")
        
        val titleFuture = articlesRef
            .whereEqualTo("isPublished", true)
            .whereGreaterThanOrEqualTo("title", query)
            .whereLessThan("title", query + "\uf8ff")
            .get()

        val tagsFuture = articlesRef
            .whereEqualTo("isPublished", true)
            .whereArrayContains("tags", query)
            .get()

        val titleDocs = titleFuture.get().documents
        val tagsDocs = tagsFuture.get().documents

        val combinedMap = mutableMapOf<String, Article>()
        
        (titleDocs + tagsDocs).forEach { doc ->
            if (!combinedMap.containsKey(doc.id)) {
                val article = doc.toObject(Article::class.java)
                article.id = doc.id
                combinedMap[doc.id] = article
            }
        }
        
        combinedMap.values.toList()
    }

    suspend fun getArticleDetail(slug: String): ArticleDetailResponse? = withContext(Dispatchers.IO) {
        val snapshot = FirebaseConfig.firestore.collection("articles")
            .whereEqualTo("slug", slug)
            .whereEqualTo("isPublished", true)
            .limit(1)
            .get()
            .get()

        snapshot.documents.firstOrNull()?.let { doc ->
            val a = doc.toObject(Article::class.java)
            a.id = doc.id
            
            val contentDoc = FirebaseConfig.firestore.collection("article_contents")
                .document(doc.id)
                .get()
                .get()
                
            val content = if (contentDoc.exists()) contentDoc.toObject(ArticleContent::class.java) else null
            
            ArticleDetailResponse(
                id = a.id,
                title = a.title,
                slug = a.slug,
                summary = a.summary,
                content = content?.content ?: "",
                topicId = a.topicId,
                playgroundBlocks = content?.playgroundBlocks ?: emptyList(),
                tags = a.tags,
                isPublished = a.isPublished,
                createdAt = a.createdAt,
                updatedAt = a.updatedAt,
                publishedAt = a.publishedAt
            )
        }
    }

    suspend fun getModel(id: String): AiModel? = withContext(Dispatchers.IO) {
        val doc = FirebaseConfig.firestore.collection("models").document(id).get().get()
        if (doc.exists()) {
            mapDocumentToAiModel(doc)
        } else null
    }

    private fun mapDocumentToAiModel(doc: com.google.cloud.firestore.DocumentSnapshot): AiModel {
        val configMap = doc.get("defaultConfig") as? Map<*, *>
        val mappedConfig = configMap?.entries?.associate { (k, v) ->
            k.toString() to v.toString()
        } ?: emptyMap()

        return AiModel(
            id = doc.id,
            name = doc.getString("name") ?: "",
            description = doc.getString("description") ?: "",
            taskType = doc.getString("taskType") ?: "",
            fileUrl = doc.getString("fileUrl") ?: "",
            fileSizeBytes = doc.getLong("fileSizeBytes") ?: 0L,
            version = doc.getString("version") ?: "1.0",
            format = doc.getString("format") ?: "litert",
            defaultConfig = mappedConfig,
            createdAt = doc.getLong("createdAt") ?: 0L,
            updatedAt = doc.getLong("updatedAt") ?: 0L
        )
    }
}
