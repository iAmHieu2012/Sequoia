package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Data Transfer Object representing the merged view of an Article and its Content.
 * Used for the GET /articles/:id endpoint.
 * 
 * @property id The Firestore document ID of the article.
 * @property title The title of the article.
 * @property summary A short summary of the article's content.
 * @property content The full markdown content of the article.
 * @property topicId The ID of the topic this article belongs to (if any).
 * @property tags A list of tags categorized with the article.
 * @property isPublished Whether the article is publicly accessible.
 * @property createdAt Timestamp when the article was first created.
 * @property updatedAt Timestamp when the article metadata or content was last updated.
 * @property publishedAt Timestamp when the article was published.
 */
@Serializable
data class ArticleDetailResponse(
    val id: String,
    val title: String,
    val summary: String,
    val content: String,
    val topicId: String?,
    val tags: List<String>,
    val isPublished: Boolean,
    val createdAt: Long,
    val updatedAt: Long,
    val publishedAt: Long
)

/**
 * Response payload for article progress updates (Mark Decoded / Revert Status).
 * Used to avoid `Map<String, Any>` serialization issues in kotlinx.serialization.
 * 
 * @property articleId The ID of the article being updated.
 * @property completed The new completion status of the article (true if decoded, false if reverted).
 */
@Serializable
data class ProgressResponse(
    val articleId: String,
    val completed: Boolean
)

/**
 * Data class representing the summarized progress of a user across all textbooks, topics, and standalone articles.
 *
 * @property topics Map of topic IDs to their respective progress statistics.
 * @property standalone Map of standalone article IDs to their completion status (true if completed).
 */
@Serializable
data class ProgressSummary(
    val topics: Map<String, CategoryProgress> = emptyMap(),
    val standalone: Map<String, Boolean> = emptyMap()
)

/**
 * Data class representing the progress of a specific category (Textbook or Topic).
 *
 * @property total Total number of articles in the category.
 * @property completed Number of articles the user has completed in the category.
 */
@Serializable
data class CategoryProgress(
    val total: Int = 0,
    val completed: Int = 0
)
