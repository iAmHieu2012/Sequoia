package com.hcmus.sequoia.services

import com.hcmus.sequoia.models.*
import com.hcmus.sequoia.plugins.FirebaseConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

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

    suspend fun getChapters(textbookId: String): List<Chapter> = withContext(Dispatchers.IO) {
        val snapshot = FirebaseConfig.firestore.collection("chapters")
            .whereEqualTo("textbookId", textbookId)
            .orderBy("sortOrder")
            .get()
            .get()

        snapshot.documents.map { doc ->
            val chapter = doc.toObject(Chapter::class.java)
            chapter.id = doc.id
            chapter
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
            if (article.textbookId.isNullOrEmpty() && article.topicId.isNullOrEmpty() && article.chapterId.isNullOrEmpty()) {
                article
            } else {
                null
            }
        }
    }

    suspend fun getArticlesByChapter(chapterId: String): List<Article> = withContext(Dispatchers.IO) {
        val snapshot = FirebaseConfig.firestore.collection("articles")
            .whereEqualTo("chapterId", chapterId)
            .whereEqualTo("isPublished", true)
            .get()
            .get()

        snapshot.documents.map { doc ->
            val article = doc.toObject(Article::class.java)
            article.id = doc.id
            article
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
                chapterId = a.chapterId,
                topicId = a.topicId,
                textbookId = a.textbookId,
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
            val m = doc.toObject(AiModel::class.java)
            m?.id = doc.id
            m
        } else null
    }
}
