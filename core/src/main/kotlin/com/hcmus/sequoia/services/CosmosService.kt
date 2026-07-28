package com.hcmus.sequoia.services

import com.hcmus.sequoia.models.*
import com.hcmus.sequoia.plugins.FirebaseConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class CosmosService {
    suspend fun getCosmosMap(mapId: String): CosmosMap? = withContext(Dispatchers.IO) {
        val doc = FirebaseConfig.firestore.collection("cosmos_maps").document(mapId).get().get()
        if (doc.exists()) {
            val m = doc.toObject(CosmosMap::class.java)
            m?.id = doc.id
            m
        } else null
    }

    suspend fun getUserProgress(userId: String): UserProgress = withContext(Dispatchers.IO) {
        val doc = FirebaseConfig.firestore.collection("user_progress").document(userId).get().get()
        
        if (doc.exists()) {
            val p = doc.toObject(UserProgress::class.java)
            p?.id = doc.id
            p ?: UserProgress(id = userId, userId = userId)
        } else {
            UserProgress(id = userId, userId = userId)
        }
    }

    suspend fun getProgressSummary(userId: String): ProgressSummary = withContext(Dispatchers.IO) {
        // 1. Get user progress
        val progress = getUserProgress(userId)
        val completedSet = progress.completedArticleIds.toSet()
        val decodingSet = progress.decodingArticleIds.toSet()

        // 2. Get all published articles in a single query
        val allArticles = FirebaseConfig.firestore.collection("articles")
            .whereEqualTo("isPublished", true)
            .get().get()
            .documents.map { doc ->
                val a = doc.toObject(Article::class.java)
                a.id = doc.id
                a
            }

        // 3. Group by textbook and calculate progress
        val textbookGroups = allArticles.filter { !it.textbookId.isNullOrEmpty() }.groupBy { it.textbookId!! }
        val textbookProgress = textbookGroups.mapValues { (_, articles) ->
            CategoryProgress(
                total = articles.size,
                completed = articles.count { it.id in completedSet },
                decoding = articles.count { it.id in decodingSet }
            )
        }

        // 4. Group by topic and calculate progress
        val topicGroups = allArticles.filter { !it.topicId.isNullOrEmpty() }.groupBy { it.topicId!! }
        val topicProgress = topicGroups.mapValues { (_, articles) ->
            CategoryProgress(
                total = articles.size,
                completed = articles.count { it.id in completedSet },
                decoding = articles.count { it.id in decodingSet }
            )
        }

        // 5. Standalone articles — determine status per article
        val standaloneArticles = allArticles.filter {
            it.textbookId.isNullOrEmpty() && it.topicId.isNullOrEmpty() && it.chapterId.isNullOrEmpty()
        }
        val standaloneStatus = standaloneArticles.associate { article ->
            article.id to when {
                article.id in completedSet -> "decoded"
                article.id in decodingSet -> "decoding"
                else -> "locked"
            }
        }

        ProgressSummary(
            textbooks = textbookProgress,
            topics = topicProgress,
            standalone = standaloneStatus
        )
    }
}
