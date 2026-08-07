package com.hcmus.sequoia.services

import com.hcmus.sequoia.models.*
import com.hcmus.sequoia.plugins.FirebaseConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Service class responsible for retrieving educational content such as Textbooks, Topics, and Articles.
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

    suspend fun getTextbook(id: String): Textbook? = withContext(Dispatchers.IO) {
        val doc = FirebaseConfig.firestore.collection("textbooks").document(id).get().get()
        if (doc.exists()) {
            val textbook = doc.toObject(Textbook::class.java)
            textbook?.id = doc.id
            textbook
        } else {
            null
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

    suspend fun getStandaloneArticles(includeDrafts: Boolean = false): List<Article> = withContext(Dispatchers.IO) {
        val query = FirebaseConfig.firestore.collection("articles")
        val snapshot = if (includeDrafts) query.get().get() else query.whereEqualTo("isPublished", true).get().get()

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

    suspend fun getArticlesByTopic(topicId: String, includeDrafts: Boolean = false): List<Article> = withContext(Dispatchers.IO) {
        val query = FirebaseConfig.firestore.collection("articles").whereEqualTo("topicId", topicId)
        val snapshot = if (includeDrafts) query.get().get() else query.whereEqualTo("isPublished", true).get().get()

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

    suspend fun getArticleDetail(articleId: String, includeDrafts: Boolean = false): ArticleDetailResponse? = withContext(Dispatchers.IO) {
        val doc = FirebaseConfig.firestore.collection("articles")
            .document(articleId)
            .get()
            .get()

        if (!doc.exists()) return@withContext null
        
        val a = doc.toObject(Article::class.java) ?: return@withContext null
        a.id = doc.id
        
        if (!a.isPublished && !includeDrafts) return@withContext null
            
        val contentDoc = FirebaseConfig.firestore.collection("article_contents")
            .document(doc.id)
            .get()
            .get()
                
        val content = if (contentDoc.exists()) contentDoc.toObject(ArticleContent::class.java) else null
            
        ArticleDetailResponse(
            id = a.id,
            title = a.title,
            summary = a.summary,
            content = content?.content ?: "",
            topicId = a.topicId,
            tags = a.tags,
            isPublished = a.isPublished,
            createdAt = a.createdAt,
            updatedAt = a.updatedAt,
            publishedAt = a.publishedAt
        )
    }

    suspend fun getModel(id: String): AiModel? = withContext(Dispatchers.IO) {
        val doc = FirebaseConfig.firestore.collection("models").document(id).get().get()
        if (doc.exists()) {
            mapDocumentToAiModel(doc)
        } else null
    }

    private fun mapDocumentToAiModel(doc: com.google.cloud.firestore.DocumentSnapshot): AiModel {
        return AiModel(
            id = doc.id,
            name = doc.getString("name") ?: "",
            description = doc.getString("description") ?: "",
            taskType = doc.getString("taskType") ?: "",
            fileUrl = doc.getString("fileUrl") ?: "",
            metadataUrl = doc.getString("metadataUrl") ?: "",
            fileSizeBytes = doc.getLong("fileSizeBytes") ?: 0L,
            version = doc.getString("version") ?: "1.0",
            format = doc.getString("format") ?: "litert",
            createdAt = doc.getLong("createdAt") ?: 0L,
            updatedAt = doc.getLong("updatedAt") ?: 0L
        )
    }

    suspend fun createArticle(id: String?, title: String, category: String, summary: String, content: String, tags: List<String>, x: Double, y: Double, connections: List<String>, celestialType: String, isPublished: Boolean): Article = withContext(Dispatchers.IO) {
        val docId = id ?: title.lowercase().replace(Regex("[^a-z0-9]+"), "-").trim('-')
        val now = System.currentTimeMillis()
        
        val articleRef = FirebaseConfig.firestore.collection("articles").document(docId)
        val existingDoc = articleRef.get().get()
        val isUpdate = existingDoc.exists()
        val oldTopicId = if (isUpdate) existingDoc.getString("topicId") else null
        
        val article = Article(
            id = docId,
            title = title,
            topicId = category.ifEmpty { null },
            summary = summary,
            tags = tags,
            isPublished = isPublished,
            createdAt = if (isUpdate) existingDoc.getLong("createdAt") ?: now else now,
            updatedAt = now,
            publishedAt = if (isUpdate) existingDoc.getLong("publishedAt") ?: now else now
        )
        
        val articleContent = ArticleContent(
            id = docId,
            content = content
        )

        // Save metadata and content
        articleRef.set(article).get()
        FirebaseConfig.firestore.collection("article_contents").document(docId).set(articleContent).get()

        // Update Cosmos Map
        val mapId = article.topicId ?: "standalone-articles"
        val mapRef = FirebaseConfig.firestore.collection("cosmos_maps").document(mapId)
        val mapDoc = mapRef.get().get()
        
        val cosmosNode = CosmosNode(
            articleId = docId,
            title = title,
            celestialType = celestialType,
            x = x,
            y = y,
            connections = connections
        )

        if (mapDoc.exists()) {
            val existingMap = mapDoc.toObject(CosmosMap::class.java)!!
            val updatedNodes = existingMap.nodes.filter { it.articleId != docId } + cosmosNode
            mapRef.set(existingMap.copy(nodes = updatedNodes)).get()
        } else if (mapId == "standalone-articles") {
            val newMap = CosmosMap(id = mapId, mapType = "rogue-anomalies", theme = "nebula", nodes = listOf(cosmosNode))
            mapRef.set(newMap).get()
        }
        
        // If topic changed during update, remove from old map
        if (isUpdate && oldTopicId != article.topicId) {
            val oldMapId = oldTopicId ?: "standalone-articles"
            val oldMapRef = FirebaseConfig.firestore.collection("cosmos_maps").document(oldMapId)
            val oldMapDoc = oldMapRef.get().get()
            if (oldMapDoc.exists()) {
                val oldMap = oldMapDoc.toObject(CosmosMap::class.java)!!
                val newNodes = oldMap.nodes.filter { it.articleId != docId }
                oldMapRef.set(oldMap.copy(nodes = newNodes)).get()
            }
        }

        // Update topic article count
        if (!isUpdate && article.topicId != null) {
            // New article in a topic
            val topicRef = FirebaseConfig.firestore.collection("topics").document(article.topicId)
            FirebaseConfig.firestore.runTransaction { transaction ->
                val topicDoc = transaction.get(topicRef).get()
                if (topicDoc.exists()) {
                    val currentCount = topicDoc.getLong("articleCount") ?: 0L
                    transaction.update(topicRef, "articleCount", currentCount + 1)
                }
                null
            }.get()
        } else if (isUpdate && oldTopicId != article.topicId) {
            // Topic changed
            if (oldTopicId != null) {
                val oldTopicRef = FirebaseConfig.firestore.collection("topics").document(oldTopicId)
                FirebaseConfig.firestore.runTransaction { transaction ->
                    val topicDoc = transaction.get(oldTopicRef).get()
                    if (topicDoc.exists()) {
                        val currentCount = topicDoc.getLong("articleCount") ?: 0L
                        if (currentCount > 0) transaction.update(oldTopicRef, "articleCount", currentCount - 1)
                    }
                    null
                }.get()
            }
            if (article.topicId != null) {
                val newTopicRef = FirebaseConfig.firestore.collection("topics").document(article.topicId)
                FirebaseConfig.firestore.runTransaction { transaction ->
                    val topicDoc = transaction.get(newTopicRef).get()
                    if (topicDoc.exists()) {
                        val currentCount = topicDoc.getLong("articleCount") ?: 0L
                        transaction.update(newTopicRef, "articleCount", currentCount + 1)
                    }
                    null
                }.get()
            }
        }

        article
    }

    suspend fun createTopic(id: String? = null, name: String, description: String, sortOrder: Int): Topic = withContext(Dispatchers.IO) {
        val topicId = id ?: name.lowercase().replace(Regex("[^a-z0-9]+"), "-").trim('-')
        val now = System.currentTimeMillis()
        
        val existingDoc = if (id != null) FirebaseConfig.firestore.collection("topics").document(topicId).get().get() else null
        
        val topic = Topic(
            id = topicId,
            name = name,
            description = description,
            articleCount = existingDoc?.getLong("articleCount")?.toInt() ?: 0,
            sortOrder = sortOrder,
            createdAt = existingDoc?.getLong("createdAt") ?: now
        )
        
        FirebaseConfig.firestore.collection("topics").document(topicId).set(topic).get()
        
        // Also ensure a cosmos_map exists for this topic
        val mapRef = FirebaseConfig.firestore.collection("cosmos_maps").document(topicId)
        if (!mapRef.get().get().exists()) {
            val newMap = CosmosMap(id = topicId, mapType = "topic", theme = "nebula", nodes = emptyList())
            mapRef.set(newMap).get()
        }
        
        topic
    }

    suspend fun createModel(id: String? = null, name: String, description: String, taskType: String, fileUrl: String, metadataUrl: String, version: String, format: String, fileSizeBytes: Long): AiModel = withContext(Dispatchers.IO) {
        val modelId = id ?: name.lowercase().replace(Regex("[^a-z0-9]+"), "-").trim('-')
        val now = System.currentTimeMillis()
        
        val model = AiModel(
            id = modelId,
            name = name,
            description = description,
            taskType = taskType,
            fileUrl = fileUrl,
            metadataUrl = metadataUrl,
            fileSizeBytes = fileSizeBytes,
            version = version,
            format = format,
            createdAt = now,
            updatedAt = now
        )
        
        FirebaseConfig.firestore.collection("models").document(modelId).set(model).get()
        model
    }

    suspend fun createTextbook(id: String? = null, title: String, description: String, authors: List<String>, coverImageUrl: String, pdfUrl: String, sortOrder: Int): Textbook = withContext(Dispatchers.IO) {
        val textbookId = id ?: title.lowercase().replace(Regex("[^a-z0-9]+"), "-").trim('-')
        val now = System.currentTimeMillis()
        
        val textbook = Textbook(
            id = textbookId,
            title = title,
            description = description,
            authors = authors,
            coverImageUrl = coverImageUrl,
            pdfUrl = pdfUrl,
            sortOrder = sortOrder,
            createdAt = now,
            updatedAt = now
        )
        
        FirebaseConfig.firestore.collection("textbooks").document(textbookId).set(textbook).get()
        textbook
    }

    suspend fun updateMapNodes(mapId: String, newNodes: List<CosmosNode>): Boolean = withContext(Dispatchers.IO) {
        val mapRef = FirebaseConfig.firestore.collection("cosmos_maps").document(mapId)
        val mapDoc = mapRef.get().get()
        if (mapDoc.exists()) {
            val existingMap = mapDoc.toObject(CosmosMap::class.java)!!
            
            mapRef.set(existingMap.copy(nodes = newNodes)).get()
            true
        } else {
            false
        }
    }

    suspend fun deleteArticle(id: String): Boolean = withContext(Dispatchers.IO) {
        val doc = FirebaseConfig.firestore.collection("articles").document(id).get().get()
        if (!doc.exists()) return@withContext false
        val article = doc.toObject(Article::class.java)

        FirebaseConfig.firestore.collection("articles").document(id).delete().get()
        FirebaseConfig.firestore.collection("article_contents").document(id).delete().get()
        
        val mapId = article?.topicId ?: "standalone-articles"
        val mapRef = FirebaseConfig.firestore.collection("cosmos_maps").document(mapId)
        val mapDoc = mapRef.get().get()
        if (mapDoc.exists()) {
            val map = mapDoc.toObject(CosmosMap::class.java)!!
            val newNodes = map.nodes.filter { it.articleId != id }
            mapRef.set(map.copy(nodes = newNodes)).get()
        }
        
        if (article?.topicId != null) {
            val topicRef = FirebaseConfig.firestore.collection("topics").document(article.topicId)
            FirebaseConfig.firestore.runTransaction { transaction ->
                val topicDoc = transaction.get(topicRef).get()
                if (topicDoc.exists()) {
                    val count = topicDoc.getLong("articleCount") ?: 0L
                    if (count > 0) transaction.update(topicRef, "articleCount", count - 1)
                }
                null
            }.get()
        }
        true
    }

    suspend fun deleteTopic(id: String): Boolean = withContext(Dispatchers.IO) {
        FirebaseConfig.firestore.collection("topics").document(id).delete().get()
        FirebaseConfig.firestore.collection("cosmos_maps").document(id).delete().get()
        true
    }

    suspend fun deleteModel(id: String): Boolean = withContext(Dispatchers.IO) {
        FirebaseConfig.firestore.collection("models").document(id).delete().get()
        true
    }

    suspend fun deleteTextbook(id: String): Boolean = withContext(Dispatchers.IO) {
        FirebaseConfig.firestore.collection("textbooks").document(id).delete().get()
        true
    }
}
