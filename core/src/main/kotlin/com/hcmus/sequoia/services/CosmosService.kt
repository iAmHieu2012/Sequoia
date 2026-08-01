package com.hcmus.sequoia.services

import com.hcmus.sequoia.models.*
import com.hcmus.sequoia.plugins.FirebaseConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

/**
 * Service class responsible for retrieving Cosmos Map layouts and calculating User Progress.
 * Calculates real-time progress summaries across the entire platform.
 */
class CosmosService {
    suspend fun getCosmosMap(mapId: String): CosmosMap? = withContext(Dispatchers.IO) {
        val doc = FirebaseConfig.firestore.collection("cosmos_maps").document(mapId).get().get()
        if (doc.exists()) {
            val m = doc.toObject(CosmosMap::class.java)
            m?.id = doc.id
            m
        } else null
    }

    suspend fun getUserProgress(userId: String, localDate: String? = null): UserProgress = withContext(Dispatchers.IO) {
        val docRef = FirebaseConfig.firestore.collection("user_progress").document(userId)
        val doc = docRef.get().get()
        
        var progress = if (doc.exists()) {
            val p = doc.toObject(UserProgress::class.java)
            p?.id = doc.id
            p ?: UserProgress(id = userId, userId = userId)
        } else {
            UserProgress(id = userId, userId = userId)
        }

        if (localDate != null) {
            val today = try {
                LocalDate.parse(localDate, DateTimeFormatter.ISO_LOCAL_DATE)
            } catch (e: Exception) {
                null
            }

            if (today != null) {
                val activeDates = progress.activeDates.toMutableList()
                if (activeDates.isEmpty() || activeDates.last() != localDate) {
                    var currentStreak = progress.currentStreak
                    var longestStreak = progress.longestStreak
                    
                    if (activeDates.isNotEmpty()) {
                        val lastDateStr = activeDates.last()
                        val lastDate = try {
                            LocalDate.parse(lastDateStr, DateTimeFormatter.ISO_LOCAL_DATE)
                        } catch(e: Exception) { null }
                        
                        if (lastDate != null) {
                            val daysBetween = ChronoUnit.DAYS.between(lastDate, today)
                            if (daysBetween == 1L) {
                                currentStreak += 1
                            } else if (daysBetween > 1L) {
                                currentStreak = 1
                            }
                            // if < 1, do nothing (time zone weirdness or already recorded)
                        } else {
                            currentStreak = 1
                        }
                    } else {
                        currentStreak = 1
                    }
                    
                    if (currentStreak > longestStreak) {
                        longestStreak = currentStreak
                    }
                    
                    if (!activeDates.contains(localDate)) {
                        activeDates.add(localDate)
                    }

                    progress = progress.copy(
                        currentStreak = currentStreak,
                        longestStreak = longestStreak,
                        activeDates = activeDates,
                        lastActive = System.currentTimeMillis()
                    )
                    
                    docRef.set(progress).get()
                }
            }
        }
        
        progress
    }

    suspend fun getProgressSummary(userId: String): ProgressSummary = withContext(Dispatchers.IO) {
        // 1. Get user progress
        val progress = getUserProgress(userId)
        val completedSet = progress.completedArticleIds.toSet()

        // 2. Get all published articles in a single query
        val allArticles = FirebaseConfig.firestore.collection("articles")
            .whereEqualTo("isPublished", true)
            .get().get()
            .documents.map { doc ->
                val a = doc.toObject(Article::class.java)
                a.id = doc.id
                a
            }

        // 3. (Removed Textbook Tracking for Cosmos Map)

        // 4. Group by topic and calculate progress
        val topicGroups = allArticles.filter { !it.topicId.isNullOrEmpty() }.groupBy { it.topicId!! }
        val topicProgress = topicGroups.mapValues { (_, articles) ->
            CategoryProgress(
                total = articles.size,
                completed = articles.count { it.id in completedSet }
            )
        }

        // 5. Standalone articles — determine status per article
        val standaloneArticles = allArticles.filter { it.topicId.isNullOrEmpty() }
        val standaloneStatus = standaloneArticles.associate { article ->
            article.id to (article.id in completedSet)
        }

        ProgressSummary(
            topics = topicProgress,
            standalone = standaloneStatus
        )
    }

    suspend fun toggleArticleCompletion(userId: String, articleId: String, completed: Boolean): Boolean = withContext(Dispatchers.IO) {
        val docRef = FirebaseConfig.firestore.collection("user_progress").document(userId)
        val doc = docRef.get().get()
        
        var progress = if (doc.exists()) {
            val p = doc.toObject(UserProgress::class.java)
            p?.id = doc.id
            p ?: UserProgress(id = userId, userId = userId)
        } else {
            UserProgress(id = userId, userId = userId)
        }

        val completedSet = progress.completedArticleIds.toMutableSet()
        if (completed) {
            completedSet.add(articleId)
        } else {
            completedSet.remove(articleId)
        }
        
        progress = progress.copy(completedArticleIds = completedSet.toList())
        docRef.set(progress).get()
        completed
    }
}
